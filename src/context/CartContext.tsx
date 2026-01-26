import { createContext, useContext, useReducer, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { CartItem, CartState, Product, OrderMode } from '../types';

type CartAction =
    | { type: 'SET_TABLE'; tableNumber: string }
    | { type: 'SET_OUTLET'; outletId: string }
    | { type: 'SET_TENANT'; tenantId: string }
    | { type: 'SET_ORDER_MODE'; orderMode: OrderMode }
    | { type: 'SET_QUERY_PARAMS'; tableNumber: string | null; outletId: string; tenantId: string; orderMode: OrderMode }
    | { type: 'ADD_ITEM'; item: CartItem }
    | { type: 'REMOVE_ITEM'; productId: string; size?: string }
    | { type: 'UPDATE_QUANTITY'; productId: string; size?: string; quantity: number }
    | { type: 'CLEAR_CART' };

interface CartContextType {
    state: CartState;
    setTable: (tableNumber: string) => void;
    setOutlet: (outletId: string) => void;
    setTenant: (tenantId: string) => void;
    setOrderMode: (orderMode: OrderMode) => void;
    setQueryParams: (tableNumber: string | null, outletId: string, tenantId: string, orderMode: OrderMode) => void;
    addItem: (product: Product, quantity: number, size?: string, notes?: string) => void;
    removeItem: (productId: string, size?: string) => void;
    updateQuantity: (productId: string, size: string | undefined, quantity: number) => void;
    clearCart: () => void;
    getTotal: () => number;
    getItemCount: () => number;
}

// Load initial state from sessionStorage
const getInitialState = (): CartState => {
    if (typeof window !== 'undefined') {
        const saved = sessionStorage.getItem('beetpos-cart');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch {
                // ignore parse errors
            }
        }
    }
    return {
        items: [],
        tableNumber: null,
        outletId: null,
        tenantId: null,
        orderMode: null
    };
};

// Save state to sessionStorage
const saveState = (state: CartState) => {
    if (typeof window !== 'undefined') {
        sessionStorage.setItem('beetpos-cart', JSON.stringify(state));
    }
};

function cartReducer(state: CartState, action: CartAction): CartState {
    let newState: CartState;

    switch (action.type) {
        case 'SET_TABLE':
            newState = { ...state, tableNumber: action.tableNumber };
            break;

        case 'SET_OUTLET':
            newState = { ...state, outletId: action.outletId };
            break;

        case 'SET_TENANT':
            newState = { ...state, tenantId: action.tenantId };
            break;

        case 'SET_ORDER_MODE':
            newState = { ...state, orderMode: action.orderMode };
            break;

        case 'SET_QUERY_PARAMS':
            newState = {
                ...state,
                tableNumber: action.tableNumber,
                outletId: action.outletId,
                tenantId: action.tenantId,
                orderMode: action.orderMode
            };
            break;

        case 'ADD_ITEM': {
            const existingIndex = state.items.findIndex(
                item => item.product.id === action.item.product.id && item.size === action.item.size
            );

            if (existingIndex >= 0) {
                const newItems = [...state.items];
                newItems[existingIndex] = {
                    ...newItems[existingIndex],
                    quantity: newItems[existingIndex].quantity + action.item.quantity,
                    notes: action.item.notes || newItems[existingIndex].notes
                };
                newState = { ...state, items: newItems };
            } else {
                newState = { ...state, items: [...state.items, action.item] };
            }
            break;
        }

        case 'REMOVE_ITEM':
            newState = {
                ...state,
                items: state.items.filter(
                    item => !(item.product.id === action.productId && item.size === action.size)
                )
            };
            break;

        case 'UPDATE_QUANTITY': {
            if (action.quantity <= 0) {
                newState = {
                    ...state,
                    items: state.items.filter(
                        item => !(item.product.id === action.productId && item.size === action.size)
                    )
                };
            } else {
                newState = {
                    ...state,
                    items: state.items.map(item =>
                        item.product.id === action.productId && item.size === action.size
                            ? { ...item, quantity: action.quantity }
                            : item
                    )
                };
            }
            break;
        }

        case 'CLEAR_CART':
            newState = { ...state, items: [] };
            break;

        default:
            return state;
    }

    saveState(newState);
    return newState;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(cartReducer, null, getInitialState);

    const setTable = useCallback((tableNumber: string) => {
        dispatch({ type: 'SET_TABLE', tableNumber });
    }, []);

    const setOutlet = useCallback((outletId: string) => {
        dispatch({ type: 'SET_OUTLET', outletId });
    }, []);

    const setTenant = useCallback((tenantId: string) => {
        dispatch({ type: 'SET_TENANT', tenantId });
    }, []);

    const setOrderMode = useCallback((orderMode: OrderMode) => {
        dispatch({ type: 'SET_ORDER_MODE', orderMode });
    }, []);

    const setQueryParams = useCallback((tableNumber: string | null, outletId: string, tenantId: string, orderMode: OrderMode) => {
        dispatch({ type: 'SET_QUERY_PARAMS', tableNumber, outletId, tenantId, orderMode });
    }, []);

    const addItem = (product: Product, quantity: number, size?: string, notes?: string) => {
        dispatch({ type: 'ADD_ITEM', item: { product, quantity, size, notes } });
    };

    const removeItem = (productId: string, size?: string) => {
        dispatch({ type: 'REMOVE_ITEM', productId, size });
    };

    const updateQuantity = (productId: string, size: string | undefined, quantity: number) => {
        dispatch({ type: 'UPDATE_QUANTITY', productId, size, quantity });
    };

    const clearCart = () => {
        dispatch({ type: 'CLEAR_CART' });
    };

    const getTotal = () => {
        return state.items.reduce((total, item) => {
            let itemPrice = item.product.price;
            if (item.size && item.product.sizes) {
                const sizeOption = item.product.sizes.find(s => s.name === item.size);
                if (sizeOption) {
                    itemPrice += sizeOption.priceAdd;
                }
            }
            return total + (itemPrice * item.quantity);
        }, 0);
    };

    const getItemCount = () => {
        return state.items.reduce((count, item) => count + item.quantity, 0);
    };

    return (
        <CartContext.Provider value={{
            state,
            setTable,
            setOutlet,
            setTenant,
            setOrderMode,
            setQueryParams,
            addItem,
            removeItem,
            updateQuantity,
            clearCart,
            getTotal,
            getItemCount
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
