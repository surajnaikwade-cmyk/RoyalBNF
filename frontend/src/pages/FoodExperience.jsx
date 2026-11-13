import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { getAllHotels } from '../services/hotelService';
import { getMyBookings } from '../services/bookingService';
import { placeFoodOrder } from '../services/foodOrderService';
import { getFoodCategories, getHotelFoodMenu } from '../services/foodService';
import '../App.css';

const CART_STORAGE_KEY = 'royalBnfFoodCart';
const MAX_ITEM_QUANTITY = 99;
const FALLBACK_FOOD_IMAGE =
  'https://images.unsplash.com/photo-1547592180-85f173990554?w=900';

function positiveId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function safeImageUrl(value) {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  return /^(https?:\/\/|\/)/i.test(trimmed) && !trimmed.startsWith('//')
    ? trimmed
    : '';
}

function restoreCart() {
  try {
    const stored = JSON.parse(localStorage.getItem(CART_STORAGE_KEY));
    const hotelId = positiveId(stored?.hotelId);
    if (!hotelId || !Array.isArray(stored?.items) || !stored.items.length) {
      return null;
    }

    const itemsByMenuId = new Map();
    stored.items.forEach((item) => {
      const menuId = positiveId(item?.menuId);
      const itemHotelId = positiveId(item?.hotelId ?? hotelId);
      const quantity = Number(item?.quantity);
      const unitPrice = Number(item?.unitPrice);
      if (
        !menuId || itemHotelId !== hotelId ||
        !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_ITEM_QUANTITY ||
        !Number.isFinite(unitPrice) || unitPrice < 0 ||
        typeof item?.name !== 'string' || !item.name.trim()
      ) {
        return;
      }

      const previous = itemsByMenuId.get(menuId);
      const combinedQuantity = (previous?.quantity || 0) + quantity;
      if (combinedQuantity > MAX_ITEM_QUANTITY) return;

      itemsByMenuId.set(menuId, {
        menuId,
        hotelId,
        name: item.name.trim(),
        imageUrl: safeImageUrl(item.imageUrl),
        unitPrice,
        quantity: combinedQuantity,
        available: item.available !== false,
      });
    });

    const items = [...itemsByMenuId.values()];
    if (!items.length) return null;

    return {
      hotelId,
      hotelName: typeof stored.hotelName === 'string' ? stored.hotelName : 'Selected hotel',
      items,
    };
  } catch {
    return null;
  }
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function lastServingDate(checkOut) {
  if (!checkOut) return '';
  const date = new Date(`${checkOut}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return '';
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

function sameHotelBooking(booking, hotel) {
  if (booking.hotelId != null) return Number(booking.hotelId) === Number(hotel.id);
  return booking.hotelName === hotel.name &&
    (!booking.hotelLocation || booking.hotelLocation === hotel.location);
}

function FoodExperience() {
  const navigate = useNavigate();
  const checkoutSubmitting = useRef(false);

  const [categories, setCategories] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [cart, setCart] = useState(restoreCart);
  const [selectedHotelId, setSelectedHotelId] = useState(() => {
    const restored = restoreCart();
    return restored ? String(restored.hotelId) : '';
  });
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuLoading, setMenuLoading] = useState(false);
  const [error, setError] = useState('');
  const [menuError, setMenuError] = useState('');
  const [cartNotice, setCartNotice] = useState('');
  const [cartError, setCartError] = useState('');
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [bookingState, setBookingState] = useState({ hotelId: null, items: [], loading: false, error: '' });
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [servingDate, setServingDate] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  const itemCount = useMemo(
    () => cart?.items.reduce((count, item) => count + item.quantity, 0) || 0,
    [cart]
  );
  const cartTotal = useMemo(
    () => cart?.items.reduce((total, item) => total + item.unitPrice * item.quantity, 0) || 0,
    [cart]
  );
  const selectedHotel = hotels.find((hotel) => Number(hotel.id) === Number(selectedHotelId));
  const cartHotel = hotels.find((hotel) => Number(hotel.id) === Number(cart?.hotelId));
  const eligibleBookings = bookingState.hotelId === cart?.hotelId ? bookingState.items : [];
  const selectedBooking = eligibleBookings.find(
    (booking) => Number(booking.id) === Number(selectedBookingId)
  );
  const unavailableItems = cart?.items.filter((item) => item.available === false) || [];

  useEffect(() => {
    if (cart?.items.length) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } else {
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, [cart]);

  useEffect(() => {
    function syncCart(event) {
      if (event.key === CART_STORAGE_KEY) setCart(restoreCart());
    }
    window.addEventListener('storage', syncCart);
    return () => window.removeEventListener('storage', syncCart);
  }, []);

  useEffect(() => {
    let active = true;
    async function loadFoodData() {
      try {
        setLoading(true);
        setError('');
        const [categoryData, hotelData] = await Promise.all([
          getFoodCategories(),
          getAllHotels(),
        ]);
        if (!active) return;
        setCategories(categoryData);
        setHotels(hotelData);
      } catch (err) {
        if (active) setError(err.message || 'Unable to load food experience data.');
      } finally {
        if (active) setLoading(false);
      }
    }
    loadFoodData();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!selectedHotelId) return undefined;

    let active = true;
    async function loadMenu() {
      try {
        setMenuLoading(true);
        setMenuError('');
        const data = await getHotelFoodMenu(selectedHotelId);
        if (!active) return;
        setMenuItems(data);

        setCart((current) => {
          if (!current || Number(current.hotelId) !== Number(selectedHotelId)) return current;
          const availableMenu = new Map(data.map((menuItem) => [Number(menuItem.menuId), menuItem]));
          return {
            ...current,
            items: current.items.map((cartItem) => {
              const currentMenuItem = availableMenu.get(Number(cartItem.menuId));
              if (!currentMenuItem) return { ...cartItem, available: false };
              return {
                ...cartItem,
                name: currentMenuItem.name,
                imageUrl: currentMenuItem.imageUrl || cartItem.imageUrl,
                unitPrice: Number(currentMenuItem.sellingPrice),
                available: currentMenuItem.available !== false,
              };
            }),
          };
        });
      } catch (err) {
        if (active) setMenuError(err.message || 'Unable to load hotel menu.');
      } finally {
        if (active) setMenuLoading(false);
      }
    }
    loadMenu();
    return () => { active = false; };
  }, [selectedHotelId]);

  function handleHotelChange(event) {
    setSelectedHotelId(event.target.value);
    setMenuItems([]);
    setMenuError('');
    setCartNotice('');
    setCartError('');
    setOrderSuccess(null);
  }

  function addToCart(menuItem) {
    if (!selectedHotel) {
      setCartError('Choose a hotel before adding a dish.');
      return;
    }
    if (menuItem.available === false) {
      setCartError('This dish is currently unavailable.');
      return;
    }

    const nextItem = {
      menuId: positiveId(menuItem.menuId),
      hotelId: Number(selectedHotel.id),
      name: menuItem.name,
      imageUrl: menuItem.imageUrl || '',
      unitPrice: Number(menuItem.sellingPrice),
      quantity: 1,
      available: true,
    };
    if (!nextItem.menuId || !Number.isFinite(nextItem.unitPrice) || nextItem.unitPrice < 0) {
      setCartError('This menu item has invalid details and could not be added.');
      return;
    }

    setCartError('');
    setOrderSuccess(null);
    const sameHotelCart = cart && Number(cart.hotelId) === Number(selectedHotel.id);
    const existingItem = sameHotelCart
      ? cart.items.find((item) => Number(item.menuId) === nextItem.menuId)
      : null;
    if (existingItem && existingItem.quantity >= MAX_ITEM_QUANTITY) {
      setCartError(`You can add up to ${MAX_ITEM_QUANTITY} of one dish.`);
      return;
    }
    if (cart && Number(cart.hotelId) !== Number(selectedHotel.id)) {
      const confirmed = window.confirm(
        `Your cart contains dishes from ${cart.hotelName}. Replace it with items from ${selectedHotel.name}?`
      );
      if (!confirmed) {
        setCartNotice(`Your cart still contains items from ${cart.hotelName}.`);
        return;
      }
      setCart({ hotelId: Number(selectedHotel.id), hotelName: selectedHotel.name, items: [nextItem] });
      setCheckoutOpen(false);
      setBookingState({ hotelId: null, items: [], loading: false, error: '' });
      setSelectedBookingId('');
      setServingDate('');
      setCartNotice(`Cart replaced with items from ${selectedHotel.name}.`);
      return;
    }

    setCart((current) => {
      const currentCart = current || {
        hotelId: Number(selectedHotel.id),
        hotelName: selectedHotel.name,
        items: [],
      };
      const existing = currentCart.items.find((item) => Number(item.menuId) === nextItem.menuId);
      const items = existing
        ? currentCart.items.map((item) => item.menuId === nextItem.menuId
          ? { ...item, quantity: Math.min(MAX_ITEM_QUANTITY, item.quantity + 1), available: true }
          : item)
        : [...currentCart.items, nextItem];
      return { ...currentCart, hotelName: selectedHotel.name, items };
    });
    setCartNotice(`${menuItem.name} added to your cart.`);
  }

  function changeQuantity(menuId, delta) {
    setCartError('');
    setCartNotice('');
    setCart((current) => {
      if (!current) return current;
      return {
        ...current,
        items: current.items.map((item) => item.menuId === menuId
          ? { ...item, quantity: Math.min(MAX_ITEM_QUANTITY, Math.max(1, item.quantity + delta)) }
          : item),
      };
    });
  }

  function removeFromCart(menuId) {
    const removed = cart?.items.find((item) => item.menuId === menuId);
    if (!removed) return;
    const remaining = cart.items.filter((item) => item.menuId !== menuId);
    setCart(remaining.length ? { ...cart, items: remaining } : null);
    setCartError('');
    setCartNotice(`${removed.name} removed from your cart.`);
    setSelectedBookingId('');
  }

  function clearCart() {
    if (!cart) return;
    if (!window.confirm('Clear all dishes from your cart?')) return;
    setCart(null);
    setCheckoutOpen(false);
    setBookingState({ hotelId: null, items: [], loading: false, error: '' });
    setSelectedBookingId('');
    setCartNotice('Your cart has been cleared.');
    setCartError('');
  }

  async function openCheckout() {
    if (!cart?.items.length) return;
    if (!localStorage.getItem('token')) {
      navigate('/login', { state: { returnTo: '/food' } });
      return;
    }
    setCheckoutOpen(true);
    setCartError('');
    setSelectedBookingId('');
    setServingDate('');
    setBookingState({ hotelId: cart.hotelId, items: [], loading: true, error: '' });
    try {
      const bookings = await getMyBookings();
      const matching = bookings.filter((booking) =>
        booking.status === 'CONFIRMED' && cartHotel && sameHotelBooking(booking, cartHotel)
      );
      setBookingState({ hotelId: cart.hotelId, items: matching, loading: false, error: '' });
    } catch (err) {
      setBookingState({ hotelId: cart.hotelId, items: [], loading: false, error: err.message || 'Unable to load your bookings.' });
      if (err.status === 401 || err.message?.toLowerCase().includes('log in')) {
        navigate('/login', { state: { returnTo: '/food' } });
      }
    }
  }

  async function handlePlaceOrder(event) {
    event.preventDefault();
    if (checkoutSubmitting.current || orderLoading) return;
    setCartError('');
    setOrderSuccess(null);

    const bookingId = positiveId(selectedBookingId);
    const selectedDayIsValid = selectedBooking && servingDate >= selectedBooking.checkIn &&
      servingDate < selectedBooking.checkOut;
    if (!cart?.items.length) {
      setCartError('Add at least one dish before checkout.');
      return;
    }
    if (unavailableItems.length) {
      setCartError('Remove unavailable dishes before placing your order.');
      return;
    }
    if (!bookingId || !servingDate || !selectedDayIsValid) {
      setCartError('Choose a confirmed booking and a serving date within your stay.');
      return;
    }

    checkoutSubmitting.current = true;
    setOrderLoading(true);
    try {
      const order = await placeFoodOrder({
        bookingId,
        items: cart.items.map((item) => ({
          hotelFoodMenuId: item.menuId,
          quantity: item.quantity,
        })),
        servingDate,
        specialInstructions: specialInstructions.trim(),
      });
      setOrderSuccess({ id: order?.id ?? order?.orderId ?? 'confirmed' });
      setCart(null);
      setCheckoutOpen(false);
      setBookingState({ hotelId: null, items: [], loading: false, error: '' });
      setSelectedBookingId('');
      setServingDate('');
      setSpecialInstructions('');
      setCartNotice('');
    } catch (err) {
      setCartError(err.message || 'Unable to place your order. Your cart is still saved.');
      if (err.status === 401) {
        navigate('/login', { state: { returnTo: '/food' } });
      }
    } finally {
      checkoutSubmitting.current = false;
      setOrderLoading(false);
    }
  }

  return (
    <div className="details-page food-experience-page">
      <header className="details-navbar">
        <Link to="/" className="brand">
          <span className="brand-mark">R</span>
          <span><strong>ROYAL BNF</strong><small>ROYAL BED AND FOOD</small></span>
        </Link>
        <div className="food-nav-actions">
          <Link to="/my-food-orders" className="food-history-link">My Food Orders</Link>
          <a href="#food-cart" className="food-cart-link" aria-label={`Cart, ${itemCount} food units`}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2.1 10.1a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 1.9-1.4L22 8H6" /><circle cx="10" cy="20" r="1" /><circle cx="18" cy="20" r="1" /></svg>
            <span>Cart</span>
            <strong className="food-cart-count" aria-live="polite">{itemCount}</strong>
          </a>
          <Link to="/" className="text-link">← Back to Home</Link>
        </div>
      </header>

      <section className="food-experience-hero">
        <span className="eyebrow">THE ROYAL FOOD EXPERIENCE</span>
        <h1>Discover the taste of India.</h1>
        <p>Every region has a story, and every story has a flavour. Explore traditional cuisines prepared by our hotel partners.</p>
      </section>

      <main className="details-content">
        <section className="food-category-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">EXPLORE REGIONAL CUISINES</span>
              <h2>Flavours worth discovering.</h2>
              <p>Explore the traditional cuisines of different regions.</p>
            </div>
          </div>
          {loading && <p>Loading food categories...</p>}
          {error && <p className="auth-error" role="alert">{error}</p>}
          {!loading && !error && (
            <div className="food-category-grid">
              {categories.map((category) => (
                <article className="food-category-card" key={category.id}>
                  <span className="eyebrow">REGIONAL CUISINE</span>
                  <h3>{category.name}</h3>
                  <p>{category.description}</p>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="hotel-food-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">MENUS FROM OUR HOTELS</span>
              <h2>Explore the taste of your stay.</h2>
              <p>Select a hotel to discover its available food menu.</p>
            </div>
          </div>

          <div className="food-hotel-selector">
            <label htmlFor="foodHotel">SELECT HOTEL</label>
            <select id="foodHotel" value={selectedHotelId} onChange={handleHotelChange} disabled={loading || hotels.length === 0}>
              <option value="">Choose a hotel</option>
              {hotels.map((hotel) => (
                <option value={hotel.id} key={hotel.id}>{hotel.name} — {hotel.location}</option>
              ))}
            </select>
          </div>

          {selectedHotel && (
            <div className="selected-food-hotel">
              <span className="eyebrow">SELECTED PROPERTY</span>
              <h3>{selectedHotel.name}</h3>
              <p>{selectedHotel.location}</p>
            </div>
          )}

          {cart && selectedHotel && Number(cart.hotelId) !== Number(selectedHotel.id) && (
            <p className="food-cart-context" role="status">
              Your cart is saved for {cart.hotelName}. Adding a dish from {selectedHotel.name} will ask before replacing it.
            </p>
          )}
          {menuLoading && <p>Loading available food items...</p>}
          {menuError && <p className="auth-error" role="alert">{menuError}</p>}

          {!menuLoading && selectedHotelId && !menuError && (
            menuItems.length === 0 ? (
              <p className="food-empty-message">No food items are currently available at this hotel.</p>
            ) : (
              <div className="food-menu-grid">
                {menuItems.map((item) => (
                  <article className="food-menu-card" key={item.menuId}>
                    <div className="food-menu-image">
                      <img
                        src={item.imageUrl || FALLBACK_FOOD_IMAGE}
                        alt={item.name}
                        loading="lazy"
                        onError={(event) => {
                          if (event.currentTarget.src !== FALLBACK_FOOD_IMAGE) {
                            event.currentTarget.src = FALLBACK_FOOD_IMAGE;
                          }
                        }}
                      />
                    </div>
                    <div className="food-menu-info">
                      <span className="eyebrow">{item.categoryName}</span>
                      <h3>{item.name}</h3>
                      <p>{item.description}</p>
                      <div className="food-menu-meta">
                        <span>{item.vegetarian ? '🟢 Vegetarian' : '🔴 Non-Vegetarian'}</span>
                        <strong>₹{formatMoney(item.sellingPrice)}</strong>
                      </div>
                      <button
                        type="button"
                        className="primary-button food-add-button"
                        onClick={() => addToCart(item)}
                        disabled={item.available === false}
                      >
                        {cart?.items.some((cartItem) => cartItem.menuId === Number(item.menuId)) &&
                         Number(cart.hotelId) === Number(selectedHotel.id)
                          ? 'Add another'
                          : 'Add to Cart'}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )
          )}
        </section>

        <section className="food-cart-panel" id="food-cart" aria-labelledby="food-cart-title">
          <div className="food-cart-panel-heading">
            <div>
              <span className="eyebrow">YOUR SELECTION</span>
              <h2 id="food-cart-title">Your food cart</h2>
              <p>{cart ? `${itemCount} food ${itemCount === 1 ? 'unit' : 'units'} from ${cart.hotelName}` : 'Your cart is ready for something delicious.'}</p>
            </div>
            {cart && <button type="button" className="food-clear-cart" onClick={clearCart}>Clear cart</button>}
          </div>

          {cartNotice && <p className="food-cart-notice" role="status">{cartNotice}</p>}
          {cartError && <p className="food-cart-error" role="alert">{cartError}</p>}

          {orderSuccess ? (
            <div className="food-order-success" role="status">
              <span className="food-success-mark" aria-hidden="true">✓</span>
              <div>
                <h3>Order placed successfully</h3>
                <p>{orderSuccess.id === 'confirmed' ? 'Your order is confirmed.' : `Your order number is #${orderSuccess.id}.`}</p>
                <Link to="/my-food-orders" className="primary-button">View My Food Orders</Link>
              </div>
            </div>
          ) : !cart?.items.length ? (
            <div className="food-cart-empty">
              <span className="food-cart-empty-icon" aria-hidden="true">🛒</span>
              <h3>Your cart is empty</h3>
              <p>Choose a hotel and add a few favourites to begin.</p>
            </div>
          ) : (
            <>
              <div className="food-cart-lines">
                {cart.items.map((item) => (
                  <article className={`food-cart-line${item.available === false ? ' is-unavailable' : ''}`} key={item.menuId}>
                    <img src={item.imageUrl || FALLBACK_FOOD_IMAGE} alt="" />
                    <div className="food-cart-line-main">
                      <h3>{item.name}</h3>
                      <p>₹{formatMoney(item.unitPrice)} each</p>
                      {item.available === false && <span className="food-unavailable-label">Currently unavailable</span>}
                    </div>
                    <div className="food-quantity-control" aria-label={`Quantity for ${item.name}`}>
                      <button type="button" aria-label={`Decrease ${item.name} quantity`} onClick={() => changeQuantity(item.menuId, -1)} disabled={item.quantity <= 1}>−</button>
                      <span aria-live="polite">{item.quantity}</span>
                      <button type="button" aria-label={`Increase ${item.name} quantity`} onClick={() => changeQuantity(item.menuId, 1)} disabled={item.quantity >= MAX_ITEM_QUANTITY}>+</button>
                    </div>
                    <strong className="food-cart-subtotal">₹{formatMoney(item.unitPrice * item.quantity)}</strong>
                    <button type="button" className="food-remove-item" onClick={() => removeFromCart(item.menuId)} aria-label={`Remove ${item.name} from cart`}>Remove</button>
                  </article>
                ))}
              </div>

              <div className="food-cart-total-row">
                <span>Cart total</span>
                <strong>₹{formatMoney(cartTotal)}</strong>
              </div>

              {!checkoutOpen ? (
                <button type="button" className="primary-button food-checkout-trigger" onClick={openCheckout} disabled={!cart.items.length || orderLoading || loading}>
                  Continue to Checkout
                </button>
              ) : (
                <form className="food-checkout-form" onSubmit={handlePlaceOrder}>
                  <div className="food-checkout-heading">
                    <div>
                      <span className="eyebrow">SECURE YOUR MEAL</span>
                      <h3>Checkout at {cart.hotelName}</h3>
                    </div>
                    <button type="button" className="food-checkout-close" onClick={() => setCheckoutOpen(false)} aria-label="Close checkout">×</button>
                  </div>

                  {bookingState.loading ? (
                    <p className="food-checkout-message" role="status">Loading your confirmed bookings...</p>
                  ) : bookingState.error ? (
                    <p className="food-cart-error" role="alert">{bookingState.error}</p>
                  ) : eligibleBookings.length === 0 ? (
                    <div className="food-no-booking" role="status">
                      <strong>No eligible confirmed booking found.</strong>
                      <p>Food orders are available to guests with a confirmed booking at this hotel.</p>
                    </div>
                  ) : (
                    <>
                      <label htmlFor="foodBooking">Confirmed booking</label>
                      <select
                        id="foodBooking"
                        value={selectedBookingId}
                        onChange={(event) => { setSelectedBookingId(event.target.value); setServingDate(''); }}
                        required
                      >
                        <option value="">Choose your booking</option>
                        {eligibleBookings.map((booking) => (
                          <option key={booking.id} value={booking.id}>
                            Booking #{booking.id} · {booking.checkIn} to {booking.checkOut}
                          </option>
                        ))}
                      </select>

                      <label htmlFor="servingDate">Serving date</label>
                      <input
                        id="servingDate"
                        type="date"
                        value={servingDate}
                        min={selectedBooking?.checkIn || ''}
                        max={lastServingDate(selectedBooking?.checkOut)}
                        onChange={(event) => setServingDate(event.target.value)}
                        required
                        disabled={!selectedBookingId}
                      />

                      <label htmlFor="foodInstructions">Special instructions <span>(optional)</span></label>
                      <textarea
                        id="foodInstructions"
                        value={specialInstructions}
                        onChange={(event) => setSpecialInstructions(event.target.value)}
                        maxLength={500}
                        placeholder="Less spicy, no onions, etc."
                      />

                      <div className="food-checkout-review">
                        <span>{cart.items.length} dishes · {itemCount} units</span>
                        <strong>₹{formatMoney(cartTotal)}</strong>
                      </div>

                      <button
                        type="submit"
                        className="primary-button food-checkout-submit"
                        disabled={orderLoading || bookingState.loading || !selectedBookingId || unavailableItems.length > 0}
                      >
                        {orderLoading ? 'Placing order...' : `Place Order · ₹${formatMoney(cartTotal)}`}
                      </button>
                    </>
                  )}
                </form>
              )}
            </>
          )}
        </section>

        <section className="food-discovery-note">
          <span className="eyebrow">A TASTE OF YOUR DESTINATION</span>
          <h2>Good food makes every stay memorable.</h2>
          <p>Browse hotel menus publicly. Food ordering is available to guests with an eligible confirmed booking.</p>
        </section>
      </main>

      <footer className="footer">
        <p>Royal BNF – Your Stay. Your Taste. Your Experience.</p>
        <span>© 2026 Royal BNF</span>
      </footer>
    </div>
  );
}

export default FoodExperience;
