import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import type { OrderMode } from '../types';
import { fetchCategories, fetchProducts, type ApiCategory, type ApiProduct, type ApiContextParams } from '../services/api';
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
    const [missingParams, setMissingParams] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { state, setQueryParams } = useCart();
    const hasSetParamsRef = useRef(false);
    const hasCheckedParamsRef = useRef(false);

    // Parse query parameters on initial load (only once)
    useEffect(() => {
        // Only check params once
        if (hasCheckedParamsRef.current) return;
        hasCheckedParamsRef.current = true;

        const tableParam = searchParams.get('table');
        const outletParam = searchParams.get('outlet');
        const tenantParam = searchParams.get('tenant');
        const modeParam = searchParams.get('mode');

        // If we have outlet and tenant from URL, set them and save to sessionStorage
        if (outletParam && tenantParam && modeParam) {
            const orderMode = (modeParam === 'DINEIN' || modeParam === 'TAKEAWAY') ? modeParam as OrderMode : 'DINEIN';
            // For DINEIN mode, table is taken from query parameter
            const tableNumber = orderMode === 'DINEIN' ? tableParam : null;
            setQueryParams(tableNumber, outletParam, tenantParam, orderMode);
            hasSetParamsRef.current = true;
            setMissingParams(false);

            // Save original URL to sessionStorage for redirect after payment
            const originalUrl = window.location.pathname + window.location.search;
            sessionStorage.setItem('beetpos-original-url', originalUrl);
        } else {
            // No params in URL - check if we have stored URL in sessionStorage
            const storedUrl = sessionStorage.getItem('beetpos-original-url');
            if (storedUrl) {
                // If we have a stored URL, redirect to it
                // Prevent infinite redirect loop if stored URL is same as current (should not happen if params check failed)
                if (storedUrl !== window.location.pathname + window.location.search) {
                    window.location.href = storedUrl; // Full reload to ensure state is clean
                    return;
                }
            }

            // Fallback: check stored context params
            if (state.tenantId && state.outletId) {
                // We have stored params from context, use them
                setMissingParams(false);
            } else {
                // No stored params anywhere - show warning
                console.warn('Missing required query parameters: outlet, tenant, mode');
                setMissingParams(true);
                setLoadingCategories(false);
                setLoadingProducts(false);
            }
        }
    }, [searchParams, setQueryParams, state.tenantId, state.outletId]);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Create API context params from cart state
    const apiContext: ApiContextParams = useMemo(() => ({
        tenantId: state.tenantId,
        outletId: state.outletId,
        tableId: state.tableNumber,
        orderMode: state.orderMode
    }), [state.tenantId, state.outletId, state.tableNumber, state.orderMode]);

    // Load categories when context is ready
    useEffect(() => {
        const loadCategories = async () => {
            if (!apiContext.tenantId || !apiContext.outletId) {
                // Wait for context to be set from URL params
                return;
            }
            setLoadingCategories(true);
            const categoriesData = await fetchCategories(apiContext);
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
    }, [apiContext]);

    // Load products when filters change
    const loadProducts = useCallback(async () => {
        if (!apiContext.tenantId || !apiContext.outletId) {
            // Wait for context to be set from URL params
            return;
        }
        setLoadingProducts(true);
        const productsData = await fetchProducts({
            page: 1,
            limit: 50,
            order: sortOrder,
            categoryId: activeCategory || undefined,
            search: debouncedSearch || undefined,
            ctx: apiContext
        });
        setProducts(productsData);
        setLoadingProducts(false);
    }, [activeCategory, sortOrder, debouncedSearch, apiContext]);

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

    // Show error if missing required params
    if (missingParams) {
        return (
            <div className="menu-page">
                <div className="error-container glass-card" style={{
                    padding: '2rem',
                    margin: '2rem',
                    textAlign: 'center',
                    backgroundColor: '#fff3cd',
                    border: '1px solid #ffc107',
                    borderRadius: '12px'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
                    <h2 style={{ color: '#856404', marginBottom: '0.5rem' }}>Parameter Tidak Lengkap</h2>
                    <p style={{ color: '#856404', marginBottom: '1rem' }}>
                        URL harus menyertakan parameter: <code>outlet</code>, <code>tenant</code>, dan <code>mode</code>
                    </p>
                    <p style={{ color: '#666', fontSize: '0.875rem' }}>
                        Contoh: /menu?table=xxx&amp;outlet=xxx&amp;tenant=xxx&amp;mode=DINEIN
                    </p>
                </div>
            </div>
        );
    }

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
