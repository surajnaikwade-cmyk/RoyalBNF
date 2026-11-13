
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { getAllHotels } from '../services/hotelService';
import { getMyBookings } from '../services/bookingService';
import { placeFoodOrder } from '../services/foodOrderService';

import {
  getFoodCategories,
  getHotelFoodMenu
} from '../services/foodService';

import '../App.css';

function FoodExperience() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [selectedHotelId, setSelectedHotelId] = useState('');
  const [menuItems, setMenuItems] = useState([]);

  const [loading, setLoading] = useState(true);
  const [menuLoading, setMenuLoading] = useState(false);
  const [error, setError] = useState('');
  const [menuError, setMenuError] = useState('');

  // Food ordering states
  const [selectedItem, setSelectedItem] = useState(null);
  const [eligibleBookings, setEligibleBookings] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [servingDate, setServingDate] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [orderError, setOrderError] = useState('');
  const [orderMessage, setOrderMessage] = useState('');
  const [orderLoading, setOrderLoading] = useState(false);

  // Load categories and hotels
  useEffect(() => {
    async function loadFoodData() {
      try {
        setLoading(true);
        setError('');

        const [categoryData, hotelData] = await Promise.all([
          getFoodCategories(),
          getAllHotels()
        ]);

        setCategories(categoryData);
        setHotels(hotelData);
      } catch (err) {
        setError('Unable to load food experience data.');
      } finally {
        setLoading(false);
      }
    }

    loadFoodData();
  }, []);

  // Load selected hotel's menu
  async function handleHotelChange(event) {
    const hotelId = event.target.value;

    setSelectedHotelId(hotelId);
    setMenuItems([]);
    setMenuError('');
    setSelectedItem(null);
    setOrderError('');
    setOrderMessage('');

    if (!hotelId) return;

    try {
      setMenuLoading(true);

      const data = await getHotelFoodMenu(hotelId);
      setMenuItems(data);
    } catch (err) {
      setMenuError(err.message || 'Unable to load hotel menu.');
    } finally {
      setMenuLoading(false);
    }
  }

  const selectedHotel = hotels.find(
    (hotel) => hotel.id === Number(selectedHotelId)
  );

  // Load customer's eligible bookings
  async function handleOrderClick(item) {
    if (!selectedHotel) {
      setOrderError('Please select a hotel first.');
      return;
    }

    if (!localStorage.getItem('token')) {
      navigate('/login');
      return;
    }

    setSelectedItem(item);
    setEligibleBookings([]);
    setSelectedBookingId('');
    setQuantity(1);
    setServingDate('');
    setSpecialInstructions('');
    setOrderError('');
    setOrderMessage('');

    try {
      const bookings = await getMyBookings();

      const matchingBookings = bookings.filter(
        (booking) =>
          booking.hotelName === selectedHotel.name &&
          booking.status === 'CONFIRMED'
      );

      setEligibleBookings(matchingBookings);

      if (matchingBookings.length === 0) {
        setOrderError(
          'You need a confirmed booking at this hotel to order food.'
        );
      }
    } catch (err) {
      setOrderError(err.message || 'Unable to load your bookings.');
    }
  }

  // Get selected booking
  const selectedBooking = eligibleBookings.find(
    (booking) => booking.id === Number(selectedBookingId)
  );

  // Calculate last eligible serving date (checkout is excluded)
  const lastServingDate = selectedBooking
    ? (() => {
        const date = new Date(`${selectedBooking.checkOut}T00:00:00`);
        date.setDate(date.getDate() - 1);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
      })()
    : '';

  // Submit food order
  async function handlePlaceOrder(event) {
    event.preventDefault();
    setOrderError('');
    setOrderMessage('');

    if (!selectedBookingId || !servingDate) {
      setOrderError('Please select a booking and serving date.');
      return;
    }

    try {
      setOrderLoading(true);

      const order = await placeFoodOrder({
        bookingId: Number(selectedBookingId),
        hotelFoodMenuId: selectedItem.menuId,
        quantity: Number(quantity),
        servingDate,
        specialInstructions: specialInstructions.trim()
      });

      setOrderMessage(
        `Order placed successfully! Order ID: ${order.id}`
      );

      // Keep the success message visible.
      setSelectedItem(null);
      setEligibleBookings([]);
      setSelectedBookingId('');
      setQuantity(1);
      setServingDate('');
      setSpecialInstructions('');
    } catch (err) {
      setOrderError(err.message || 'Unable to place food order.');
    } finally {
      setOrderLoading(false);
    }
  }

  return (
    <div className="details-page food-experience-page">

      <header className="details-navbar">
        <Link to="/" className="brand">
          <span className="brand-mark">R</span>
          <span>
            <strong>ROYAL BNF</strong>
            <small>ROYAL BED AND FOOD</small>
          </span>
        </Link>

        <Link to="/" className="text-link">
          ← Back to Home
        </Link>
      </header>

      <section className="food-experience-hero">
        <span className="eyebrow">THE ROYAL FOOD EXPERIENCE</span>

        <h1>Discover the taste of India.</h1>

        <p>
          Every region has a story, and every story has a flavour.
          Explore traditional cuisines prepared by our hotel partners.
        </p>
      </section>

      <main className="details-content">

        {/* Regional Food Categories */}
        <section className="food-category-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">EXPLORE REGIONAL CUISINES</span>
              <h2>Flavours worth discovering.</h2>
              <p>
                Explore the traditional cuisines of different regions.
              </p>
            </div>
          </div>

          {loading && <p>Loading food categories...</p>}

          {error && <p className="auth-error">{error}</p>}

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

        {/* Hotel Menu Selection */}
        <section className="hotel-food-section">

          <div className="section-heading">
            <div>
              <span className="eyebrow">MENUS FROM OUR HOTELS</span>
              <h2>Explore the taste of your stay.</h2>
              <p>
                Select a hotel to discover its available food menu.
              </p>
            </div>
          </div>

          <div className="food-hotel-selector">
            <label htmlFor="foodHotel">SELECT HOTEL</label>

            <select
              id="foodHotel"
              value={selectedHotelId}
              onChange={handleHotelChange}
              disabled={loading || hotels.length === 0}
            >
              <option value="">Choose a hotel</option>

              {hotels.map((hotel) => (
                <option value={hotel.id} key={hotel.id}>
                  {hotel.name} — {hotel.location}
                </option>
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

          {menuLoading && (
            <p>Loading available food items...</p>
          )}

          {menuError && (
            <p className="auth-error">{menuError}</p>
          )}

          {!menuLoading && selectedHotelId && !menuError && (
            menuItems.length === 0 ? (
              <p className="food-empty-message">
                No food items are currently available at this hotel.
              </p>
            ) : (
              <>
                <div className="food-menu-grid">
                  {menuItems.map((item) => (
                    <article className="food-menu-card" key={item.menuId}>

                      <div className="food-menu-image">
                        <img
                          src={
                            item.imageUrl &&
                            !item.imageUrl.includes('example.com')
                              ? item.imageUrl
                              : 'https://images.unsplash.com/photo-1547592180-85f173990554?w=900'
                          }
                          alt={item.name}
                          onError={(event) => {
                            event.currentTarget.src =
                              'https://images.unsplash.com/photo-1547592180-85f173990554?w=900';
                          }}
                        />
                      </div>

                      <div className="food-menu-info">
                        <span className="eyebrow">
                          {item.categoryName}
                        </span>

                        <h3>{item.name}</h3>

                        <p>{item.description}</p>

                        <div className="food-menu-meta">
                          <span>
                            {item.vegetarian
                              ? '🟢 Vegetarian'
                              : '🔴 Non-Vegetarian'}
                          </span>

                          <strong>
                            ₹{Number(item.sellingPrice).toLocaleString('en-IN')}
                          </strong>
                        </div>

                        <button
                          type="button"
                          className="primary-button"
                          onClick={() => handleOrderClick(item)}
                        >
                          Order Now →
                        </button>
                      </div>

                    </article>
                  ))}
                </div>
              </>
            )
          )}

          {/* Food Order Form */}
          {selectedItem && (
            <div className="food-order-form">
              <h3>Order {selectedItem.name}</h3>

              {orderError && (
                <p className="auth-error">{orderError}</p>
              )}

              {eligibleBookings.length > 0 && (
                <form onSubmit={handlePlaceOrder}>

                  <label htmlFor="foodBooking">
                    Select Confirmed Booking
                  </label>

                  <select
                    id="foodBooking"
                    value={selectedBookingId}
                    onChange={(e) => {
                      setSelectedBookingId(e.target.value);
                      setServingDate('');
                    }}
                    required
                  >
                    <option value="">Choose your booking</option>

                    {eligibleBookings.map((booking) => (
                      <option key={booking.id} value={booking.id}>
                        Booking #{booking.id} — {booking.checkIn} to {booking.checkOut}
                      </option>
                    ))}
                  </select>

                  <label htmlFor="servingDate">Serving Date</label>

                  <input
                    id="servingDate"
                    type="date"
                    value={servingDate}
                    min={selectedBooking?.checkIn || ''}
                    max={lastServingDate}
                    onChange={(e) => setServingDate(e.target.value)}
                    required
                    disabled={!selectedBookingId}
                  />

                  <label htmlFor="quantity">Quantity</label>

                  <input
                    id="quantity"
                    type="number"
                    min="1"
                    max="10"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                  />

                  <label htmlFor="specialInstructions">
                    Special Instructions
                  </label>

                  <textarea
                    id="specialInstructions"
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    maxLength="500"
                    placeholder="Less spicy, no onions, etc."
                  />

                  <button
                    type="submit"
                    className="primary-button"
                    disabled={orderLoading || !selectedBookingId}
                  >
                    {orderLoading
                      ? 'Placing Order...'
                      : 'Confirm Food Order'}
                  </button>
                </form>
              )}

              <button
                type="button"
                className="text-link"
                onClick={() => {
                  setSelectedItem(null);
                  setEligibleBookings([]);
                  setSelectedBookingId('');
                  setOrderError('');
                }}
              >
                Close
              </button>
            </div>
          )}

          {orderMessage && (
            <p className="booking-success">{orderMessage}</p>
          )}

        </section>

        <section className="food-discovery-note">
          <span className="eyebrow">A TASTE OF YOUR DESTINATION</span>
          <h2>Good food makes every stay memorable.</h2>
          <p>
            Browse hotel menus publicly. Food ordering is available
            to guests with an eligible confirmed booking.
          </p>
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
