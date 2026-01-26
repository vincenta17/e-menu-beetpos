import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById } from '../data/products';
import { useCart } from '../context/CartContext';
import SizeSelector from '../components/SizeSelector';

export default function ProductDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { addItem } = useCart();

    const product = getProductById(id || '');

    const [selectedSize, setSelectedSize] = useState(
        product?.sizes?.[0]?.name || ''
    );
    const [notes, setNotes] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [showSuccess, setShowSuccess] = useState(false);

    if (!product) {
        return (
            <div className="product-detail-page">
                <div className="not-found glass-card">
                    <h2>Produk tidak ditemukan</h2>
                    <button onClick={() => navigate(-1)} className="back-button">
                        Kembali ke Menu
                    </button>
                </div>
            </div>
        );
    }

    const getPrice = () => {
        let price = product.price;
        if (selectedSize && product.sizes) {
            const sizeOption = product.sizes.find(s => s.name === selectedSize);
            if (sizeOption) {
                price += sizeOption.priceAdd;
            }
        }
        return price * quantity;
    };

    const handleAddToCart = () => {
        addItem(product, quantity, selectedSize || undefined, notes || undefined);
        setShowSuccess(true);
        setTimeout(() => {
            setShowSuccess(false);
            navigate('/menu');
        }, 1500);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(price);
    };

    return (
        <div className="product-detail-page">
            {showSuccess && (
                <div className="success-toast">
                    <span className="success-icon">✓</span>
                    <span>Ditambahkan ke keranjang!</span>
                </div>
            )}

            <button className="back-nav" onClick={() => navigate(-1)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                <span>Kembali</span>
            </button>

            <div className="product-image-container">
                <img
                    src={product.image}
                    alt={product.name}
                    className="product-image"
                />
                <div className="image-overlay"></div>
            </div>

            <div className="product-info glass-card">
                <div className="product-header">
                    <h1 className="product-name">{product.name}</h1>
                    <span className="product-category">{product.category}</span>
                </div>

                <p className="product-description">{product.description}</p>

                {product.sizes && product.sizes.length > 0 && (
                    <div className="size-section">
                        <h3 className="section-title">Pilih Ukuran</h3>
                        <SizeSelector
                            sizes={product.sizes}
                            selectedSize={selectedSize}
                            onSizeChange={setSelectedSize}
                        />
                    </div>
                )}

                <div className="notes-section">
                    <h3 className="section-title">Catatan</h3>
                    <textarea
                        className="notes-input"
                        placeholder="Tambahkan catatan khusus... (contoh: tidak pedas, tanpa bawang)"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                    />
                </div>

                <div className="quantity-section">
                    <h3 className="section-title">Jumlah</h3>
                    <div className="quantity-control">
                        <button
                            className="qty-btn"
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            disabled={quantity <= 1}
                        >
                            −
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
            </div>

            <div className="add-to-cart-container">
                <div className="price-display">
                    <span className="price-label">Total</span>
                    <span className="price-value">{formatPrice(getPrice())}</span>
                </div>
                <button className="add-to-cart-btn" onClick={handleAddToCart}>
                    <span>Tambah ke Keranjang</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="9" cy="21" r="1" />
                        <circle cx="20" cy="21" r="1" />
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
