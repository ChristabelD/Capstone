import "../styles/Login.css";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthService } from "../services/api";

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Validate input
            if (!email || !password) {
                setError('Please enter both email and password');
                setIsLoading(false);
                return;
            }

            // Attempt login
            await AuthService.login(email, password);

            // Redirect to dashboard on successful login
            navigate('/');
        } catch (err: any) {
            // Handle login errors
            const errorMessage = err.response?.data?.message
                || 'Login failed. Please check your credentials.';
            setError(errorMessage);

            // Log the full error for debugging
            console.error('Login error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2 className="login-title">Pharmacy Login</h2>

                {/* Error Message */}
                {error && (
                    <div className="error-message" role="alert">
                        {error}
                    </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="form-input"
                            placeholder="Enter your email"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="form-input"
                            placeholder="Enter your password"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    {/* Forgot Password Link */}
                    <div className="forgot-password">
                        <Link to="/forgot-password">
                            Forgot Password?
                        </Link>
                    </div>

                    {/* Login Button */}
                    <button
                        type="submit"
                        className={`login-button ${isLoading ? 'login-button-disabled' : 'login-button-primary'}`}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                {/* Registration Link */}
                <div className="register-prompt">
                    <p>
                        Don't have an account?{' '}
                        <Link to="/register" className="register-link">
                            Register here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;