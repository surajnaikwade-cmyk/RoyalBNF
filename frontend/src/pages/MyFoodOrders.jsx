import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyFoodOrders } from '../services/foodOrderService';
import '../App.css';

function formatMoney(value) {
    return Number(value || 0).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

function formatDate(date) {
    if (!date) return 'N/A';
    const parsed = new Date(`${date}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? date : parsed.toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
    });
}

function getOrderItems(order) {
    if (Array.isArray(order.items) && order.items.length) return order.items;
    if (order.foodName) {
        return [{
            foodName: order.foodName,
            quantity: order.quantity,
            unitPrice: order.unitPrice,
            totalPrice: order.totalPrice,
        }];
    }
    return [];
}

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

        let active = true;
        async function loadOrders() {
            try {
                setLoading(true);
                setError('');
                const data = await getMyFoodOrders();
                if (active) setOrders(Array.isArray(data) ? data : []);
            } catch (err) {
                if (active) setError(err.message || 'Unable to load your food orders.');
                if (err.status === 401 && active) navigate('/login');
            } finally {
                if (active) setLoading(false);
            }
        }
        loadOrders();
        return () => { active = false; };
    }, [navigate]);

    return (
        <main className="my-food-orders-page">
            <header className="my-food-orders-header">
                <div>
                    <p className="food-orders-eyebrow">ROYAL BNF</p>
                    <h1>My Food Orders</h1>
                    <p>Track your food experience during your stay.</p>
                </div>
                <Link to="/food" className="food-orders-back-btn">Explore Food Menu</Link>
            </header>

            <section className="my-food-orders-content" aria-live="polite">
                {loading ? (
                    <p className="food-orders-message">Loading your food orders...</p>
                ) : error ? (
                    <p className="food-orders-error" role="alert">{error}</p>
                ) : orders.length === 0 ? (
                    <div className="food-orders-empty">
                        <span className="food-history-empty-icon" aria-hidden="true">♧</span>
                        <h2>No food orders yet</h2>
                        <p>Explore hotel menus and order food during your confirmed stay.</p>
                        <Link to="/food">Explore Food Menu</Link>
                    </div>
                ) : (
                    <div className="my-food-orders-grid">
                        {orders.map((order) => {
                            const items = getOrderItems(order);
                            const computedTotal = items.reduce(
                                (sum, item) => sum + Number(item.totalPrice ?? (Number(item.unitPrice || 0) * Number(item.quantity || 0))),
                                0
                            );
                            const totalPrice = order.totalPrice ?? computedTotal;
                            const status = String(order.status || 'PENDING').toLowerCase();

                            return (
                                <article className="my-food-order-card" key={order.id}>
                                    <div className="my-food-order-top">
                                        <div>
                                            <p className="food-orders-eyebrow">FOOD ORDER</p>
                                            <h2>Order #{order.id}</h2>
                                        </div>
                                        <span className={`customer-food-status customer-food-status-${status}`}>
                                            {order.status || 'PENDING'}
                                        </span>
                                    </div>

                                    <p className="customer-food-hotel">{order.hotelName || 'Hotel'}</p>

                                    <div className="customer-food-order-details">
                                        <p><strong>Booking:</strong> #{order.bookingId}</p>
                                        <p><strong>Serving date:</strong> {formatDate(order.servingDate)}</p>
                                    </div>

                                    <section className="customer-food-items" aria-label={`Items in order ${order.id}`}>
                                        <h3>Ordered dishes</h3>
                                        {items.length ? items.map((item, index) => {
                                            const quantity = Number(item.quantity || 0);
                                            const unitPrice = Number(item.unitPrice || 0);
                                            const subtotal = Number(item.totalPrice ?? unitPrice * quantity);
                                            return (
                                                <div className="customer-food-item" key={item.foodOrderItemId || `${item.hotelFoodMenuId || item.foodName}-${index}`}>
                                                    <div className="customer-food-item-name">
                                                        <strong>{item.foodName || item.name || 'Food item'}</strong>
                                                        <span>Qty {quantity} × ₹{formatMoney(unitPrice)}</span>
                                                    </div>
                                                    <strong>₹{formatMoney(subtotal)}</strong>
                                                </div>
                                            );
                                        }) : <p className="customer-food-no-items">No item details were returned for this order.</p>}
                                    </section>

                                    <div className="customer-food-order-details customer-food-order-notes">
                                        <p><strong>Special instructions:</strong> {order.specialInstructions || 'None'}</p>
                                    </div>

                                    <div className="customer-food-order-footer">
                                        <span>Order total</span>
                                        <strong className="customer-food-grand-total">₹{formatMoney(totalPrice)}</strong>
                                        <span>Placed {order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN') : 'N/A'}</span>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>
        </main>
    );
}

export default MyFoodOrders;
