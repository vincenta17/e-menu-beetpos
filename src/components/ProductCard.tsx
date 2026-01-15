import type { ApiProduct } from '../services/api';

interface ProductCardProps {
    product: ApiProduct;
    onClick: () => void;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
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

    return (
        <div className="product-card glass-card" onClick={onClick}>
            <div className="card-image-container">
                {product.image ? (
                    <img
                        src={product.image}
                        alt={product.name || 'Product'}
                        className="card-image"
                        loading="lazy"
                    />
                ) : (
                    <div className="card-image-placeholder">📷</div>
                )}
                <div className="card-category-badge">
                    {getCategoryEmoji(product.category)}
                </div>
            </div>
            <div className="card-content">
                <h3 className="card-title">{product.name || 'Unnamed Product'}</h3>
                <p className="card-description">{product.description || ''}</p>
                <div className="card-footer">
                    <span className="card-price">{formatPrice(product.price)}</span>
                    <span className="card-action">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 8v8M8 12h8" />
                        </svg>
                    </span>
                </div>
            </div>
        </div>
    );
}
