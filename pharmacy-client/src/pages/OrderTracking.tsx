import "../styles/OrderTracking.css";
import React, { useEffect, useState } from "react";
import { AlertTriangle, ArrowLeft, CheckCircle, Clock, MapPin, Package, Truck } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { AuthService, OrderService } from "../services/api";

interface DeliveryTracking {
    orderId: string;
    status: string;
    deliveryInfo: {
        estimatedDeliveryTime?: string;
        actualDeliveryTime?: string;
        deliveryPersonName?: string;
        deliveryPersonPhone?: string;
        currentLocation?: {
            latitude: number;
            longitude: number;
            updatedAt: string;
        };
    };
    destination: {
        street: string;
        city: string;
        state: string;
        zip: string;
    };
}

const OrderTracking: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const [tracking, setTracking] = useState<DeliveryTracking | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTrackingData = async () => {
            try {
                if (!orderId) {
                    setError('Order ID is missing');
                    setLoading(false);
                    return;
                }

                const trackingData = await OrderService.getDeliveryTracking(orderId);
                setTracking(trackingData);
                setLoading(false);
            } catch (err: any) {
                console.error('Failed to fetch tracking data', err);
                setError(err.response?.data?.message || 'Failed to load tracking information');
                setLoading(false);
            }
        };

        const user = AuthService.getCurrentUser();
        if (!user) {
            setError('Please log in to view order tracking');
            setLoading(false);
            return;
        }

        fetchTrackingData();
    }, [orderId]);

    const getStatusStep = (status: string) => {
        switch (status) {
            case 'pending':
                return 0;
            case 'confirmed':
                return 1;
            case 'preparing':
                return 2;
            case 'out_for_delivery':
                return 3;
            case 'delivered':
                return 4;
            default:
                return 0;
        }
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return 'TBD';

        const date = new Date(dateStr);
        return date.toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="tracking-container">
                <div className="tracking-loading">
                    <div className="tracking-spinner"></div>
                    <p>Loading tracking information...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="tracking-container">
                <div className="tracking-error">
                    <AlertTriangle size={48} />
                    <h2>Error Loading Tracking</h2>
                    <p>{error}</p>
                    <Link to="/dashboard" className="back-link">
                        <ArrowLeft size={16} />
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    if (!tracking) {
        return (
            <div className="tracking-container">
                <div className="tracking-error">
                    <AlertTriangle size={48} />
                    <h2>Tracking Not Found</h2>
                    <p>We couldn't find tracking information for this order.</p>
                    <Link to="/dashboard" className="back-link">
                        <ArrowLeft size={16} />
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    const currentStep = getStatusStep(tracking.status);

    return (
        <div className="tracking-container">
            <div className="tracking-header">
                <Link to="/dashboard" className="back-link">
                    <ArrowLeft size={16} />
                    Back to Dashboard
                </Link>
                <h1>Tracking Order #{tracking.orderId}</h1>
            </div>

            <div className="tracking-card">
                <div className="status-timeline">
                    <div className="timeline-track">
                        <div
                            className="timeline-progress"
                            style={{ width: `${currentStep * 25}%` }}
                        ></div>
                    </div>

                    <div className="timeline-steps">
                        <div className={`timeline-step ${currentStep >= 0 ? 'active' : ''}`}>
                            <div className="step-icon">
                                <Clock size={24} />
                            </div>
                            <div className="step-label">Pending</div>
                        </div>

                        <div className={`timeline-step ${currentStep >= 1 ? 'active' : ''}`}>
                            <div className="step-icon">
                                <CheckCircle size={24} />
                            </div>
                            <div className="step-label">Confirmed</div>
                        </div>

                        <div className={`timeline-step ${currentStep >= 2 ? 'active' : ''}`}>
                            <div className="step-icon">
                                <Package size={24} />
                            </div>
                            <div className="step-label">Preparing</div>
                        </div>

                        <div className={`timeline-step ${currentStep >= 3 ? 'active' : ''}`}>
                            <div className="step-icon">
                                <Truck size={24} />
                            </div>
                            <div className="step-label">Out for Delivery</div>
                        </div>

                        <div className={`timeline-step ${currentStep >= 4 ? 'active' : ''}`}>
                            <div className="step-icon">
                                <MapPin size={24} />
                            </div>
                            <div className="step-label">Delivered</div>
                        </div>
                    </div>
                </div>

                <div className="tracking-details">
                    <div className="detail-section">
                        <h3>Delivery Status</h3>
                        <p className="status-badge">{tracking.status.replace('_', ' ').toUpperCase()}</p>
                    </div>

                    <div className="detail-section">
                        <h3>Delivery Times</h3>
                        <div className="detail-row">
                            <span>Estimated:</span>
                            <span>{formatDate(tracking.deliveryInfo.estimatedDeliveryTime)}</span>
                        </div>
                        {tracking.status === 'delivered' && (
                            <div className="detail-row">
                                <span>Actual:</span>
                                <span>{formatDate(tracking.deliveryInfo.actualDeliveryTime)}</span>
                            </div>
                        )}
                    </div>

                    {tracking.deliveryInfo.deliveryPersonName && (
                        <div className="detail-section">
                            <h3>Delivery Person</h3>
                            <div className="detail-row">
                                <span>Name:</span>
                                <span>{tracking.deliveryInfo.deliveryPersonName}</span>
                            </div>
                            <div className="detail-row">
                                <span>Phone:</span>
                                <span>{tracking.deliveryInfo.deliveryPersonPhone}</span>
                            </div>
                        </div>
                    )}

                    <div className="detail-section">
                        <h3>Delivery Address</h3>
                        <p>
                            {tracking.destination.street}, {tracking.destination.city}, {tracking.destination.state} {tracking.destination.zip}
                        </p>
                    </div>

                    {tracking.status === 'out_for_delivery' && tracking.deliveryInfo.currentLocation && (
                        <div className="detail-section">
                            <h3>Current Location</h3>
                            <div className="location-info">
                                <div className="location-map">
                                    {/* You would embed a map here using the coordinates */}
                                    <div className="map-placeholder">
                                        <MapPin size={32} />
                                        <p>Driver is on the way</p>
                                        <p className="location-coords">
                                            ({tracking.deliveryInfo.currentLocation.latitude.toFixed(4)},
                                            {tracking.deliveryInfo.currentLocation.longitude.toFixed(4)})
                                        </p>
                                    </div>
                                </div>
                                <p className="location-updated">
                                    Last updated: {formatDate(tracking.deliveryInfo.currentLocation.updatedAt)}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderTracking;