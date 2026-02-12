import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function CheckoutPage() {
    const navigate = useNavigate();
    const { state, getTotal } = useCart();
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [orderNotes, setOrderNotes] = useState('');

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(price);
    };

    const getItemPrice = (item: typeof state.items[0]) => {
        let price = item.product.price;
        if (item.size && item.product.sizes) {
            const sizeOption = item.product.sizes.find(s => s.name === item.size);
            if (sizeOption) {
                price += sizeOption.priceAdd;
            }
        }
        return price * item.quantity;
    };

    const handleProceedToPayment = () => {
        // You can save customer info to context or send to API here
        navigate('/payment');
    };

    if (state.items.length === 0) {
        navigate('/cart');
        return null;
    }

    return (
        <div className="checkout-page">
            <header className="checkout-header glass-card">
                <button className="back-nav" onClick={() => navigate(-1)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                </button>
                <h1 className="header-title">Checkout</h1>
                <div className="header-spacer"></div>
            </header>

            <div className="checkout-content">
                {/* Table Info */}
                {state.tableNumber && (
                    <div className="checkout-section glass-card table-info-section">
                        <span className="table-icon">🪑</span>
                        <span>Meja {state.tableName || state.tableNumber}</span>
                    </div>
                )}

                {/* Order Summary */}
                <div className="checkout-section glass-card">
                    <h2 className="section-title">
                        <span className="section-icon">🛒</span>
                        Ringkasan Pesanan
                    </h2>
                    <div className="order-items">
                        {state.items.map((item, index) => (
                            <div key={`${item.product.id}-${item.size}-${index}`} className="checkout-item">
                                <div className="item-qty">{item.quantity}x</div>
                                <div className="item-details">
                                    <span className="item-name">{item.product.name}</span>
                                    {item.size && <span className="item-size">({item.size})</span>}
                                    {item.notes && <span className="item-notes">📝 {item.notes}</span>}
                                </div>
                                <div className="item-price">{formatPrice(getItemPrice(item))}</div>
                            </div>
                        ))}
                    </div>
                    <div className="order-total-row">
                        <span>Total</span>
                        <span className="total-price">{formatPrice(getTotal())}</span>
                    </div>
                </div>

                {/* Customer Info */}
                <div className="checkout-section glass-card">
                    <h2 className="section-title">
                        <span className="section-icon">👤</span>
                        Informasi Pelanggan
                    </h2>
                    <div className="form-group">
                        <label className="form-label">Nama (opsional)</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Masukkan nama Anda"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">No. HP (opsional)</label>
                        <input
                            type="tel"
                            className="form-input"
                            placeholder="08xxxxxxxxxx"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                        />
                    </div>
                </div>

                {/* Additional Notes */}
                <div className="checkout-section glass-card">
                    <h2 className="section-title">
                        <span className="section-icon">📝</span>
                        Catatan Tambahan
                    </h2>
                    <textarea
                        className="form-textarea"
                        placeholder="Catatan untuk pesanan Anda..."
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                        rows={3}
                    />
                </div>

            </div>

            <div className="checkout-footer">
                <div className="checkout-total">
                    <span className="total-label">Total Pembayaran</span>
                    <span className="total-amount">{formatPrice(getTotal())}</span>
                </div>
                <button className="proceed-btn" onClick={handleProceedToPayment}>
                    <span>Lanjut ke Pembayaran</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
