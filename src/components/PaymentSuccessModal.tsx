// import { useNavigate } from 'react-router-dom';

interface PaymentSuccessModalProps {
    data: {
        invoiceNumber: string;
        totalAmount: string | number;
        paymentMethod: string;
        paymentStatus: string;
        transactionStatus: string;
        updatedAt: string;
    };
    onClose?: () => void;
}

export default function PaymentSuccessModal({ data, onClose }: PaymentSuccessModalProps) {
    //  const navigate = useNavigate();

    const handleBackHome = () => {
        if (onClose) {
            onClose();
        }
        // distinct navigate removed to rely on parent's onClose behavior
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 10000,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div className="payment-success glass-card" style={{
                backgroundColor: 'white',
                padding: '30px',
                borderRadius: '16px',
                textAlign: 'center',
                maxWidth: '400px',
                width: '100%',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
            }}>
                <div className="success-icon" style={{
                    fontSize: '3rem',
                    marginBottom: '1rem',
                    textAlign: 'center',
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    backgroundColor: '#e8f5e9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem auto'
                }}>✅</div>
                <h1 style={{ marginBottom: '10px', color: '#333' }}>Pembayaran Berhasil!</h1>
                <p style={{ color: '#666', marginBottom: '20px' }}>Terima kasih, pesanan Anda telah kami terima.</p>

                <div style={{
                    backgroundColor: '#f8f9fa',
                    padding: '15px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    textAlign: 'left'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ color: '#888', fontSize: '0.9rem' }}>No. Invoice</span>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{data.invoiceNumber || '-'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ color: '#888', fontSize: '0.9rem' }}>Metode</span>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{data.paymentMethod || '-'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ color: '#888', fontSize: '0.9rem' }}>Waktu</span>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                            {data.updatedAt ? new Date(data.updatedAt).toLocaleTimeString() : '-'}
                        </span>
                    </div>
                    <div style={{ borderTop: '1px solid #eee', margin: '10px 0' }}></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#333', fontWeight: 600 }}>Total</span>
                        <span style={{ color: '#4CAF50', fontWeight: 700 }}>
                            Rp {Number(data.totalAmount).toLocaleString()}
                        </span>
                    </div>
                </div>

                <button
                    className="confirm-btn"
                    onClick={handleBackHome}
                    style={{
                        width: '100%',
                        padding: '14px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: '0 4px 6px rgba(76, 175, 80, 0.2)'
                    }}
                >
                    Kembali ke Menu
                </button>
            </div>
        </div>
    );
}
