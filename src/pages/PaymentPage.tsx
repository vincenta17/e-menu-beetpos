import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { createTransaction, generateDokuPayment, subscribeToTransaction, type PaymentStatusEvent } from '../services/api';
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
                orderType: 'DINEIN',
                items: transactionItems,
                subtotal: total,
                tax: 0,
                total: total,
                paymentMethod: 'qris'
            });

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
                    });

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
    const isPaymentSuccessRef = useRef(false);

    useEffect(() => {
        if (!transactionId) return;
        // Don't create new connection if already successful
        if (isPaymentSuccessRef.current) {
            console.log('[PaymentPage] Already successful, skipping SSE subscription');
            return;
        }
        // Also check if we already have an active connection
        if (eventSourceRef.current) {
            console.log('[PaymentPage] Already have active SSE connection, skipping');
            return;
        }

        console.log('[PaymentPage] Subscribing to transaction updates:', transactionId);

        const eventSource = subscribeToTransaction(
            transactionId,
            (data) => {
                console.log('[PaymentPage] ✅ Payment Status PAID received:', data);
                // Save data but DON'T close yet - wait for payment-completed
                setSuccessData(data);
                setPaymentStatus('success');
                clearCart();
            },
            (message) => {
                console.log('[PaymentPage] ✅ Payment Completed - NOW closing SSE:', message);
                isPaymentSuccessRef.current = true;
                // Close connection only after payment-completed
                eventSource.close();
                eventSourceRef.current = null;
            },
            (error) => {
                console.warn('[PaymentPage] SSE Connection issue:', error);
            }
        );

        eventSourceRef.current = eventSource;

        return () => {
            if (!isPaymentSuccessRef.current) {
                console.log('[PaymentPage] Cleanup - closing EventSource');
                eventSource.close();
                eventSourceRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transactionId]); // Only depend on transactionId

    const handleBackHome = () => {
        navigate('/');
    };


    const handleCloseIframe = () => {
        // User closed the payment popup. 
        // We can navigate back to cart or root, or just hide it? 
        // Request said: "jangan masuk ke payment success checkout doku", and "tombol close"
        // I'll assume navigating to home or cart is safest so they can restart or check status properly.
        navigate('/');
    };

    // Loading state - show while creating transaction
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

    // Pending state - Show Iframe if URL exists
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

    // Success state
    if (paymentStatus === 'success' && successData) {
        return (
            <PaymentSuccessModal
                data={successData}
                onClose={handleBackHome}
            />
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
