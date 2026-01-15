import type { ProductSize } from '../types';

interface SizeSelectorProps {
    sizes: ProductSize[];
    selectedSize: string;
    onSizeChange: (size: string) => void;
}

export default function SizeSelector({ sizes, selectedSize, onSizeChange }: SizeSelectorProps) {
    const formatPriceAdd = (priceAdd: number) => {
        if (priceAdd === 0) return '';
        return `+${new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(priceAdd)}`;
    };

    return (
        <div className="size-selector">
            {sizes.map(size => (
                <button
                    key={size.name}
                    className={`size-option ${selectedSize === size.name ? 'selected' : ''}`}
                    onClick={() => onSizeChange(size.name)}
                >
                    <span className="size-label">{size.label}</span>
                    {size.priceAdd > 0 && (
                        <span className="size-price">{formatPriceAdd(size.priceAdd)}</span>
                    )}
                </button>
            ))}
        </div>
    );
}
