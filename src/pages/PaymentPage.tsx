import { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { createTransaction, generateDokuPayment, subscribeToTransaction, checkTransactionStatus, type PaymentStatusEvent, type ApiContextParams } from '../services/api';
import PaymentSuccessModal from '../components/PaymentSuccessModal';

export default function PaymentPage() {
    const navigate = useNavigate();
    const { state, getTotal, clearCart } = useCart();
    const [paymentStatus, setPaymentStatus] = useState<'loading' | 'pending' | 'success' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
    const [transactionId, setTransactionId] = useState<string | null>(null);
    const [successData, setSuccessData] = useState<PaymentStatusEvent['data'] | null>(null);

    const total = getTotal();

    // Create API context params from cart state
    const apiContext: ApiContextParams = useMemo(() => ({
        tenantId: state.tenantId,
        outletId: state.outletId,
        tableId: state.tableNumber,
        orderMode: state.orderMode
    }), [state.tenantId, state.outletId, state.tableNumber, state.orderMode]);

    // Create transaction and get DOKU URL on mount
    useEffect(() => {
        const initPayment = async () => {
            if (state.items.length === 0) {
                navigate('/cart');
                return;
            }

            // Build transaction items
            const transactionItems = state.items.map(item => {
                let itemPrice = item.product.price;
                if (item.size && item.product.sizes) {
                    const sizeOption = item.product.sizes.find(s => s.name === item.size);
                    if (sizeOption) {
                        itemPrice += sizeOption.priceAdd;
                    }
                }
                return {
                    productId: item.product.id,
                    productName: item.product.name,
                    quantity: item.quantity,
                    price: itemPrice,
                    notes: item.notes,
                    size: item.size
                };
            });

            // 1. Create Transaction Record
            const tableNum = state.tableNumber || '1';

            const response = await createTransaction({
                tableNumber: tableNum,
                tableId: tableNum,
                orderType: apiContext.orderMode || 'DINEIN',
                items: transactionItems,
                subtotal: total,
                tax: 0,
                total: total,
                paymentMethod: 'qris'
            }, apiContext);

            if (response.success && response.data) {
                // Set transaction ID for real-time updates
                if (response.data.id) {
                    setTransactionId(response.data.id);
                }

                // Get invoice number from response
                const txNumber = response.data.transactionNumber
                    || (response.data as any).invoice_number
                    || (response.data as any).invoiceNumber
                    || `INV-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

                console.log('Invoice Number:', txNumber);

                // 2. Generate DOKU Payment
                try {
                    const paymentResponse = await generateDokuPayment({
                        invoiceNumber: txNumber,
                        amount: total,
                        customerName: `Table ${tableNum}`
                    }, apiContext);

                    console.log('DOKU Response:', paymentResponse);

                    if (paymentResponse.success && paymentResponse.data) {
                        const dokuData = paymentResponse.data as any;
                        const checkoutUrl = dokuData.response?.payment?.url;

                        if (checkoutUrl) {
                            console.log('Setting DOKU checkout URL:', checkoutUrl);
                            setPaymentUrl(checkoutUrl);
                            setPaymentStatus('pending'); // Ready to show iframe
                        } else {
                            // Fallback logging
                            console.error('No checkout URL found in response', dokuData);
                            setErrorMessage('URL pembayaran tidak ditemukan dari DOKU');
                            setPaymentStatus('error');
                        }
                    } else {
                        setErrorMessage(paymentResponse.error || 'Gagal membuat pembayaran');
                        setPaymentStatus('error');
                    }
                } catch (err) {
                    console.error('Error calling payment gateway:', err);
                    setErrorMessage('Terjadi kesalahan saat menghubungi payment gateway');
                    setPaymentStatus('error');
                }
            } else {
                setErrorMessage(response.error || 'Gagal membuat transaksi');
                setPaymentStatus('error');
            }
        };

        if (!paymentUrl) {
            initPayment();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run once

    const handleRetry = () => {
        window.location.reload();
    };

    // Listen for payment status updates
    const eventSourceRef = useRef<EventSource | null>(null);
    // Stable reference for transaction processing status
    const isProcessingSuccess = useRef(false);
    const lastTransactionId = useRef<string | null>(null);

    useEffect(() => {
        if (!transactionId) return;

        // Reset success state if transaction ID changes (New Transaction)
        if (transactionId !== lastTransactionId.current) {
            console.log('[PaymentPage] New Transaction detected. Resetting success state.', transactionId);
            isProcessingSuccess.current = false;
            lastTransactionId.current = transactionId;
            // Also ensure success data is cleared
            setSuccessData(null);
        }

        // Prevent multiple connections or reconnections if already succeeded
        if (isProcessingSuccess.current || paymentStatus === 'success') {
            return;
        }

        console.log('[PaymentPage] Initializing SSE Subscription for:', transactionId);

        const eventSource = subscribeToTransaction(
            transactionId,
            (data) => {
                // EVENT 1: PAYMENT STATUS (CRITICAL)
                // If we receive this, the payment is CONFIRMED.
                console.log('[PaymentPage] ✅ Payment Status Event Received:', data);

                if (!isProcessingSuccess.current) {
                    isProcessingSuccess.current = true;
                    setSuccessData(data);
                    setPaymentStatus('success');
                    clearCart();

                    // Cleanup session immediately to prevent stale state on reload
                    sessionStorage.removeItem('activeTransactionId');
                }
            },
            (message) => {
                // EVENT 2: PAYMENT COMPLETED (OPTIONAL/CLOSING)
                console.log('[PaymentPage] ✅ Payment Cleanup Event:', message);

                // We just log this. The connection will be closed by the cleanup function
                // or when the component unmounts/updates.
                // We enforce closing here just to be clean.
                if (eventSourceRef.current) {
                    eventSourceRef.current.close();
                    eventSourceRef.current = null;
                }
            },
            (error) => {
                console.warn('[PaymentPage] SSE Error:', error);
            },
            apiContext
        );

        eventSourceRef.current = eventSource;

        // POLLING FALLBACK - Check status every 3 seconds to ensure we catch success
        // This is necessary because sometimes SSE might be blocked or delayed
        const pollInterval = setInterval(async () => {
            if (isProcessingSuccess.current) {
                clearInterval(pollInterval);
                return;
            }

            try {
                const statusRes = await checkTransactionStatus(transactionId, apiContext);

                if (statusRes.success && statusRes.data) {
                    const status = statusRes.data.status?.toUpperCase();
                    // Check for paid status (PAID or SUCCESS)
                    if (status === 'PAID' || status === 'SUCCESS') {
                        console.log('[PaymentPage] Polling detected success status:', status);

                        // Construct success data since polling might return less detailed data than SSE
                        const successPayload = {
                            invoiceNumber: statusRes.data.transactionNumber || 'INV-Unknown',
                            totalAmount: String(total), // Use local total converted to string
                            paymentMethod: 'QRIS',
                            paymentStatus: 'SUCCESS',
                            transactionStatus: 'PAID',
                            updatedAt: new Date().toISOString()
                        };

                        if (!isProcessingSuccess.current) {
                            console.log('[PaymentPage] Applying success state from polling');
                            isProcessingSuccess.current = true;
                            setSuccessData(successPayload);
                            setPaymentStatus('success');
                            clearCart();
                            sessionStorage.removeItem('activeTransactionId');
                            clearInterval(pollInterval);
                        }
                    }
                }
            } catch (err) {
                console.warn('[PaymentPage] Polling check failed:', err);
            }
        }, 3000);

        // Robust Cleanup
        return () => {
            console.log('[PaymentPage] Cleanup - closing SSE connection and polling');
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
            clearInterval(pollInterval);
        };
        // Dependency array is minimal to prevent re-subscriptions.
        // We do NOT include paymentStatus here to avoid breaking connection on state change.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transactionId, total]); // Added total to ensure polling uses correct amount

    const handleBackHome = () => {
        // Redirect to original URL with query params if available
        const originalUrl = sessionStorage.getItem('beetpos-original-url');
        if (originalUrl) {
            navigate(originalUrl);
        } else {
            navigate('/menu');
        }
    };


    const handleCloseIframe = () => {
        // User closed the payment popup. 
        // Redirect to original URL with query params
        const originalUrl = sessionStorage.getItem('beetpos-original-url');
        if (originalUrl) {
            navigate(originalUrl);
        } else {
            navigate('/menu');
        }
    };

    // SUCCESS STATE - Priority 1 (Always show if success, regardless of anything else)
    if (paymentStatus === 'success' && successData) {
        return (
            <PaymentSuccessModal
                data={successData}
                onClose={handleBackHome}
            />
        );
    }

    // LOADING STATE - Priority 2
    if (paymentStatus === 'loading') {
        return (
            <div className="payment-page">
                <div className="loading-container glass-card">
                    <div className="loading-spinner"></div>
                    <p>Memproses pembayaran...</p>
                </div>
            </div>
        );
    }

    // PENDING STATE - Priority 3 (Show Iframe)
    if (paymentStatus === 'pending' && paymentUrl) {
        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 9999,
                backgroundColor: '#fff',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{
                    padding: '10px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid #eee',
                    backgroundColor: '#fff',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}>
                    <span style={{ fontWeight: 600, fontSize: '1rem' }}>Pembayaran DOKU</span>
                    <button
                        onClick={handleCloseIframe}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '24px',
                            cursor: 'pointer',
                            color: '#333',
                            padding: '4px 8px',
                            borderRadius: '4px'
                        }}
                    >
                        ✕
                    </button>
                </div>
                <iframe
                    src={paymentUrl}
                    style={{
                        flex: 1,
                        width: '100%',
                        border: 'none'
                    }}
                    title="DOKU Payment"
                />
            </div>
        );
    }

    // Error state
    return (
        <div className="payment-page">
            <div className="payment-expired glass-card">
                <div className="expired-icon">❌</div>
                <h1>Terjadi Kesalahan</h1>
                <p>{errorMessage}</p>
                <div className="expired-actions">
                    <button className="retry-btn" onClick={handleRetry}>
                        Coba Lagi
                    </button>
                    <button className="cancel-btn" onClick={() => navigate('/cart')}>
                        Kembali ke Keranjang
                    </button>
                </div>
            </div>
        </div>
    );
}
