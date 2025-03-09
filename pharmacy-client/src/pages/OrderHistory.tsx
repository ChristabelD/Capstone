import "../styles/OrderHistory.css";
import React, { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle, ChevronRight, Clock, Package, Truck, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { OrderService } from "../services/api";

// Define a local interface that matches what we're displaying
interface OrderDisplay {
    _id: string;
    vendorId: any; // This can be either a string or an object with businessName
    items: Array<{
        medicationId: string;
        name: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
    }>;
    total: number;
    status: string;
    paymentStatus: string;
    createdAt: string;
}

const OrderHistory: React.FC = () => {
    const [orders, setOrders] = useState<OrderDisplay[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const response = await OrderService.getOrders();

                // Transform the API response to match our display interface
                if (response && response.orders) {
                    setOrders(response.orders as OrderDisplay[]);
                } else if (Array.isArray(response)) {
                    setOrders(response as OrderDisplay[]);
                } else {
                    setOrders([]);
                }
                setLoading(false);
            } catch (err: any) {
                console.error('Failed to fetch orders', err);
                setError('Unable to load your orders. Please try again later.');
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    // Get status icon based on order status
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <Clock size={20} className="status-icon pending" />;
            case 'confirmed':
                return <CheckCircle size={20} className="status-icon confirmed" />;
            case 'preparing':
                return <Package size={20} className="status-icon preparing" />;
            case 'out_for_delivery':
                return <Truck size={20} className="status-icon delivery" />;
            case 'delivered':
                return <CheckCircle size={20} className="status-icon delivered" />;
            case 'cancelled':
                return <XCircle size={20} className="status-icon cancelled" />;
            default:
                return <Clock size={20} className="status-icon pending" />;
        }
    };

    // Format date
    const formatDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'Invalid Date';
        }
    };

    // Helper to get vendor name safely
    const getVendorName = (vendor: any): string => {
        if (!vendor) return 'Unknown Vendor';
        if (typeof vendor === 'string') return 'Unknown Vendor';
        return vendor.businessName || 'Unknown Vendor';
    };

    if (loading) {
        return (
            <div className="order-history-container">
                <div className="loading-indicator">Loading your orders...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="order-history-container">
                <div className="error-message">{error}</div>
                <button
                    className="retry-button"
                    onClick={() => window.location.reload()}
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="order-history-container">
            <div className="order-history-header">
                <Link to="/" className="back-link">
                    <ArrowLeft size={16} />
                    Back to Dashboard
                </Link>
                <h1>Your Orders</h1>
            </div>

            {orders.length === 0 ? (
                <div className="no-orders-message">
                    <Package size={48} />
                    <h2>No Orders Yet</h2>
                    <p>You haven't placed any orders yet.</p>
                    <Link to="/" className="order-now-button">Order Now</Link>
                </div>
            ) : (
                <div className="orders-list">
                    {orders.map(order => (
                        <div key={order._id} className="order-card">
                            <div className="order-header">
                                <div className="order-id">
                                    <span className="label">Order ID:</span>
                                    <span className="value">{order._id}</span>
                                </div>
                                <div className="order-date">
                                    <span className="label">Date:</span>
                                    <span className="value">{formatDate(order.createdAt)}</span>
                                </div>
                            </div>

                            <div className="order-vendor">
                                <span className="label">Vendor:</span>
                                <span className="value">{getVendorName(order.vendorId)}</span>
                            </div>

                            <div className="order-items-summary">
                                <span className="items-count">{order.items?.length || 0} item(s)</span>
                                <span className="items-total">${(order.total || 0).toFixed(2)}</span>
                            </div>

                            <div className="order-status">
                                <div className="status-badge">
                                    {getStatusIcon(order.status)}
                                    <span className="status-text">
                                        {(order.status || 'pending').replace('_', ' ').toUpperCase()}
                                    </span>
                                </div>
                                <Link to={`/orders/${order._id}`} className="track-order-link">
                                    Track Order
                                    <ChevronRight size={16} />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderHistory;