
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyFoodOrders } from '../services/foodOrderService';
import '../App.css';

function MyFoodOrders() {
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            navigate('/login');
            return;
        }

        async function loadOrders() {
            try {
                setLoading(true);
                setError('');

                const data = await getMyFoodOrders();
                setOrders(data);
            } catch (err) {
                setError(err.message || 'Unable to load your food orders.');
            } finally {
                setLoading(false);
            }
        }

        loadOrders();
    }, [navigate]);

    function formatDate(date) {
        if (!date) return 'N/A';

        return new Date(`${date}T00:00:00`).toLocaleDateString(
            'en-IN',
            {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }
        );
    }

    return (
        <main className="my-food-orders-page">
            <header className="my-food-orders-header">
                <div>
                    <p className="food-orders-eyebrow">ROYAL BNF</p>
                    <h1>My Food Orders</h1>
                    <p>Track your food experience during your stay.</p>
                </div>

                <Link to="/food" className="food-orders-back-btn">
                    Explore Food Menu
                </Link>
            </header>

            <section className="my-food-orders-content">
                {loading ? (
                    <p className="food-orders-message">
                        Loading your food orders...
                    </p>
                ) : error ? (
                    <p className="food-orders-error">{error}</p>
                ) : orders.length === 0 ? (
                    <div className="food-orders-empty">
                        <h2>No food orders yet</h2>
                        <p>
                            Explore hotel menus and order food during
                            your confirmed stay.
                        </p>
                        <Link to="/food">
                            Explore Food Menu
                        </Link>
                    </div>
                ) : (
                    <div className="my-food-orders-grid">
                        {orders.map((order) => (
                            <article
                                className="my-food-order-card"
                                key={order.id}
                            >
                                <div className="my-food-order-top">
                                    <div>
                                        <p className="food-orders-eyebrow">
                                            FOOD ORDER
                                        </p>
                                        <h2>Order #{order.id}</h2>
                                    </div>

                                    <span
                                        className={`customer-food-status customer-food-status-${order.status.toLowerCase()}`}
                                    >
                                        {order.status}
                                    </span>
                                </div>

                                <h3>{order.foodName}</h3>

                                <p className="customer-food-hotel">
                                    {order.hotelName}
                                </p>

                                <div className="customer-food-order-details">
                                    <p>
                                        <strong>Booking:</strong>{' '}
                                        #{order.bookingId}
                                    </p>

                                    <p>
                                        <strong>Quantity:</strong>{' '}
                                        {order.quantity}
                                    </p>

                                    <p>
                                        <strong>Serving Date:</strong>{' '}
                                        {formatDate(order.servingDate)}
                                    </p>

                                    <p>
                                        <strong>Unit Price:</strong>{' '}
                                        ₹{order.unitPrice}
                                    </p>

                                    <p>
                                        <strong>Total Amount:</strong>{' '}
                                        ₹{order.totalPrice}
                                    </p>

                                    <p>
                                        <strong>Instructions:</strong>{' '}
                                        {order.specialInstructions || 'None'}
                                    </p>
                                </div>

                                <div className="customer-food-order-footer">
                                    <span>Order placed</span>
                                    <strong>
                                        {order.createdAt
                                            ? new Date(
                                                order.createdAt
                                            ).toLocaleString('en-IN')
                                            : 'N/A'}
                                    </strong>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}

export default MyFoodOrders;
