
const API_BASE_URL = 'http://localhost:8080/api/bookings';

// Get JWT token
function getAuthHeaders() {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Please log in to continue.');
  }

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

// Create a new booking
export async function createBooking(bookingData) {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(bookingData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Unable to create booking.');
  }

  return data;
}

// Get logged-in customer's bookings
export async function getMyBookings() {
  const response = await fetch(`${API_BASE_URL}/my-bookings`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Unable to fetch bookings.');
  }

  return data;
}

// Get booking by ID
export async function getBookingById(id) {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Unable to fetch booking details.');
  }

  return data;
}

// Cancel a booking
export async function cancelBooking(id) {
  const response = await fetch(`${API_BASE_URL}/${id}/cancel`, {
    method: 'PUT',
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Unable to cancel booking.');
  }

  return data;
}
