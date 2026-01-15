// API Service for E-Menu Beetpos

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// API Headers - Fill in your values here
const API_HEADERS = {
    'x-api-key': import.meta.env.VITE_API_KEY,
    'x-tenant-id': import.meta.env.VITE_TENANT_ID,
    'x-outlet-id': import.meta.env.VITE_OUTLET_ID,
    'Content-Type': 'application/json'
};

// API Response Types
export interface ApiCategory {
    id: string;
    name: string;
    icon?: string;
}

export interface ApiCategoriesResponse {
    data: ApiCategory[];
    message?: string;
    status?: string;
}

// Fetch categories from API
export async function fetchCategories(): Promise<ApiCategory[] | Error> {
    try {
        const response = await fetch(`${BASE_URL}/categories`, {
            method: 'GET',
            headers: API_HEADERS
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: ApiCategoriesResponse = await response.json();
        return result.data || [];
    } catch (error) {
        console.error('Error fetching categories:', error);
        return error instanceof Error ? error : new Error(String(error));
    }
}

// Product Types
export interface ApiProductSize {
    name: string;
    label: string;
    priceAdd: number;
}

export interface ApiProduct {
    id: number | string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    categoryId?: number;
    sizes?: ApiProductSize[];
}

export interface ApiProductsResponse {
    data: ApiProduct[];
    message?: string;
    status?: string;
}

// Fetch products from API
export interface ProductsQueryParams {
    page?: number;
    limit?: number;
    order?: 'asc' | 'desc';
    search?: string;
    categoryId?: string;
}

export async function fetchProducts(params?: ProductsQueryParams): Promise<ApiProduct[]> {
    try {
        // Build query string from params
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.order) queryParams.append('order', params.order);
        if (params?.search) queryParams.append('search', params.search);
        if (params?.categoryId) queryParams.append('categoryId', params.categoryId);

        const queryString = queryParams.toString();
        const url = `${BASE_URL}/products${queryString ? `?${queryString}` : ''}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: API_HEADERS
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: ApiProductsResponse = await response.json();
        return result.data || [];
    } catch (error) {
        console.error('Error fetching products:', error);
        // Return empty array if API fails - no fallback products
        return [];
    }
}

