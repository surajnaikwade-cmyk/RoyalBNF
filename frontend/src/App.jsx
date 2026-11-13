
import './App.css';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllHotels } from './services/hotelService';

function App() {
  // Hotel data and API states
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Customer authentication state
  const [customer, setCustomer] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('customer'));
    } catch {
      return null;
    }
  });

  // Fetch hotels from Spring Boot backend
  useEffect(() => {
    getAllHotels()
      .then((data) => setHotels(data))
      .catch((err) => {
        console.error('Hotel loading error:', err);
        setError('Unable to load hotels. Please try again.');
      })
      .finally(() => setLoading(false));
  }, []);

  // Logout customer
  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('customer');
    setCustomer(null);
  }

  return (
    <div className="website">

      {/* Top announcement */}
      <div className="topbar">
        Experience exceptional stays and authentic regional cuisine.
      </div>

      {/* Navigation */}
      <header className="navbar">

        <Link to="/" className="brand">
          <span className="brand-mark">R</span>
          <span>
            <strong>ROYAL BNF</strong>
            <small>ROYAL BED AND FOOD</small>
          </span>
        </Link>

        <nav>
          <a href="#home">Home</a>
          <a href="#hotels">Explore Hotels</a>
          <a href="#food">Food Experience</a>
          <a href="#about">About Us</a>
        </nav>

       
  {/* Authentication-aware navigation */}
        <div className="nav-actions">

          {customer ? (
            <>
              <span className="login-link">
                Welcome, {customer.fullName}
              </span>

              <Link to="/my-bookings" className="login-link">
                My Bookings
              </Link>

              <Link to="/my-food-orders" className="login-link">
                My Food Orders
              </Link>

              <button
                type="button"
                className="nav-button"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>

          ) : (
            <>
              <Link to="/login" className="login-link">
                Sign In
              </Link>

              <Link to="/register" className="nav-button">
                Get Started
              </Link>
            </>
          )}
        </div>


      </header>

      <main>

        {/* Hero Section */}
        <section className="hero" id="home">
          <div className="hero-content">
            <span className="eyebrow">
              MORE THAN JUST A STAY
            </span>

            <h1>
              Every stay has
              <br />
              a <em>story</em> to tell.
            </h1>

            <p>
              Discover beautiful destinations, exceptional hospitality
              and the authentic flavours of India's diverse cuisines.
            </p>

            <a href="#hotels" className="primary-button">
              Explore Stays <span>↗</span>
            </a>
          </div>

          <div className="hero-note">
            <span>01 — 03</span>
            <span>DISCOVER YOUR NEXT EXPERIENCE</span>
          </div>
        </section>

        {/* Hotel Search Section */}
        <section className="search-section">
          <div className="search-heading">
            <span>PLAN YOUR JOURNEY</span>
            <h2>Find your perfect stay.</h2>
          </div>

          <div className="search-fields">
            <label>
              DESTINATION
              <input placeholder="Where would you like to go?" />
            </label>

            <label>
              CHECK IN
              <input type="date" />
            </label>

            <label>
              CHECK OUT
              <input type="date" />
            </label>

            <label>
              GUESTS
              <select defaultValue="2">
                <option value="1">1 Guest</option>
                <option value="2">2 Guests</option>
                <option value="3">3 Guests</option>
                <option value="4">4 Guests</option>
              </select>
            </label>

            <a href="#hotels" className="search-button">
              Search Stays →
            </a>
          </div>
        </section>

        {/* Hotels Section */}
        <section className="hotels-section section" id="hotels">

          <div className="section-heading">
            <div>
              <span className="eyebrow">HANDPICKED FOR YOU</span>
              <h2>Stays worth remembering.</h2>
              <p>
                Explore distinctive properties for every kind of journey.
              </p>
            </div>

            <a href="#hotels" className="text-link">
              Explore all hotels ↗
            </a>
          </div>

          <div className="hotel-grid">

            {loading && (
              <p>Loading hotels...</p>
            )}

            {error && (
              <p>{error}</p>
            )}

            {!loading && !error && hotels.map((hotel) => (

              <article className="hotel-card" key={hotel.id}>

                <div className="hotel-image">
                  <img
                    src={
                      hotel.id === 2
                        ? 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=900'
                        : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900'
                    }
                    alt={hotel.name}
                  />

                  <span className="hotel-tag">
                    Featured Stay
                  </span>
                </div>

                <div className="hotel-info">

                  <span className="hotel-location">
                    {hotel.location}
                  </span>

                  <h3>{hotel.name}</h3>

                  <p className="hotel-description">
                    {hotel.description}
                  </p>

                  <div className="hotel-bottom">
                    <p>Discover this property</p>

                    <Link to={`/hotels/${hotel.id}`}>
                      View Stay ↗
                    </Link>
                  </div>

                </div>
              </article>

            ))}

            {!loading && !error && hotels.length === 0 && (
              <p>No hotels available currently.</p>
            )}

          </div>
        </section>

        {/* Royal Food Experience */}
        <section className="food-section" id="food">

          <div className="food-image">
            <img
              src="https://images.unsplash.com/photo-1547592180-85f173990554?w=1200"
              alt="Traditional Indian cuisine"
            />
          </div>

          <div className="food-content">

            <span className="eyebrow">
              THE ROYAL FOOD EXPERIENCE
            </span>

            <h2>
              Travel for the
              <br />
              stay. Remember
              <br />
              <em>the taste.</em>
            </h2>

            <p>
              Discover regional Indian cuisines prepared by the hotels
              you stay in. From Rajasthani Dal Baati to the flavours
              of Maharashtra, every destination has something special
              on its table.
            </p>

            <a href="/food" className="primary-button">
              Discover Food <span>↗</span>
            </a>

          </div>
        </section>

        {/* About Section */}
        <section className="about-section section" id="about">

          <span className="eyebrow">
            THE ROYAL BNF PROMISE
          </span>

          <h2>
            A beautiful stay.
            <br />
            A taste of <em>local culture.</em>
          </h2>

          <p>
            We bring accommodation and regional food experiences
            together, making every journey a little more memorable.
          </p>

        </section>

      </main>

      {/* Footer */}
      <footer className="footer">

        <Link to="/" className="brand footer-brand">
          <span className="brand-mark">R</span>

          <span>
            <strong>ROYAL BNF</strong>
            <small>ROYAL BED AND FOOD</small>
          </span>
        </Link>

        <p>Your Stay. Your Taste. Your Experience.</p>

        <span>
          © 2026 Royal BNF. All rights reserved.
        </span>

      </footer>

    </div>
  );
}

export default App;
