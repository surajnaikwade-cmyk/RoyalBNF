
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getMyBookings, cancelBooking } from '../services/bookingService';
import '../App.css';

function MyBookings() {
  const navigate = useNavigate();
  const location = useLocation();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState(
    location.state?.successMessage || ''
  );

  useEffect(() => {
    async function loadBookings() {
      try {
        const data = await getMyBookings();
        setBookings(data);
      } catch (err) {
        setError(err.message || 'Unable to load your bookings.');

        if (
          err.message?.toLowerCase().includes('log in') ||
          err.message?.toLowerCase().includes('unauthorized')
        ) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    }

    loadBookings();
  }, [navigate]);

  async function handleCancel(bookingId) {
    const confirmed = window.confirm(
      'Are you sure you want to cancel this booking?'
    );

    if (!confirmed) return;

    try {
      const updatedBooking = await cancelBooking(bookingId);

      setBookings((currentBookings) =>
        currentBookings.map((booking) =>
          booking.id === bookingId ? updatedBooking : booking
        )
      );

      setMessage('Your booking has been cancelled successfully.');
      setError('');
    } catch (err) {
      setError(err.message || 'Unable to cancel booking.');
    }
  }

  if (loading) {
    return <div className="page-message">Loading your bookings...</div>;
  }

  return (
    <div className="details-page">
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

      <main className="details-content my-bookings-content">
        <section className="my-bookings-heading">
          <span className="eyebrow">YOUR JOURNEY WITH US</span>
          <h1>My Bookings</h1>
          <p>Manage your reservations and get ready for your stay.</p>
        </section>

        {message && (
          <p className="booking-success">{message}</p>
        )}

        {error && (
          <p className="auth-error">{error}</p>
        )}

        {bookings.length === 0 ? (
          <section className="empty-bookings">
            <h2>No bookings yet</h2>
            <p>Your next memorable stay is waiting for you.</p>
            <Link to="/" className="primary-button">
              Explore Hotels
            </Link>
          </section>
        ) : (
          <div className="my-bookings-list">
            {bookings.map((booking) => (
              <article className="my-booking-card" key={booking.id}>
                <div className="booking-card-header">
                  <div>
                    <span className="eyebrow">
                      BOOKING #{booking.id}
                    </span>
                    <h2>{booking.hotelName}</h2>
                    <p>{booking.hotelLocation}</p>
                  </div>

                  <span
                    className={`booking-status ${booking.status?.toLowerCase()}`}
                  >
                    {booking.status}
                  </span>
                </div>

                <div className="booking-card-details">
                  <div>
                    <span>Room</span>
                    <strong>
                      {booking.roomNumber} · {booking.roomType}
                    </strong>
                  </div>

                  <div>
                    <span>Check-in</span>
                    <strong>{booking.checkIn}</strong>
                  </div>

                  <div>
                    <span>Check-out</span>
                    <strong>{booking.checkOut}</strong>
                  </div>

                  <div>
                    <span>Guests</span>
                    <strong>{booking.numberOfGuests}</strong>
                  </div>

                  <div>
                    <span>Total Price</span>
                    <strong>
                      ₹{Number(booking.totalPrice).toLocaleString('en-IN')}
                    </strong>
                  </div>
                </div>

                {booking.status === 'CONFIRMED' && (
                  <div className="booking-card-actions">
                    <button
                      type="button"
                      className="cancel-booking-button"
                      onClick={() => handleCancel(booking.id)}
                    >
                      Cancel Booking
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </main>

      <footer className="footer">
        <p>Royal BNF – Your Stay. Your Taste. Your Experience.</p>
        <span>© 2026 Royal BNF</span>
      </footer>
    </div>
  );
}

export default MyBookings;
