// API Service for E-Menu Beetpos
import type { Product, OrderMode } from '../types';

// API Configuration
const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

// Context params interface
export interface ApiContextParams {
    tenantId: string | null;
    outletId: string | null;
    tableId?: string | null;
    orderMode?: OrderMode | null;
}

// Headers - now accepts context params with fallback to ENV
const getHeaders = (ctx?: ApiContextParams) => ({
    'x-api-key': API_KEY,
    'x-tenant-id': ctx?.tenantId || import.meta.env.VITE_TENANT_ID || '',
    'x-outlet-id': ctx?.outletId || import.meta.env.VITE_OUTLET_ID || '',
    'Content-Type': 'application/json'
});

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
export async function fetchCategories(ctx?: ApiContextParams): Promise<ApiCategory[] | Error> {
    try {
        const response = await fetch(`${BASE_URL}/categories`, {
            method: 'GET',
            headers: getHeaders(ctx)
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
// Table Types
export interface ApiTable {
    id: string;
    name?: string;
    table_number?: string;
    number?: string;
    description?: string;
    status?: string;
}

export interface ApiTableResponse {
    data: ApiTable;
    message?: string;
    status?: string;
}

// Fetch table details
export async function fetchTable(id: string, ctx?: ApiContextParams): Promise<ApiTable | null> {
    try {
        const response = await fetch(`${BASE_URL}/tables/${id}`, {
            method: 'GET',
            headers: getHeaders(ctx)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: ApiTableResponse = await response.json();
        return result.data;
    } catch (error) {
        console.error('Error fetching table:', error);
        return null;
    }
}

// Product Types
export interface ApiProductSize {
    name: string;
    label: string;
    priceAdd: number;
}

export interface ApiProduct extends Product {
    categoryId?: number; // Optional
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
    ctx?: ApiContextParams;
}

export async function fetchProducts(params?: ProductsQueryParams): Promise<ApiProduct[]> {
    try {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.order) queryParams.append('order', params.order);
        if (params?.search) queryParams.append('search', params.search);
        if (params?.categoryId && params.categoryId !== 'all') queryParams.append('categoryId', params.categoryId);

        const queryString = queryParams.toString();
        const url = `${BASE_URL}/products${queryString ? `?${queryString}` : ''}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: getHeaders(params?.ctx)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: ApiProductsResponse = await response.json();
        return result.data || [];
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

// Transaction Types
export interface TransactionItem {
    productId: number | string;
    productName: string;
    quantity: number;
    price: number;
    notes?: string;
    size?: string;
}

export interface CreateTransactionRequest {
    tableNumber?: string;
    tableId?: string; // Required by API
    orderType?: 'DINEIN' | 'TAKEAWAY'; // Required by API
    items: TransactionItem[];
    subtotal: number;
    tax: number;
    total: number;
}

export interface TransactionResponse {
    success: boolean;
    data?: {
        id: string;
        transactionNumber: string;
        qrCode?: string;
        qrCodeUrl?: string; // QRIS Cont ent
        status: 'pending' | 'paid' | 'cancelled';
        createdAt: string;
    };
    message?: string;
    error?: string;
}

// Create transaction (Real API)
export async function createTransaction(request: CreateTransactionRequest, ctx?: ApiContextParams): Promise<TransactionResponse> {
    const TRANSACTION_API_URL = `${BASE_URL}/transactions/pos`;

    // Get headers from context params or ENV fallback
    const headers = {
        'x-api-key': API_KEY,
        'x-tenant-id': ctx?.tenantId || import.meta.env.VITE_TENANT_ID || '',
        'x-outlet-id': ctx?.outletId || import.meta.env.VITE_OUTLET_ID || '',
        'Content-Type': 'application/json'
    };

    // Transform items to match API expected format
    const transformedItems = request.items.map(item => ({
        product_id: item.productId ? (typeof item.productId === 'string' ? item.productId : String(item.productId)) : null,
        product_name: item.productName,
        quantity: item.quantity,
        price: item.price,
        notes: item.notes || '',
        size: item.size || null
    }));

    // Build request body with snake_case format that API expects
    // Use context params for table_id and order_type (from query URL)
    const requestBody = {
        table_number: request.tableNumber || '1',
        table_id: ctx?.tableId || request.tableId || import.meta.env.VITE_TABEL_ID || '1', // From query URL or fallback to ENV
        order_type: ctx?.orderMode || request.orderType || 'DINEIN', // From query URL or fallback
        items: transformedItems,
        subtotal: request.subtotal,
        tax: request.tax,
        total: request.total,
    };

    try {
        console.log('Creating transaction with body:', JSON.stringify(requestBody, null, 2));
        console.log('Headers:', headers);

        const response = await fetch(TRANSACTION_API_URL, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestBody)
        });

        const result = await response.json();

        if (!response.ok) {
            console.error('Transaction API Error:', result);
            console.error('Error details:', JSON.stringify(result.details, null, 2));
            return {
                success: false,
                error: result.message || `HTTP error! status: ${response.status} - ${result.error || ''}`
            };
        }

        console.log('Transaction Success:', result);
        return {
            success: true,
            data: result.data
        };
    } catch (error) {
        console.error('Error creating transaction:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create transaction'
        };
    }
}

// Generate DOKU Payment (QRIS) - uses invoice_number
export interface DokuPaymentRequest {
    invoiceNumber: string;
    paymentMethod: 'QRIS';
    amount?: number;
    customerName?: string;
}

export async function generateDokuPayment(request: DokuPaymentRequest, ctx?: ApiContextParams): Promise<TransactionResponse> {
    try {
        const response = await fetch(`${BASE_URL}/payment/doku`, {
            method: 'POST',
            headers: getHeaders(ctx),
            body: JSON.stringify({
                invoice_number: request.invoiceNumber,
                payment_method: request.paymentMethod,
                customer_name: request.customerName || 'Customer'
            })
        });

        const result = await response.json();
        console.log('DOKU Payment Response:', result);

        if (!response.ok) {
            return {
                success: false,
                error: result.message || `HTTP error! status: ${response.status}`
            };
        }

        return {
            success: true,
            data: result.data
        };
    } catch (error) {
        console.error('Error generating payment:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to generate payment'
        };
    }
}

// Check transaction status
export async function checkTransactionStatus(transactionId: string, ctx?: ApiContextParams): Promise<TransactionResponse> {
    try {
        const response = await fetch(`${BASE_URL}/transactions/${transactionId}`, {
            method: 'GET',
            headers: getHeaders(ctx)
        });

        const result = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: result.message || `HTTP error! status: ${response.status}`
            };
        }

        return {
            success: true,
            data: result.data
        };
    } catch (error) {
        console.error('Error checking transaction status:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to check transaction status'
        };
    }
}

// Simulate payment (Mock)
export async function simulateTransactionPayment(id: string): Promise<{ success: boolean }> {
    await new Promise(resolve => setTimeout(resolve, 800));
    console.log(`Payment simulated for ${id}`);
    return { success: true };
}

// Subscribe to transaction updates (SSE)
// Subscribe to transaction updates (SSE)
export interface PaymentStatusEvent {
    transactionId: string;
    status: string;
    data: {
        invoiceNumber: string;
        totalAmount: string;
        paymentMethod: string;
        paymentStatus: string;
        transactionStatus: string;
        updatedAt: string;
    };
    message: string;
    updatedAt: string;
}

export function subscribeToTransaction(
    transactionId: string,
    onPaymentStatus: (data: PaymentStatusEvent['data']) => void,
    onCompleted?: (message: string) => void,
    onError?: (error: any) => void,
    ctx?: ApiContextParams
): EventSource {
    const apiKey = encodeURIComponent(API_KEY);
    // Use context params or fallback to ENV variables
    const tenantId = encodeURIComponent(ctx?.tenantId || import.meta.env.VITE_TENANT_ID || '');
    const outletId = encodeURIComponent(ctx?.outletId || import.meta.env.VITE_OUTLET_ID || '');

    const url = `${BASE_URL}/transactions/${transactionId}/subscribe?apiKey=${apiKey}&tenantId=${tenantId}&outletId=${outletId}`;

    console.log('[SSE] Connecting to:', url);

    const eventSource = new EventSource(url);

    // Initial connection open
    eventSource.onopen = () => {
        console.log('[SSE] Connection OPEN - Ready to receive events');
    };

    // Listen for "payment-status" event
    eventSource.addEventListener('payment-status', (event) => {
        try {
            console.log('[SSE] ✅ Received payment-status event:', event.data);
            const parsedData = JSON.parse(event.data);

            // Checks if status is PAID or data.paymentStatus is SUCCESS/PAID
            const isPaid = parsedData.status === 'PAID' ||
                parsedData.data?.transactionStatus === 'PAID' ||
                parsedData.data?.paymentStatus === 'SUCCESS';

            console.log('[SSE] isPaid:', isPaid, 'hasData:', !!parsedData.data);

            if (isPaid && parsedData.data) {
                console.log('[SSE] Calling onPaymentStatus callback');
                onPaymentStatus(parsedData.data);
            }
        } catch (error) {
            console.error('[SSE] Error parsing payment-status data:', error);
        }
    });

    // Listen for "payment-completed" event
    eventSource.addEventListener('payment-completed', (event) => {
        try {
            console.log('[SSE] ✅ Received payment-completed event:', event.data);
            const parsedData = JSON.parse(event.data);
            if (onCompleted) {
                onCompleted(parsedData.message || 'Payment completed');
            }
        } catch (error) {
            console.error('[SSE] Error parsing payment-completed data:', error);
        }
    });

    // Listen for "connected" event (initial connection confirmation)
    eventSource.addEventListener('connected', (event) => {
        console.log('[SSE] ✅ Received connected event:', event.data);
    });

    // Standard message listener (fallback for unnamed events)
    eventSource.onmessage = (event) => {
        console.log('[SSE] Received generic/unnamed message:', event.data);
    };

    eventSource.onerror = (error) => {
        console.warn('[SSE] Connection error - state:', eventSource.readyState);
        // Don't close! EventSource will auto-reconnect.
        // Only notify error callback for logging purposes
        if (eventSource.readyState === EventSource.CLOSED) {
            console.error('[SSE] Connection permanently CLOSED');
            if (onError) onError(error);
        } else if (eventSource.readyState === EventSource.CONNECTING) {
            console.log('[SSE] Reconnecting...');
        }
    };

    return eventSource;
}
