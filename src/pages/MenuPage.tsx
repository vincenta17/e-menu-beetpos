import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { fetchCategories, fetchProducts, type ApiCategory, type ApiProduct } from '../services/api';
import ProductCard from '../components/ProductCard';
import CategoryTabs from '../components/CategoryTabs';
import CartButton from '../components/CartButton';

export default function MenuPage() {
    const [activeCategory, setActiveCategory] = useState<string | null>(null); // null = all
    const [categories, setCategories] = useState<ApiCategory[]>([]);
    const [products, setProducts] = useState<ApiProduct[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const navigate = useNavigate();
    const { state } = useCart();

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Load categories on mount
    useEffect(() => {
        const loadCategories = async () => {
            setLoadingCategories(true);
            const categoriesData = await fetchCategories();
            // Check if result is an error
            if (categoriesData instanceof Error) {
                console.error('Failed to load categories:', categoriesData);
                setCategories([]);
            } else {
                setCategories(categoriesData);
            }
            setLoadingCategories(false);
        };
        loadCategories();
    }, []);

    // Load products when filters change
    const loadProducts = useCallback(async () => {
        setLoadingProducts(true);
        const productsData = await fetchProducts({
            page: 1,
            limit: 50,
            order: sortOrder,
            categoryId: activeCategory || undefined,
            search: debouncedSearch || undefined
        });
        setProducts(productsData);
        setLoadingProducts(false);
    }, [activeCategory, sortOrder, debouncedSearch]);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    const handleCategoryChange = (categoryId: string | null) => {
        setActiveCategory(categoryId);
    };

    const handleProductClick = (product: ApiProduct) => {
        navigate(`/product/${product.id}`);
    };

    const toggleSortOrder = () => {
        setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
    };

    return (
        <div className="menu-page">
            <header className="menu-header glass-card">
                <div className="header-content">
                    <div className="header-left">
                        <h1 className="header-title">Menu</h1>
                        <p className="header-subtitle">Meja #{state.tableNumber}</p>
                    </div>
                    <div className="header-logo">🍽️</div>
                </div>
            </header>

            {/* Search and Sort Controls */}
            <div className="filter-controls">
                <div className="search-container">
                    <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <path d="M21 21l-4.35-4.35" />
                    </svg>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Cari menu..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button
                            className="search-clear"
                            onClick={() => setSearchQuery('')}
                            aria-label="Clear search"
                        >
                            ✕
                        </button>
                    )}
                </div>
                <button className="sort-button" onClick={toggleSortOrder}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        {sortOrder === 'desc' ? (
                            <path d="M3 4h13M3 8h9M3 12h5M17 10v10M17 20l-3-3M17 20l3-3" />
                        ) : (
                            <path d="M3 4h5M3 8h9M3 12h13M17 4v10M17 4l-3 3M17 4l3 3" />
                        )}
                    </svg>
                    <span>{sortOrder === 'desc' ? 'Terbaru' : 'Terlama'}</span>
                </button>
            </div>

            <CategoryTabs
                categories={categories}
                activeCategory={activeCategory}
                onCategoryChange={handleCategoryChange}
                loading={loadingCategories}
            />

            <main className="menu-content">
                {loadingProducts ? (
                    <div className="loading-container">
                        <p>Memuat produk...</p>
                    </div>
                ) : products.length === 0 ? (
                    <div className="empty-container">
                        <p>{debouncedSearch ? `Tidak ditemukan hasil untuk "${debouncedSearch}"` : 'Tidak ada produk tersedia'}</p>
                    </div>
                ) : (
                    <div className="products-grid">
                        {products.map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onClick={() => handleProductClick(product)}
                            />
                        ))}
                    </div>
                )}
            </main>

            <CartButton />
        </div>
    );
}
