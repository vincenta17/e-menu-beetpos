import { useState } from 'react';
import type { ApiProduct } from '../services/api';

interface QuickAddModalProps {
    product: ApiProduct;
    isOpen: boolean;
    onClose: () => void;
    onAdd: (notes: string, quantity: number) => void;
}

export default function QuickAddModal({ product, isOpen, onClose, onAdd }: QuickAddModalProps) {
    const [notes, setNotes] = useState('');
    const [quantity, setQuantity] = useState(1);

    if (!isOpen) return null;

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(price || 0);
    };

    const handleAdd = () => {
        onAdd(notes, quantity);
        setNotes('');
        setQuantity(1);
        onClose();
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="quick-add-modal glass-card">
                <button className="modal-close" onClick={onClose}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                </button>

                <div className="modal-product-info">
                    {product.image && (
                        <img src={product.image} alt={product.name} className="modal-product-image" />
                    )}
                    <div className="modal-product-details">
                        <h3 className="modal-product-name">{product.name}</h3>
                        <p className="modal-product-price">{formatPrice(product.price)}</p>
                    </div>
                </div>

                <div className="modal-form">
                    <label className="modal-label">Catatan (opsional)</label>
                    <textarea
                        className="modal-textarea"
                        placeholder="Contoh: tidak pedas, tanpa bawang..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                    />

                    <label className="modal-label">Jumlah</label>
                    <div className="modal-quantity">
                        <button
                            className="qty-btn"
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            disabled={quantity <= 1}
                        >
                            -
                        </button>
                        <span className="qty-value">{quantity}</span>
                        <button
                            className="qty-btn"
                            onClick={() => setQuantity(quantity + 1)}
                        >
                            +
                        </button>
                    </div>
                </div>

                <button className="modal-add-btn" onClick={handleAdd}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="9" cy="21" r="1" />
                        <circle cx="20" cy="21" r="1" />
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                    <span>Tambah ke Keranjang</span>
                    <span className="modal-total">{formatPrice(product.price * quantity)}</span>
                </button>
            </div>
        </div>
    );
}
