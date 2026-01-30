import { useState } from 'react';
import type { ApiProduct } from '../services/api';
import { useCart } from '../context/CartContext';
import QuickAddModal from './QuickAddModal';

interface ProductCardProps {
    product: ApiProduct;
    onClick: () => void;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
    const { addItem } = useCart();
    const [showModal, setShowModal] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Defensive check for missing product
    if (!product) return null;

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(price || 0);
    };

    const getCategoryEmoji = (category: string) => {
        if (!category) return '📦';
        const categoryLower = category.toLowerCase();
        if (categoryLower.includes('makanan') || categoryLower.includes('food')) return '🍽️';
        if (categoryLower.includes('minuman') || categoryLower.includes('drink')) return '🥤';
        if (categoryLower.includes('combo') || categoryLower.includes('paket')) return '🎁';
        return '📦';
    };

    // Get placeholder image - blank frame with category icon
    const getPlaceholderImage = () => {
        // Return a simple gray placeholder with icon
        return 'data:image/svg+xml,' + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
                <rect width="400" height="300" fill="#f0f0f0"/>
                <rect x="150" y="100" width="100" height="100" rx="10" fill="#e0e0e0"/>
                <path d="M185 130 L215 130 M200 115 L200 145" stroke="#bbb" stroke-width="4" stroke-linecap="round"/>
                <text x="200" y="230" font-family="Arial" font-size="14" fill="#999" text-anchor="middle">No Image</text>
            </svg>
        `.trim());
    };

    const productImage = product.image || getPlaceholderImage();

    const handleAddClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click
        setShowModal(true);
    };

    const handleAddToCart = (notes: string, quantity: number) => {
        // Convert ApiProduct to Product format for cart
        const cartProduct = {
            id: String(product.id),
            name: product.name,
            description: product.description,
            price: product.price,
            image: product.image,
            category: product.category as 'food' | 'drink' | 'combo',
            sizes: product.sizes
        };

        addItem(cartProduct, quantity, undefined, notes || undefined);

        // Show success indicator
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
    };

    const isPlaceholder = productImage.startsWith('data:image/svg+xml');

    return (
        <>
            <div className={`product-card glass-card ${isPlaceholder ? 'no-hover' : ''}`} onClick={(e) => {
                if (isPlaceholder) {
                    e.preventDefault();
                    // Optional: you can leave this empty to do nothing
                } else {
                    onClick();
                }
            }}>
                <div className="card-image-container">
                    <img
                        src={productImage}
                        alt={product.name || 'Product'}
                        className="card-image"
                        loading="lazy"
                        onClick={(e) => {
                            if (isPlaceholder) {
                                e.stopPropagation();
                            }
                        }}
                    />
                    <div className="card-category-badge">
                        {getCategoryEmoji(product.category)}
                    </div>
                    {showSuccess && (
                        <div className="card-success-badge">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <path d="M20 6L9 17l-5-5" />
                            </svg>
                        </div>
                    )}
                </div>
                <div className="card-content">
                    <h3 className="card-title">{product.name || 'Unnamed Product'}</h3>
                    <p className="card-description">{product.description || ''}</p>
                    <div className="card-footer">
                        <button className="card-add-btn capsule" onClick={handleAddClick}>
                            <span className="card-price-text">{formatPrice(product.price)}</span>
                            <div className="card-add-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M12 6v12M6 12h12" />
                                </svg>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            <QuickAddModal
                product={product}
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onAdd={handleAddToCart}
            />
        </>
    );
}
