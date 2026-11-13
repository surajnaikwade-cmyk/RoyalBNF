
import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getRoomById } from '../services/roomService';
import { createBooking } from '../services/bookingService';
import '../App.css';

function Booking() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const roomId = searchParams.get('roomId');

  const [room, setRoom] = useState(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadRoom() {
      try {
        if (!roomId) {
          throw new Error('No room was selected.');
        }

        const roomData = await getRoomById(roomId);
        setRoom(roomData);
      } catch (err) {
        setError(err.message || 'Unable to load room details.');
      } finally {
        setLoading(false);
      }
    }

    loadRoom();
  }, [roomId]);

  const today = new Date().toLocaleDateString('en-CA');

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!localStorage.getItem('token')) {
      navigate('/login');
      return;
    }

    if (!checkIn || !checkOut) {
      setError('Please select both check-in and check-out dates.');
      return;
    }

    if (checkIn < today) {
      setError('Check-in date cannot be in the past.');
      return;
    }

    if (checkOut <= checkIn) {
      setError('Check-out must be after check-in.');
      return;
    }

    if (numberOfGuests > room.capacity) {
      setError(`This room can accommodate a maximum of ${room.capacity} guests.`);
      return;
    }

    try {
      setSubmitting(true);

      const booking = await createBooking({
        roomId: Number(roomId),
        checkIn,
        checkOut,
        numberOfGuests: Number(numberOfGuests),
      });

      navigate('/my-bookings', {
        state: { successMessage: 'Your booking was created successfully!' },
      });
    } catch (err) {
      setError(err.message || 'Unable to create booking.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="page-message">Loading room details...</div>;
  }

  if (!room) {
    return (
      <div className="page-message">
        {error || 'Room not found.'}
        <p><Link to="/">Return Home</Link></p>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="brand">
          <span className="brand-mark">R</span>
          <span>
            <strong>ROYAL BNF</strong>
            <small>ROYAL BED AND FOOD</small>
          </span>
        </Link>

        <span className="eyebrow">RESERVE YOUR STAY</span>
        <h1>Complete Your Booking</h1>
        <p>Choose your dates and number of guests.</p>

        <div className="booking-room-summary">
          <h3>{room.hotel?.name || 'Selected Hotel'}</h3>
          <p>Room {room.roomNumber} · {room.roomType}</p>
          <p>Capacity: {room.capacity} guests</p>
          <strong>
            ₹{Number(room.pricePerNight).toLocaleString('en-IN')} / night
          </strong>
        </div>

        <form onSubmit={handleSubmit}>
          <label htmlFor="checkIn">Check-in Date</label>
          <input
            id="checkIn"
            type="date"
            min={today}
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            required
          />

          <label htmlFor="checkOut">Check-out Date</label>
          <input
            id="checkOut"
            type="date"
            min={checkIn || today}
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            required
          />

          <label htmlFor="guests">Number of Guests</label>
          <input
            id="guests"
            type="number"
            min="1"
            max={room.capacity}
            value={numberOfGuests}
            onChange={(e) => setNumberOfGuests(e.target.value)}
            required
          />

          {error && <p className="auth-error">{error}</p>}

          <button
            type="submit"
            className="primary-button"
            disabled={submitting}
          >
            {submitting ? 'Processing...' : 'Confirm Booking'}
          </button>
        </form>

        <p>
          <Link to={`/hotels/${room.hotel?.id || ''}`}>
            ← Back to Hotel
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Booking;
