import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartItemComponent from '../components/CartItem';

export default function CartPage() {
    const navigate = useNavigate();
    const { state, getTotal, clearCart } = useCart();

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(price);
    };

    const handleCheckout = () => {
        navigate('/checkout');
    };

    if (state.items.length === 0) {
        return (
            <div className="cart-page">
                <header className="cart-header glass-card">
                    <button className="back-nav" onClick={() => navigate(-1)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="header-title">Keranjang</h1>
                    <div className="header-spacer"></div>
                </header>

                <div className="empty-cart">
                    <div className="empty-icon">🛒</div>
                    <h2>Keranjang Kosong</h2>
                    <p>Anda belum menambahkan item apapun</p>
                    <button className="browse-menu-btn" onClick={() => navigate('/menu')}>
                        Lihat Menu
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <header className="cart-header glass-card">
                <button className="back-nav" onClick={() => navigate(-1)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                </button>
                <h1 className="header-title">Keranjang</h1>
                <button className="clear-cart-btn" onClick={clearCart}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3,6 5,6 21,6" />
                        <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6M8,6V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6" />
                    </svg>
                </button>
            </header>

            <div className="table-info glass-card">
                <span className="table-icon">🪑</span>
                <span>Meja {state.tableName || state.tableNumber}</span>
            </div>

            <div className="cart-items">
                {state.items.map((item, index) => (
                    <CartItemComponent key={`${item.product.id}-${item.size}-${index}`} item={item} />
                ))}
            </div>

            <div className="cart-summary glass-card">
                <div className="summary-row total">
                    <span>Total</span>
                    <span>{formatPrice(getTotal())}</span>
                </div>
            </div>

            <div className="checkout-container">
                <button className="checkout-btn" onClick={handleCheckout}>
                    <span>Checkout</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
