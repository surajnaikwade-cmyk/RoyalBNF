
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import App from './App.jsx';
import HotelDetails from './pages/HotelDetails.jsx';
import Register from './pages/Register.jsx';
import Login from './pages/Login.jsx';
import Booking from './pages/Booking.jsx';
import MyBookings from './pages/MyBookings.jsx';
import FoodExperience from './pages/FoodExperience.jsx';
import HotelOwnerLogin from './pages/HotelOwnerLogin';
import HotelOwnerDashboard from './pages/HotelOwnerDashboard';
import MyFoodOrders from './pages/MyFoodOrders';

import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/hotels/:id" element={<HotelDetails />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/bookings/new" element={<Booking />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/food" element={<FoodExperience />} />
        <Route
            path="/hotel-owner/login"
            element={<HotelOwnerLogin />}
        />
        <Route
            path="/hotel-owner/dashboard"
            element={<HotelOwnerDashboard />}
        />
        <Route
            path="/my-food-orders"
            element={<MyFoodOrders />}
        />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
