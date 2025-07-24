import axios, { AxiosError } from "axios";
import { Socket, io } from "socket.io-client";

// Base URL from the API documentation
const BASE_URL = 'https://pharmaceutical-delivery-api-3ke3.onrender.com/api'

// Create an axios instance with base configuration
const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
    config => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => Promise.reject(error)
);

// Add response interceptor to handle token refresh
apiClient.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried refreshing yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Try to refresh the token
                const refreshToken = localStorage.getItem('refreshToken');
                const response = await apiClient.post('/auth/refresh', { refreshToken });
                const { accessToken, refreshToken: newRefreshToken } = response.data;

                // Update tokens
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', newRefreshToken);

                // Update auth header and retry request
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return apiClient(originalRequest);
            } catch (refreshError) {
                // If refresh fails, logout
                AuthService.logout();
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// Define interfaces for type safety
interface User {
    _id: string;
    email: string;
    name: string;
    role: string;
    businessName?: string;
    phone?: string;
    address?: {
        street: string;
        city: string;
        state: string;
        zip: string;
    };
}

interface SocketAuthData {
    token?: string;
}

// Socket.IO connection with proper type handling
const socket: Socket = io(BASE_URL.replace('/api', ''), {
    auth: (cb) => {
        const token = localStorage.getItem('accessToken');
        cb({ token } as SocketAuthData);
    }
});

// Authentication Service
export const AuthService = {
    async login(email: string, password: string) {
        try {
            const response = await apiClient.post('/auth/login', { email, password });
            const { accessToken, refreshToken, user } = response.data;

            // Store tokens and user info
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('user', JSON.stringify(user));

            // Reconnect socket with new token
            socket.disconnect();
            socket.auth = { token: accessToken } as SocketAuthData;
            socket.connect();

            return response.data;
        } catch (error) {
            console.error('Login failed', error);
            throw error;
        }
    },

    async registerPharmacy(registrationData: {
        email: string;
        password: string;
        name: string;
        phone: string;
        businessName: string;
        pharmacyLicense: string;
        address: {
            street: string;
            city: string;
            state: string;
            zip: string;
        }
    }) {
        try {
            const response = await apiClient.post('/auth/register/pharmacy', {
                email: registrationData.email,
                password: registrationData.password,
                name: registrationData.name,
                phone: registrationData.phone,
                address: {
                    street: registrationData.address.street,
                    city: registrationData.address.city,
                    state: registrationData.address.state,
                    zip: registrationData.address.zip,
                    coordinates: {
                        latitude: 0,
                        longitude: 0
                    }
                },
                businessName: registrationData.businessName,
                pharmacyLicense: registrationData.pharmacyLicense
            });
            return response.data;
        } catch (error) {
            console.error('Registration failed', error);
            throw error;
        }
    },

    async refreshToken() {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            const response = await apiClient.post('/auth/refresh', { refreshToken });
            const { accessToken, refreshToken: newRefreshToken } = response.data;

            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', newRefreshToken);

            return response.data;
        } catch (error) {
            this.logout();
            throw error;
        }
    },

    logout() {
        // Disconnect socket
        socket.disconnect();

        // Clear local storage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');

        // Redirect to login page
        window.location.href = '/login';
    },

    getCurrentUser(): User | null {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    isAuthenticated() {
        return !!localStorage.getItem('accessToken');
    }
};

// Vendor Interface
interface Vendor {
    _id: string;
    email: string;
    name: string;
    businessName: string;
    deliveryCapability: boolean;
    rating: number;
    reviews: any[];
    phone: string;
    address: {
        street: string;
        city: string;
        state: string;
        zip: string;
    };
    businessLicense: string;
    role: string;
}

// Pagination Interface
interface PaginationResult<T> {
    data: T[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}

// Vendor Service
export const VendorService = {
    async getVendors(params: any = {}): Promise<{ vendors: Vendor[], pagination: any }> {
        try {
            const response = await apiClient.get('/vendors', {
                params: {
                    limit: 10,
                    ...params
                }
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch vendors', error);
            throw error;
        }
    },

    async getVendorDetails(vendorId: string): Promise<Vendor> {
        try {
            const response = await apiClient.get(`/vendors/${vendorId}`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch vendor details', error);
            throw error;
        }
    }
};

// Medication Interface
interface Medication {
    _id: string;
    vendorId: string;
    name: string;
    genericName: string;
    description: string;
    dosageForm: string;
    strength: string;
    packageSize: number;
    manufacturer: string;
    category: string[];
    requiresPrescription: boolean;
    price: number;
    discountPrice?: number;
    stock: number;
    images: string[];
}

// Medication Service
export const MedicationService = {
    async getMedications(params: any = {}): Promise<{ medications: Medication[], pagination: any }> {
        try {
            const response = await apiClient.get('/medications', {
                params: {
                    limit: 50,
                    ...params
                }
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch medications', error);
            throw error;
        }
    },

    async getMedicationsByVendor(vendorId: string, params: any = {}): Promise<{ medications: Medication[], pagination: any }> {
        try {
            const response = await apiClient.get(`/medications/vendor/${vendorId}`, {
                params: {
                    limit: 50,
                    ...params
                }
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch vendor medications', error);
            throw error;
        }
    },

    async getMedicationDetails(medicationId: string): Promise<Medication> {
        try {
            const response = await apiClient.get(`/medications/${medicationId}`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch medication details', error);
            throw error;
        }
    }
};

// Delivery Tracking Interface
interface DeliveryTracking {
    orderId: string;
    status: string;
    deliveryInfo: {
        currentLocation?: {
            latitude: number;
            longitude: number;
            updatedAt: string;
        }
    };
    destination: {
        street: string;
        city: string;
        state: string;
        zip: string;
    };
}

// Order Interface
interface Order {
    _id: string;
    pharmacyId: string;
    vendorId: string;
    items: Array<{
        medicationId: string;
        name: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
    }>;
    subtotal: number;
    tax: number;
    deliveryFee?: number;
    total: number;
    status: string;
    paymentStatus: string;
    paymentMethod: string;
    deliveryInfo: {
        address: {
            street: string;
            city: string;
            state: string;
            zip: string;
        };
        contactName: string;
        contactPhone: string;
        deliveryNotes?: string;
        currentLocation?: {
            latitude: number;
            longitude: number;
            updatedAt: string;
        };
    };
    createdAt: string;
    updatedAt: string;
}

// Order Service
export const OrderService = {
    async createOrder(orderData: {
        vendorId: string;
        items: Array<{ medicationId: string, quantity: number }>;
        paymentMethod: string;
        deliveryInfo: any;
    }): Promise<Order> {
        try {
            const response = await apiClient.post('/orders', orderData);
            return response.data;
        } catch (error) {
            console.error('Failed to create order', error);
            throw error;
        }
    },

    async getOrders(params: any = {}): Promise<{ orders: Order[], pagination: any }> {
        try {
            const response = await apiClient.get('/orders', {
                params: {
                    limit: 10,
                    ...params
                }
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch orders', error);
            throw error;
        }
    },

    async getOrderDetails(orderId: string): Promise<Order> {
        try {
            const response = await apiClient.get(`/orders/${orderId}`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch order details', error);
            throw error;
        }
    },

    async updateOrderStatus(orderId: string, status: string): Promise<Order> {
        try {
            const response = await apiClient.put(`/orders/${orderId}/status`, { status });
            return response.data;
        } catch (error) {
            console.error('Failed to update order status', error);
            throw error;
        }
    },

    async updateDeliveryStatus(orderId: string, status: string): Promise<Order> {
        try {
            const response = await apiClient.put(`/orders/${orderId}/delivery/status`, { status });
            return response.data;
        } catch (error) {
            console.error('Failed to update delivery status', error);
            throw error;
        }
    },

    async updateDeliveryLocation(orderId: string, latitude: number, longitude: number): Promise<Order> {
        try {
            const response = await apiClient.put(`/orders/${orderId}/delivery/location`, {
                latitude,
                longitude
            });
            return response.data;
        } catch (error) {
            console.error('Failed to update delivery location', error);
            throw error;
        }
    },

    async getDeliveryTracking(orderId: string): Promise<DeliveryTracking> {
        try {
            const response = await apiClient.get(`/orders/${orderId}/delivery/tracking`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch delivery tracking', error);
            throw error;
        }
    },

    async getOrderAnalytics(): Promise<any> {
        try {
            const response = await apiClient.get('/orders/analytics');
            return response.data;
        } catch (error) {
            console.error('Failed to fetch order analytics', error);
            throw error;
        }
    },

    async getTopSellingMedications(vendorId: string): Promise<any[]> {
        try {
            const response = await apiClient.get(`/orders/vendor/${vendorId}/top-selling`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch top selling medications', error);
            throw error;
        }
    }
};

// Export socket and api client for additional flexibility
export { socket, apiClient };

// Export interfaces for type checking
export type {
    User,
    Vendor,
    Medication,
    Order,
    DeliveryTracking
};
