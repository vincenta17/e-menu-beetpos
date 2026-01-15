import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function PaymentPage() {
    const navigate = useNavigate();
    const { state, getTotal, clearCart } = useCart();
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
    const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'expired'>('pending');

    const totalWithTax = getTotal() * 1.1;

    useEffect(() => {
        if (paymentStatus !== 'pending') return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    setPaymentStatus('expired');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [paymentStatus]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(price);
    };

    const handleSimulatePayment = () => {
        setPaymentStatus('success');
        setTimeout(() => {
            clearCart();
        }, 2000);
    };

    const handleBackToMenu = () => {
        clearCart();
        navigate('/menu');
    };

    const handleRetry = () => {
        setTimeLeft(300);
        setPaymentStatus('pending');
    };

    if (paymentStatus === 'success') {
        return (
            <div className="payment-page">
                <div className="payment-success glass-card">
                    <div className="success-animation">
                        <div className="success-circle">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <path d="M20 6L9 17l-5-5" />
                            </svg>
                        </div>
                    </div>
                    <h1>Pembayaran Berhasil!</h1>
                    <p>Terima kasih atas pesanan Anda</p>
                    <div className="order-info">
                        <p>Meja #{state.tableNumber}</p>
                        <p className="order-total">{formatPrice(totalWithTax)}</p>
                    </div>
                    <p className="order-note">Pesanan sedang disiapkan...</p>
                    <button className="back-menu-btn" onClick={handleBackToMenu}>
                        Kembali ke Menu
                    </button>
                </div>
            </div>
        );
    }

    if (paymentStatus === 'expired') {
        return (
            <div className="payment-page">
                <div className="payment-expired glass-card">
                    <div className="expired-icon">⏰</div>
                    <h1>Waktu Habis</h1>
                    <p>QR Code pembayaran telah kedaluwarsa</p>
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

    return (
        <div className="payment-page">
            <header className="payment-header glass-card">
                <button className="back-nav" onClick={() => navigate('/cart')}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                </button>
                <h1 className="header-title">Pembayaran QRIS</h1>
                <div className="header-spacer"></div>
            </header>

            <div className="payment-content">
                <div className="qr-container glass-card">
                    <div className="qr-header">
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/QRIS_logo.svg/1200px-QRIS_logo.svg.png"
                            alt="QRIS"
                            className="qris-logo"
                        />
                    </div>

                    <div className="qr-code">
                        {/* Demo QR Code - In production, this would be generated dynamically */}
                        <svg viewBox="0 0 200 200" className="qr-svg">
                            <rect x="10" y="10" width="40" height="40" fill="#1a1a2e" />
                            <rect x="15" y="15" width="30" height="30" fill="white" />
                            <rect x="20" y="20" width="20" height="20" fill="#1a1a2e" />

                            <rect x="150" y="10" width="40" height="40" fill="#1a1a2e" />
                            <rect x="155" y="15" width="30" height="30" fill="white" />
                            <rect x="160" y="20" width="20" height="20" fill="#1a1a2e" />

                            <rect x="10" y="150" width="40" height="40" fill="#1a1a2e" />
                            <rect x="15" y="155" width="30" height="30" fill="white" />
                            <rect x="20" y="160" width="20" height="20" fill="#1a1a2e" />

                            {/* Random pattern for demo */}
                            <rect x="60" y="10" width="10" height="10" fill="#1a1a2e" />
                            <rect x="80" y="10" width="10" height="10" fill="#1a1a2e" />
                            <rect x="100" y="10" width="10" height="10" fill="#1a1a2e" />
                            <rect x="120" y="10" width="10" height="10" fill="#1a1a2e" />

                            <rect x="60" y="30" width="10" height="10" fill="#1a1a2e" />
                            <rect x="90" y="30" width="10" height="10" fill="#1a1a2e" />
                            <rect x="110" y="30" width="10" height="10" fill="#1a1a2e" />
                            <rect x="130" y="30" width="10" height="10" fill="#1a1a2e" />

                            <rect x="10" y="60" width="10" height="10" fill="#1a1a2e" />
                            <rect x="30" y="60" width="10" height="10" fill="#1a1a2e" />
                            <rect x="60" y="60" width="10" height="10" fill="#1a1a2e" />
                            <rect x="80" y="60" width="10" height="10" fill="#1a1a2e" />
                            <rect x="100" y="60" width="10" height="10" fill="#1a1a2e" />
                            <rect x="120" y="60" width="10" height="10" fill="#1a1a2e" />
                            <rect x="150" y="60" width="10" height="10" fill="#1a1a2e" />
                            <rect x="180" y="60" width="10" height="10" fill="#1a1a2e" />

                            <rect x="10" y="80" width="10" height="10" fill="#1a1a2e" />
                            <rect x="40" y="80" width="10" height="10" fill="#1a1a2e" />
                            <rect x="70" y="80" width="10" height="10" fill="#1a1a2e" />
                            <rect x="90" y="80" width="10" height="10" fill="#1a1a2e" />
                            <rect x="110" y="80" width="10" height="10" fill="#1a1a2e" />
                            <rect x="140" y="80" width="10" height="10" fill="#1a1a2e" />
                            <rect x="160" y="80" width="10" height="10" fill="#1a1a2e" />
                            <rect x="180" y="80" width="10" height="10" fill="#1a1a2e" />

                            <rect x="60" y="100" width="80" height="10" fill="#1a1a2e" />

                            <rect x="10" y="120" width="10" height="10" fill="#1a1a2e" />
                            <rect x="40" y="120" width="10" height="10" fill="#1a1a2e" />
                            <rect x="70" y="120" width="10" height="10" fill="#1a1a2e" />
                            <rect x="90" y="120" width="10" height="10" fill="#1a1a2e" />
                            <rect x="110" y="120" width="10" height="10" fill="#1a1a2e" />
                            <rect x="140" y="120" width="10" height="10" fill="#1a1a2e" />
                            <rect x="160" y="120" width="10" height="10" fill="#1a1a2e" />
                            <rect x="180" y="120" width="10" height="10" fill="#1a1a2e" />

                            <rect x="60" y="150" width="10" height="10" fill="#1a1a2e" />
                            <rect x="80" y="150" width="10" height="10" fill="#1a1a2e" />
                            <rect x="100" y="150" width="10" height="10" fill="#1a1a2e" />
                            <rect x="120" y="150" width="10" height="10" fill="#1a1a2e" />
                            <rect x="150" y="150" width="10" height="10" fill="#1a1a2e" />
                            <rect x="170" y="150" width="10" height="10" fill="#1a1a2e" />

                            <rect x="60" y="170" width="10" height="10" fill="#1a1a2e" />
                            <rect x="90" y="170" width="10" height="10" fill="#1a1a2e" />
                            <rect x="110" y="170" width="10" height="10" fill="#1a1a2e" />
                            <rect x="130" y="170" width="10" height="10" fill="#1a1a2e" />
                            <rect x="160" y="180" width="10" height="10" fill="#1a1a2e" />
                            <rect x="180" y="180" width="10" height="10" fill="#1a1a2e" />
                        </svg>
                    </div>

                    <div className="payment-amount">
                        <span className="amount-label">Total Pembayaran</span>
                        <span className="amount-value">{formatPrice(totalWithTax)}</span>
                    </div>

                    <div className="timer-container">
                        <span className="timer-label">Berlaku dalam</span>
                        <span className={`timer-value ${timeLeft < 60 ? 'warning' : ''}`}>
                            {formatTime(timeLeft)}
                        </span>
                    </div>
                </div>

                <div className="payment-instructions glass-card">
                    <h3>Cara Pembayaran:</h3>
                    <ol>
                        <li>Buka aplikasi e-wallet atau m-banking Anda</li>
                        <li>Pilih menu Scan/Pay dengan QRIS</li>
                        <li>Scan QR Code di atas</li>
                        <li>Konfirmasi pembayaran</li>
                    </ol>
                </div>

                {/* Demo: Simulate payment button */}
                <button className="simulate-payment-btn" onClick={handleSimulatePayment}>
                    [Demo] Simulasi Pembayaran Berhasil
                </button>
            </div>
        </div>
    );
}
