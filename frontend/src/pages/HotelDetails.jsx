
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getHotelById } from '../services/hotelService';
import { getAllRooms } from '../services/roomService';
import '../App.css';

function HotelDetails() {
  const { id } = useParams();

  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadHotelDetails() {
      try {
        setLoading(true);
        setError('');

        const [hotelData, roomData] = await Promise.all([
          getHotelById(id),
          getAllRooms()
        ]);

        setHotel(hotelData);

        const hotelRooms = roomData.filter(
          (room) =>
            room.hotel?.id === Number(id) && room.active
        );

        setRooms(hotelRooms);
      } catch (err) {
        console.error(err);
        setError('Unable to load hotel details. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadHotelDetails();
  }, [id]);

  if (loading) {
    return <div className="page-message">Loading hotel details...</div>;
  }

  if (error || !hotel) {
    return (
      <div className="page-message">
        {error || 'Hotel not found.'}
        <p><Link to="/">Return Home</Link></p>
      </div>
    );
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

      <section className="details-hero">
        <img
          src={
            hotel.id === 2
              ? 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1600'
              : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600'
          }
          alt={hotel.name}
        />

        <div className="details-hero-content">
          <span className="eyebrow">DISCOVER YOUR STAY</span>
          <h1>{hotel.name}</h1>
          <p>📍 {hotel.location}</p>
        </div>
      </section>

      <main className="details-content">

        <section className="hotel-description">
          <span className="eyebrow">WELCOME TO {hotel.name.toUpperCase()}</span>
          <h2>Experience exceptional hospitality.</h2>
          <p>{hotel.description}</p>
        </section>

        <section className="amenities-section">
          <span className="eyebrow">HOTEL FACILITIES</span>
          <h2>Designed for your comfort.</h2>

          <div className="amenities-list">
            {hotel.amenities?.map((amenity) => (
              <span className="amenity-item" key={amenity}>
                ✓ {amenity}
              </span>
            ))}
          </div>
        </section>

        <section className="rooms-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">ACCOMMODATION</span>
              <h2>Choose your room.</h2>
              <p>Find the perfect space for your stay.</p>
            </div>
          </div>

          {rooms.length === 0 ? (
            <p>No active rooms are available at this hotel.</p>
          ) : (
            <div className="details-room-grid">
              {rooms.map((room) => (
                <article className="details-room-card" key={room.id}>
                  <img
                    src="https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=900"
                    alt={`${room.roomType} room`}
                  />

                  <div className="details-room-info">
                    <span className="eyebrow">{room.roomType}</span>
                    <h3>Room {room.roomNumber}</h3>
                    <p>{room.description}</p>

                    <div className="room-meta">
                      <span>👥 {room.capacity} Guests</span>
                    </div>

                    <div className="room-price">
                      <strong>₹{Number(room.pricePerNight).toLocaleString('en-IN')}</strong>
                      <span> / night</span>
                    </div>

                    <Link
                      to={`/bookings/new?roomId=${room.id}`}
                      className="primary-button"
                    >
                      Book This Room ↗
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

      </main>

      <footer className="footer">
        <p>Royal BNF – Your Stay. Your Taste. Your Experience.</p>
        <span>© 2026 Royal BNF</span>
      </footer>

    </div>
  );
}

export default HotelDetails;
