import type { Product } from '../types';

export const products: Product[] = [
    // Food Items
    {
        id: 'food-1',
        name: 'Nasi Goreng Spesial',
        description: 'Nasi goreng dengan telur, ayam, sayuran, dan bumbu rahasia khas Beetpos. Disajikan dengan kerupuk dan acar.',
        price: 35000,
        image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop',
        category: 'food',
        sizes: [
            { name: 'regular', label: 'Regular', priceAdd: 0 },
            { name: 'large', label: 'Large', priceAdd: 10000 }
        ]
    },
    {
        id: 'food-2',
        name: 'Mie Goreng Seafood',
        description: 'Mie goreng dengan udang, cumi, dan sayuran segar. Rasa pedas yang menggugah selera.',
        price: 40000,
        image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&h=300&fit=crop',
        category: 'food',
        sizes: [
            { name: 'regular', label: 'Regular', priceAdd: 0 },
            { name: 'large', label: 'Large', priceAdd: 12000 }
        ]
    },
    {
        id: 'food-3',
        name: 'Ayam Geprek',
        description: 'Ayam crispy digeprek dengan sambal bawang yang pedas. Dilengkapi nasi putih dan lalapan.',
        price: 28000,
        image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&h=300&fit=crop',
        category: 'food',
        sizes: [
            { name: 'level1', label: 'Level 1', priceAdd: 0 },
            { name: 'level2', label: 'Level 2', priceAdd: 2000 },
            { name: 'level3', label: 'Level 3', priceAdd: 4000 }
        ]
    },
    {
        id: 'food-4',
        name: 'Burger Premium',
        description: 'Burger dengan daging sapi premium, keju leleh, sayuran segar, dan saus spesial.',
        price: 45000,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
        category: 'food',
        sizes: [
            { name: 'single', label: 'Single Patty', priceAdd: 0 },
            { name: 'double', label: 'Double Patty', priceAdd: 20000 }
        ]
    },

    // Drink Items
    {
        id: 'drink-1',
        name: 'Es Teh Manis',
        description: 'Teh manis segar dengan es batu. Minuman klasik yang menyegarkan.',
        price: 8000,
        image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop',
        category: 'drink',
        sizes: [
            { name: 'S', label: 'Small', priceAdd: 0 },
            { name: 'M', label: 'Medium', priceAdd: 3000 },
            { name: 'L', label: 'Large', priceAdd: 5000 }
        ]
    },
    {
        id: 'drink-2',
        name: 'Jus Alpukat',
        description: 'Jus alpukat kental dengan susu dan cokelat. Creamy dan menyegarkan.',
        price: 18000,
        image: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400&h=300&fit=crop',
        category: 'drink',
        sizes: [
            { name: 'S', label: 'Small', priceAdd: 0 },
            { name: 'M', label: 'Medium', priceAdd: 5000 },
            { name: 'L', label: 'Large', priceAdd: 8000 }
        ]
    },
    {
        id: 'drink-3',
        name: 'Kopi Susu Gula Aren',
        description: 'Espresso dengan susu segar dan gula aren asli. Rasa manis alami yang nikmat.',
        price: 22000,
        image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop',
        category: 'drink',
        sizes: [
            { name: 'S', label: 'Small', priceAdd: 0 },
            { name: 'M', label: 'Medium', priceAdd: 5000 },
            { name: 'L', label: 'Large', priceAdd: 8000 }
        ]
    },
    {
        id: 'drink-4',
        name: 'Milkshake Oreo',
        description: 'Milkshake dengan es krim vanilla dan biskuit Oreo yang lembut.',
        price: 25000,
        image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=300&fit=crop',
        category: 'drink',
        sizes: [
            { name: 'S', label: 'Small', priceAdd: 0 },
            { name: 'M', label: 'Medium', priceAdd: 5000 },
            { name: 'L', label: 'Large', priceAdd: 10000 }
        ]
    },

    // Combo Items
    {
        id: 'combo-1',
        name: 'Paket Hemat 1',
        description: 'Nasi Goreng Spesial + Es Teh Manis + Kerupuk. Hemat hingga 15%!',
        price: 38000,
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop',
        category: 'combo'
    },
    {
        id: 'combo-2',
        name: 'Paket Couple',
        description: '2 Ayam Geprek + 2 Es Teh Manis + 2 Kerupuk. Cocok untuk berdua!',
        price: 65000,
        image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop',
        category: 'combo'
    },
    {
        id: 'combo-3',
        name: 'Paket Family',
        description: '2 Nasi Goreng + 2 Mie Goreng + 4 Es Teh + Kerupuk. Untuk keluarga!',
        price: 150000,
        image: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400&h=300&fit=crop',
        category: 'combo'
    }
];

export const getProductById = (id: string): Product | undefined => {
    return products.find(p => p.id === id);
};

export const getProductsByCategory = (category: string): Product[] => {
    if (category === 'all') return products;
    return products.filter(p => p.category === category);
};
