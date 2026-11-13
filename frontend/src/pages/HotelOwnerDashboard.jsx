
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    getHotelOwnerOrders,
    updateFoodOrderStatus
} from '../services/hotelOwnerOrderService';
import { hotelOwnerLogout } from '../services/hotelOwnerService';
import '../App.css';

function HotelOwnerDashboard() {
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updatingOrderId, setUpdatingOrderId] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    const owner = JSON.parse(
        localStorage.getItem('hotelOwner') || 'null'
    );

    const loadOrders = useCallback(async () => {
        try {
            setError('');
            const data = await getHotelOwnerOrders();
            setOrders(data);
        } catch (err) {
            setError(err.message || 'Unable to load orders.');

            if (!localStorage.getItem('ownerToken')) {
                hotelOwnerLogout();
                navigate('/hotel-owner/login');
            }
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        if (!localStorage.getItem('ownerToken') || !owner) {
            navigate('/hotel-owner/login');
            return;
        }

        loadOrders();
    }, [navigate, loadOrders, owner]);

    async function handleStatusUpdate(orderId, status) {
        try {
            setUpdatingOrderId(orderId);
            setError('');
            setSuccessMessage('');

            const updatedOrder = await updateFoodOrderStatus(
                orderId,
                status
            );

            setOrders((previousOrders) =>
                previousOrders.map((order) =>
                    order.id === orderId ? updatedOrder : order
                )
            );

            setSuccessMessage(
                `Order #${orderId} updated to ${status}.`
            );
        } catch (err) {
            setError(err.message || 'Unable to update order status.');
        } finally {
            setUpdatingOrderId(null);
        }
    }

    function handleLogout() {
        hotelOwnerLogout();
        navigate('/hotel-owner/login');
    }

    const pendingCount = orders.filter(
        (order) => order.status === 'PENDING'
    ).length;

    const acceptedCount = orders.filter(
        (order) => order.status === 'ACCEPTED'
    ).length;

    const servedCount = orders.filter(
        (order) => order.status === 'SERVED'
    ).length;

    if (!owner) {
        return null;
    }

    return (
        <main className="owner-dashboard">
            <header className="owner-dashboard-header">
                <div>
                    <p className="owner-eyebrow">ROYAL BNF</p>
                    <h1>Hotel Owner Dashboard</h1>
                    <p>
                        Welcome, {owner.fullName}
                    </p>
                    <h2>{owner.hotelName}</h2>
                </div>

                <button
                    className="owner-logout-btn"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </header>

            <section className="owner-stats">
                <div className="owner-stat-card">
                    <span>Total Orders</span>
                    <strong>{orders.length}</strong>
                </div>

                <div className="owner-stat-card">
                    <span>Pending</span>
                    <strong>{pendingCount}</strong>
                </div>

                <div className="owner-stat-card">
                    <span>Accepted</span>
                    <strong>{acceptedCount}</strong>
                </div>

                <div className="owner-stat-card">
                    <span>Served</span>
                    <strong>{servedCount}</strong>
                </div>
            </section>

            <section className="owner-orders-section">
                <div className="owner-orders-heading">
                    <div>
                        <p className="owner-eyebrow">
                            FOOD MANAGEMENT
                        </p>
                        <h2>Food Orders</h2>
                    </div>

                    <button
                        className="owner-refresh-btn"
                        onClick={loadOrders}
                        disabled={loading}
                    >
                        Refresh Orders
                    </button>
                </div>

                {error && (
                    <div className="owner-error">{error}</div>
                )}

                {successMessage && (
                    <div className="owner-success">
                        {successMessage}
                    </div>
                )}

                {loading ? (
                    <p className="owner-message">
                        Loading food orders...
                    </p>
                ) : orders.length === 0 ? (
                    <p className="owner-message">
                        No food orders received yet.
                    </p>
                ) : (
                    <div className="owner-orders-grid">
                        {orders.map((order) => (
                            <article
                                className="owner-order-card"
                                key={order.id}
                            >
                                <div className="owner-order-top">
                                    <h3>Order #{order.id}</h3>

                                    <span
                                        className={`owner-status owner-status-${order.status.toLowerCase()}`}
                                    >
                                        {order.status}
                                    </span>
                                </div>

                                <div className="owner-order-details">
                                    <p>
                                        <strong>Food:</strong>{' '}
                                        {order.foodName}
                                    </p>

                                    <p>
                                        <strong>Quantity:</strong>{' '}
                                        {order.quantity}
                                    </p>

                                    <p>
                                        <strong>Booking:</strong>{' '}
                                        #{order.bookingId}
                                    </p>

                                    <p>
                                        <strong>Serving Date:</strong>{' '}
                                        {order.servingDate}
                                    </p>

                                    <p>
                                        <strong>Unit Price:</strong>{' '}
                                        ₹{order.unitPrice}
                                    </p>

                                    <p>
                                        <strong>Total:</strong>{' '}
                                        ₹{order.totalPrice}
                                    </p>

                                    <p>
                                        <strong>Instructions:</strong>{' '}
                                        {order.specialInstructions || 'None'}
                                    </p>

                                    <p>
                                        <strong>Ordered At:</strong>{' '}
                                        {order.createdAt
                                            ? new Date(
                                                order.createdAt
                                            ).toLocaleString()
                                            : 'N/A'}
                                    </p>
                                </div>

                                <div className="owner-order-actions">
                                    {order.status === 'PENDING' && (
                                        <>
                                            <button
                                                className="owner-accept-btn"
                                                disabled={updatingOrderId === order.id}
                                                onClick={() =>
                                                    handleStatusUpdate(
                                                        order.id,
                                                        'ACCEPTED'
                                                    )
                                                }
                                            >
                                                Accept
                                            </button>

                                            <button
                                                className="owner-reject-btn"
                                                disabled={updatingOrderId === order.id}
                                                onClick={() =>
                                                    handleStatusUpdate(
                                                        order.id,
                                                        'REJECTED'
                                                    )
                                                }
                                            >
                                                Reject
                                            </button>
                                        </>
                                    )}

                                    {order.status === 'ACCEPTED' && (
                                        <button
                                            className="owner-served-btn"
                                            disabled={updatingOrderId === order.id}
                                            onClick={() =>
                                                handleStatusUpdate(
                                                    order.id,
                                                    'SERVED'
                                                )
                                            }
                                        >
                                            Mark as Served
                                        </button>
                                    )}

                                    {updatingOrderId === order.id && (
                                        <span>Updating...</span>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}

export default HotelOwnerDashboard;
