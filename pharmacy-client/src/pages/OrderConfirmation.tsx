import React from "react";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface OrderSuccessDetails {
    orderId: string;
    total: number;
    status: string;
}

interface OrderConfirmationProps {
    orderDetails: OrderSuccessDetails;
    onClose: () => void;
}

const OrderConfirmation: React.FC<OrderConfirmationProps> = ({
    orderDetails,
    onClose
}) => {
    const navigate = useNavigate();
    const { orderId, total, status } = orderDetails;

    // Calculate estimated delivery date (24 hours from now)
    const estimatedDelivery = new Date();
    estimatedDelivery.setHours(estimatedDelivery.getHours() + 24);

    // Format the date for display
    const formatDate = (date: Date) => {
        const options: Intl.DateTimeFormatOptions = {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        };
        return date.toLocaleDateString('en-US', options);
    };

    // Handle navigation to order tracking
    const handleTrackOrder = () => {
        navigate(`/orders/${orderId}`);
    };

    return (
        <div className="modal-overlay">
            <div className="order-confirmation-modal">
                <div className="confirmation-header">
                    <div className="confirmation-icon">
                        <Check size={32} />
                    </div>
                    <h2 className="confirmation-title">Order Confirmed!</h2>
                    <p className="confirmation-subtitle">
                        Your order has been placed successfully
                    </p>
                </div>

                <div className="order-details">
                    <div className="order-details-row">
                        <span className="detail-label">Order ID:</span>
                        <span className="detail-value order-id">{orderId}</span>
                    </div>
                    <div className="order-details-row">
                        <span className="detail-label">Total Amount:</span>
                        <span className="detail-value">${total.toFixed(2)}</span>
                    </div>
                    <div className="order-details-row">
                        <span className="detail-label">Status:</span>
                        <span className="detail-value">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                    </div>
                    <div className="order-details-row">
                        <span className="detail-label">Order Date:</span>
                        <span className="detail-value">{formatDate(new Date())}</span>
                    </div>
                </div>

                <div className="estimated-delivery">
                    <p>Estimated Delivery by {formatDate(estimatedDelivery)}</p>
                </div>

                <div className="confirmation-actions">
                    <button className="track-order-button" onClick={handleTrackOrder}>
                        Track Your Order
                    </button>
                    <button className="back-to-shopping-button" onClick={onClose}>
                        Continue Shopping
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmation;