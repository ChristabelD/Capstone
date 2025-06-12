"../styles/Register.css";
import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { AuthService } from "../services/api";

const Register: React.FC = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        phone: '',
        businessName: '',
        pharmacyLicense: '',
        address: {
            street: '',
            city: '',
            state: '',
            zip: ''
        }
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        // Check if the input is part of the address
        if (['street', 'city', 'state', 'zip'].includes(name)) {
            setFormData(prev => ({
                ...prev,
                address: {
                    ...prev.address,
                    [name]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Basic validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        try {
            // Call registration service
            await AuthService.registerPharmacy({
                email: formData.email,
                password: formData.password,
                name: formData.name,
                phone: formData.phone,
                businessName: formData.businessName,
                pharmacyLicense: formData.pharmacyLicense,
                address: formData.address
            });

            // Automatically log in after successful registration
            await AuthService.login(formData.email, formData.password);

            // Redirect to dashboard
            navigate('/');
        } catch (err: any) {
            // Handle registration error
            if (axios.isAxiosError(err)) {
                // Handle Axios-specific errors
                const errorMessage = err.response?.data?.message
                    || err.response?.data
                    || 'Registration failed';
                setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
            } else {
                // Handle generic errors
                setError('Registration failed');
            }
            console.error('Registration error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="register-container">
            <div className="register-card">
                <h2 className="register-title">Pharmacy Registration</h2>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-section">
                        <h3 className="section-title">Business Information</h3>
                        <div className="form-group">
                            <label htmlFor="businessName" className="form-label">Business Name</label>
                            <input
                                type="text"
                                id="businessName"
                                name="businessName"
                                className="form-input"
                                value={formData.businessName}
                                onChange={handleChange}
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="pharmacyLicense" className="form-label">Pharmacy License</label>
                            <input
                                type="text"
                                id="pharmacyLicense"
                                name="pharmacyLicense"
                                className="form-input"
                                value={formData.pharmacyLicense}
                                onChange={handleChange}
                                required
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <div className="form-section">
                        <h3 className="section-title">Contact Information</h3>
                        <div className="form-row">
                            <div className="form-column">
                                <div className="form-group">
                                    <label htmlFor="name" className="form-label">Full Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        className="form-input"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                            <div className="form-column">
                                <div className="form-group">
                                    <label htmlFor="phone" className="form-label">Phone Number</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        className="form-input"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="email" className="form-label">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className="form-input"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <div className="form-section">
                        <h3 className="section-title">Address</h3>
                        <div className="form-group">
                            <label htmlFor="street" className="form-label">Street Address</label>
                            <input
                                type="text"
                                id="street"
                                name="street"
                                className="form-input"
                                value={formData.address.street}
                                onChange={handleChange}
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-column">
                                <div className="form-group">
                                    <label htmlFor="city" className="form-label">City</label>
                                    <input
                                        type="text"
                                        id="city"
                                        name="city"
                                        className="form-input"
                                        value={formData.address.city}
                                        onChange={handleChange}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                            <div className="form-column">
                                <div className="form-group">
                                    <label htmlFor="state" className="form-label">State</label>
                                    <input
                                        type="text"
                                        id="state"
                                        name="state"
                                        className="form-input"
                                        value={formData.address.state}
                                        onChange={handleChange}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                            <div className="form-column">
                                <div className="form-group">
                                    <label htmlFor="zip" className="form-label">Zip Code</label>
                                    <input
                                        type="text"
                                        id="zip"
                                        name="zip"
                                        className="form-input"
                                        value={formData.address.zip}
                                        onChange={handleChange}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3 className="section-title">Security</h3>
                        <div className="form-row">
                            <div className="form-column">
                                <div className="form-group">
                                    <label htmlFor="password" className="form-label">Password</label>
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        className="form-input"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        minLength={8}
                                        disabled={isLoading}
                                    />
                                    <div className="password-requirements">
                                        Must be at least 8 characters long
                                    </div>
                                </div>
                            </div>
                            <div className="form-column">
                                <div className="form-group">
                                    <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        className="form-input"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        minLength={8}
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="register-button"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Registering...' : 'Register Pharmacy'}
                    </button>

                    <div className="login-prompt">
                        <Link to="/login" className="login-link">
                            Already have an account? Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;