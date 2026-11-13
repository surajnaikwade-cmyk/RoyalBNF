
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { hotelOwnerLogin } from '../services/hotelOwnerService';
import '../App.css';

function HotelOwnerLogin() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    function handleChange(event) {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setError('');
        setLoading(true);

        try {
            await hotelOwnerLogin(formData);
            navigate('/hotel-owner/dashboard');
        } catch (err) {
            setError(err.message || 'Unable to log in.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Royal BNF</h1>
                    <p>Hotel Owner Portal</p>
                </div>

                <h2>Welcome Back</h2>
                <p>Sign in to manage your hotel and food orders.</p>

                {error && (
                    <div className="auth-error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-submit-btn"
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p className="auth-footer">
                    Customer? <Link to="/login">Customer Login</Link>
                </p>

                <Link to="/" className="auth-back-link">
                    Back to Home
                </Link>
            </div>
        </main>
    );
}

export default HotelOwnerLogin;
