import "../styles/Dashboard.css";
import OrderConfirmation from "../pages/OrderConfirmation";
import React, { useEffect, useState } from "react";
import { AlertTriangle, Clock, LogOut, Package, Search, ShoppingCart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { AuthService, MedicationService, OrderService, VendorService } from "../services/api";
import type { Medication, User, Vendor } from "../services/api";

interface CartItem extends Medication {
    quantity: number;
}

// Define the OrderSuccessDetails interface (also used in OrderConfirmation)
export interface OrderSuccessDetails {
    orderId: string;
    total: number;
    status: string;
}

const Dashboard: React.FC = () => {
    const navigate = useNavigate();

    // State Management
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [medications, setMedications] = useState<Medication[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState<OrderSuccessDetails | null>(null);

    // Fetch user on mount
    useEffect(() => {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser) {
            // If no user is logged in, redirect to login
            navigate('/login');
            return;
        }
        setUser(currentUser);
    }, [navigate]);

    // Fetch initial data
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);

                // Fetch vendors
                const vendorsResponse = await VendorService.getVendors();
                if (vendorsResponse && vendorsResponse.vendors) {
                    setVendors(vendorsResponse.vendors);

                    // Set first vendor if available
                    if (vendorsResponse.vendors.length > 0) {
                        setSelectedVendor(vendorsResponse.vendors[0]);

                        // Fetch medications for this vendor
                        const vendorId = vendorsResponse.vendors[0]._id;
                        try {
                            const medicationsResponse = await MedicationService.getMedicationsByVendor(vendorId);
                            if (medicationsResponse && medicationsResponse.medications) {
                                setMedications(medicationsResponse.medications);
                            } else {
                                // Fallback to all medications if vendor-specific fails
                                const allMedsResponse = await MedicationService.getMedications();
                                if (allMedsResponse && allMedsResponse.medications) {
                                    setMedications(allMedsResponse.medications);
                                }
                            }
                        } catch (medError) {
                            console.error('Failed to fetch medications for vendor', medError);
                            // Attempt to get all medications instead
                            const allMedsResponse = await MedicationService.getMedications();
                            if (allMedsResponse && allMedsResponse.medications) {
                                setMedications(allMedsResponse.medications);
                            }
                        }
                    } else {
                        // If no vendors, still try to get medications
                        const allMedsResponse = await MedicationService.getMedications();
                        if (allMedsResponse && allMedsResponse.medications) {
                            setMedications(allMedsResponse.medications);
                        }
                    }
                } else {
                    setError('No vendors available');
                }

                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch initial data', err);
                setError('Failed to load data. Please check your connection and try again.');
                setLoading(false);
            }
        };

        if (user) {
            fetchInitialData();
        }
    }, [user]);

    // Change vendor handler
    const handleVendorChange = async (vendor: Vendor) => {
        try {
            setSelectedVendor(vendor);
            setLoading(true);

            // Fetch medications for the selected vendor
            const medicationsResponse = await MedicationService.getMedicationsByVendor(vendor._id);
            if (medicationsResponse && medicationsResponse.medications) {
                setMedications(medicationsResponse.medications);
            }

            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch vendor medications', err);
            setError('Failed to load medications for this vendor');
            setLoading(false);
        }
    };

    // Filter medications
    const filteredMedications = medications.filter(med =>
        med.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (!selectedVendor || med.vendorId === selectedVendor._id)
    );

    // Add to cart functionality
    const addToCart = (medication: Medication) => {
        // Check if cart already has items from a different vendor
        if (cart.length > 0 && cart[0].vendorId !== medication.vendorId) {
            if (!window.confirm('Your cart contains items from another vendor. Clear cart and add this item?')) {
                return;
            }
            setCart([]);
        }

        const existingCartItem = cart.find(item => item._id === medication._id);

        if (existingCartItem) {
            setCart(cart.map(item =>
                item._id === medication._id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setCart([...cart, { ...medication, quantity: 1 }]);
        }
    };

    // Remove from cart functionality
    const removeFromCart = (medicationId: string) => {
        const existingCartItem = cart.find(item => item._id === medicationId);

        if (existingCartItem) {
            if (existingCartItem.quantity > 1) {
                setCart(cart.map(item =>
                    item._id === medicationId
                        ? { ...item, quantity: item.quantity - 1 }
                        : item
                ));
            } else {
                setCart(cart.filter(item => item._id !== medicationId));
            }
        }
    };

    // Create order functionality
    const createOrder = async () => {
        if (cart.length === 0) {
            alert('Cart is empty');
            return;
        }

        if (!selectedVendor) {
            alert('Please select a vendor');
            return;
        }

        // Set loading state
        setIsSubmitting(true);

        try {
            // Format the order data according to the backend requirements
            const orderData = {
                vendorId: selectedVendor._id,
                items: cart.map(item => ({
                    medicationId: item._id,
                    quantity: item.quantity
                })),
                paymentMethod: 'creditCard', // Could be made dynamic with a payment method selector
                deliveryInfo: {
                    address: {
                        street: user?.address?.street || '123 Pharmacy St',
                        city: user?.address?.city || 'Pharmacy City',
                        state: user?.address?.state || 'PC',
                        zip: user?.address?.zip || '12345'
                    },
                    contactName: user?.name || 'Pharmacy Contact',
                    contactPhone: user?.phone || '555-123-4567',
                    deliveryNotes: 'Please deliver during business hours'
                }
            };

            // Call the API to create the order
            const order = await OrderService.createOrder(orderData);

            // Clear cart after successful order
            setCart([]);
            setIsCartOpen(false);

            // Show success modal
            setOrderSuccess({
                orderId: order._id,
                total: order.total,
                status: order.status
            });
        } catch (err: any) {
            // Handle specific error cases
            if (err.response?.status === 400) {
                // Bad request - might be validation issues
                const errorMessage = err.response?.data?.message || 'Invalid order data';
                alert(`Failed to create order: ${errorMessage}`);
            } else if (err.response?.status === 401) {
                // Unauthorized - might need to refresh token or re-login
                alert('Your session has expired. Please log in again.');
                AuthService.logout();
                navigate('/login');
            } else if (err.response?.status === 409) {
                // Conflict - might be stock issues
                alert('One or more items in your cart are no longer available in the requested quantity.');

                // Optionally refresh medication data to show updated stock
                if (selectedVendor) {
                    handleVendorChange(selectedVendor);
                }
            } else {
                // Generic error handling
                console.error('Order creation failed', err);
                alert('Failed to create order. Please try again later.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle closing the order success modal
    const handleCloseSuccessModal = () => {
        setOrderSuccess(null);
    };

    // Logout handler
    const handleLogout = () => {
        AuthService.logout();
        navigate('/login');
    };

    // Calculate total cart value
    const cartTotal = cart.reduce((total, item) =>
        total + (item.discountPrice || item.price) * item.quantity, 0);

    // Loading state
    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-text">Loading...</div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="error-container">
                <AlertTriangle className="error-icon" size={48} />
                <div className="error-message">{error}</div>
                <button
                    className="retry-button"
                    onClick={() => window.location.reload()}
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            {/* Header */}
            <header className="dashboard-header">
                <div className="header-left">
                    <h1 className="dashboard-title">Pharmacy Dashboard</h1>
                    <span className="welcome-text">Welcome, {user?.name || 'Pharmacy'}</span>
                </div>
                <div className="header-right">
                    {/* Order history button */}
                    <Link to="/orders" className="orders-history-button">
                        <Clock size={20} />
                        <span className="orders-label">My Orders</span>
                    </Link>

                    {/* Cart button */}
                    <div className="cart-icon-container" onClick={() => setIsCartOpen(!isCartOpen)}>
                        <ShoppingCart size={20} />
                        {cart.length > 0 && (
                            <span className="cart-badge">{cart.length}</span>
                        )}
                    </div>

                    {/* Logout button */}
                    <button className="icon-button" onClick={handleLogout}>
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            {/* Vendor Selection */}
            <div className="dashboard-section">
                <h2 className="section-title">Select Vendor</h2>
                {vendors.length === 0 ? (
                    <div className="vendor-warning">
                        No vendors available. Please contact support.
                    </div>
                ) : (
                    <div className="vendor-list">
                        {vendors.map(vendor => (
                            <div
                                key={vendor._id}
                                className={`vendor-item ${selectedVendor?._id === vendor._id ? 'selected' : ''}`}
                                onClick={() => handleVendorChange(vendor)}
                            >
                                <Package size={16} />
                                {vendor.businessName}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Medications Section */}
            <div className="dashboard-section">
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Search medications..."
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search size={20} color="#6b7280" />
                </div>

                {/* Medications Grid */}
                <div className="medications-container">
                    {filteredMedications.length === 0 ? (
                        <div className="no-medications">
                            <div>No medications available</div>
                            {searchTerm && (
                                <button
                                    className="clear-search-button"
                                    onClick={() => setSearchTerm('')}
                                >
                                    Clear search
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="medication-grid">
                            {filteredMedications.map(medication => (
                                <div key={medication._id} className="medication-card">
                                    <h3 className="medication-title">{medication.name}</h3>
                                    <p className="medication-generic">{medication.genericName}</p>
                                    <p className="medication-description">{medication.description}</p>

                                    <div className="medication-tags">
                                        <span className="medication-tag">{medication.dosageForm}</span>
                                        <span className="medication-tag">{medication.strength}</span>
                                    </div>

                                    <div className="medication-price-row">
                                        <div className="price-container">
                                            {medication.discountPrice ? (
                                                <>
                                                    <span className="current-price">
                                                        ${medication.discountPrice.toFixed(2)}
                                                    </span>
                                                    <span className="original-price">
                                                        ${medication.price.toFixed(2)}
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="current-price">
                                                    ${medication.price.toFixed(2)}
                                                </span>
                                            )}
                                        </div>
                                        <span className={`stock-info ${medication.stock > 10
                                            ? 'stock-high'
                                            : medication.stock > 0
                                                ? 'stock-medium'
                                                : 'stock-out'
                                            }`}>
                                            {medication.stock > 0 ? `Stock: ${medication.stock}` : 'Out of Stock'}
                                        </span>
                                    </div>

                                    {medication.requiresPrescription && (
                                        <div className="prescription-warning">
                                            <AlertTriangle size={14} />
                                            Requires Prescription
                                        </div>
                                    )}

                                    <button
                                        className={`add-to-cart-btn ${medication.stock === 0
                                            ? 'btn-disabled'
                                            : medication.requiresPrescription
                                                ? 'btn-warning'
                                                : 'btn-primary'
                                            }`}
                                        onClick={() => medication.stock > 0 && !medication.requiresPrescription && addToCart(medication)}
                                        disabled={medication.stock === 0 || medication.requiresPrescription}
                                    >
                                        {medication.stock === 0
                                            ? 'Out of Stock'
                                            : medication.requiresPrescription
                                                ? 'Prescription Required'
                                                : 'Add to Cart'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Cart Sidebar */}
            {isCartOpen && (
                <div className="cart-sidebar">
                    <div className="cart-header">
                        <h2 className="cart-title">Your Cart</h2>
                        <button
                            className="close-button"
                            onClick={() => setIsCartOpen(false)}
                        >
                            Close
                        </button>
                    </div>

                    {cart.length === 0 ? (
                        <div className="empty-cart">
                            <ShoppingCart size={32} />
                            <p>Your cart is empty</p>
                            <button
                                className="clear-search-button"
                                onClick={() => setIsCartOpen(false)}
                            >
                                Continue shopping
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="cart-vendor-info">
                                <span>From: {selectedVendor?.businessName}</span>
                                <button
                                    className="clear-cart-button"
                                    onClick={() => setCart([])}
                                >
                                    Clear all
                                </button>
                            </div>

                            <div className="cart-items-container">
                                {cart.map(item => (
                                    <div key={item._id} className="cart-item">
                                        <div className="cart-item-header">
                                            <div className="cart-item-info">
                                                <div className="cart-item-name">{item.name}</div>
                                                <div className="cart-item-price">
                                                    ${(item.discountPrice || item.price).toFixed(2)} each
                                                </div>
                                            </div>
                                            <div className="cart-item-quantity">
                                                <button
                                                    className="quantity-button quantity-decrease"
                                                    onClick={() => removeFromCart(item._id)}
                                                >
                                                    -
                                                </button>
                                                <span className="quantity-value">{item.quantity}</span>
                                                <button
                                                    className="quantity-button quantity-increase"
                                                    onClick={() => addToCart(item)}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                        <div className="cart-item-total">
                                            ${((item.discountPrice || item.price) * item.quantity).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="cart-summary">
                                <div className="summary-row">
                                    <span>Subtotal:</span>
                                    <span>${cartTotal.toFixed(2)}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Tax (5%):</span>
                                    <span>${(cartTotal * 0.05).toFixed(2)}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Delivery Fee:</span>
                                    <span>$5.00</span>
                                </div>
                                <div className="summary-total">
                                    <span>Total:</span>
                                    <span>${(cartTotal + (cartTotal * 0.05) + 5).toFixed(2)}</span>
                                </div>

                                <button
                                    className="checkout-button"
                                    onClick={createOrder}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="loading-spinner"></span>
                                            Processing...
                                        </>
                                    ) : (
                                        'Place Order'
                                    )}
                                </button>

                                <button
                                    className="continue-shopping-button"
                                    onClick={() => setIsCartOpen(false)}
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Order Success Modal */}
            {orderSuccess && (
                <OrderConfirmation
                    orderDetails={orderSuccess}
                    onClose={handleCloseSuccessModal}
                />
            )}
        </div>
    );
};

export default Dashboard;