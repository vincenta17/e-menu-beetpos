import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function LandingPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setTable, state } = useCart();

    const tableNumber = searchParams.get('table') || state.tableNumber || '1';

    useEffect(() => {
        if (tableNumber) {
            setTable(tableNumber);
        }
    }, [tableNumber, setTable]);

    const handleStartOrder = () => {
        navigate('/menu');
    };

    return (
        <div className="landing-page">
            <div className="landing-background">
                <div className="bg-circle circle-1"></div>
                <div className="bg-circle circle-2"></div>
                <div className="bg-circle circle-3"></div>
            </div>

            <div className="landing-content">
                <div className="logo-container">
                    <div className="logo">
                        <span className="logo-icon">🍽️</span>
                        <h1 className="logo-text">Beetpos</h1>
                    </div>
                    <p className="tagline">Digital Menu Experience</p>
                </div>

                <div className="table-card glass-card">
                    <div className="table-icon">🪑</div>
                    <p className="table-label">Nomor Meja Anda</p>
                    <div className="table-number">{tableNumber}</div>
                </div>

                <button className="start-button" onClick={handleStartOrder}>
                    <span>Lihat Menu</span>
                    <svg className="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </button>

                <p className="footer-text">
                    Scan QR Code untuk memesan makanan & minuman
                </p>
            </div>
        </div>
    );
}
