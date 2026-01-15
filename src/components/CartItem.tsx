import type { CartItem as CartItemType } from '../types';
import { useCart } from '../context/CartContext';

interface CartItemProps {
    item: CartItemType;
}

export default function CartItemComponent({ item }: CartItemProps) {
    const { updateQuantity, removeItem } = useCart();

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(price);
    };

    const getItemPrice = () => {
        let price = item.product.price;
        if (item.size && item.product.sizes) {
            const sizeOption = item.product.sizes.find(s => s.name === item.size);
            if (sizeOption) {
                price += sizeOption.priceAdd;
            }
        }
        return price;
    };

    const getSizeLabel = () => {
        if (!item.size || !item.product.sizes) return '';
        const sizeOption = item.product.sizes.find(s => s.name === item.size);
        return sizeOption?.label || item.size;
    };

    return (
        <div className="cart-item glass-card">
            <div className="cart-item-image">
                <img src={item.product.image} alt={item.product.name} />
            </div>

            <div className="cart-item-details">
                <h3 className="cart-item-name">{item.product.name}</h3>
                {item.size && (
                    <span className="cart-item-size">{getSizeLabel()}</span>
                )}
                {item.notes && (
                    <p className="cart-item-notes">📝 {item.notes}</p>
                )}
                <span className="cart-item-price">{formatPrice(getItemPrice())}</span>
            </div>

            <div className="cart-item-actions">
                <div className="quantity-control">
                    <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
                    >
                        −
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
                    >
                        +
                    </button>
                </div>
                <button
                    className="remove-btn"
                    onClick={() => removeItem(item.product.id, item.size)}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3,6 5,6 21,6" />
                        <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6M8,6V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
