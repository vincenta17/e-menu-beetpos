import type { ApiCategory } from '../services/api';

interface CategoryTabsProps {
    categories: ApiCategory[];
    activeCategory: string | null;  // null = 'all', string = category ID
    onCategoryChange: (categoryId: string | null) => void;
    loading?: boolean;
}

export default function CategoryTabs({ categories, activeCategory, onCategoryChange, loading }: CategoryTabsProps) {
    if (loading) {
        return (
            <div className="category-tabs">
                <div className="tabs-container">
                    <div className="tab-button">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="category-tabs">
            <div className="tabs-container">
                {/* All categories button */}
                <button
                    className={`tab-button ${activeCategory === null ? 'active' : ''}`}
                    onClick={() => onCategoryChange(null)}
                >
                    <span className="tab-icon">🍴</span>
                    <span className="tab-label">Semua</span>
                </button>

                {/* Dynamic categories from API */}
                {categories.map(category => (
                    <button
                        key={category.id}
                        className={`tab-button ${activeCategory === category.id ? 'active' : ''}`}
                        onClick={() => onCategoryChange(category.id)}
                    >
                        <span className="tab-icon">{category.icon || '📦'}</span>
                        <span className="tab-label">{category.name}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
