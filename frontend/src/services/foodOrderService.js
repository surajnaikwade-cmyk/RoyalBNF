
const API_BASE_URL = 'http://localhost:8080/api/food-orders';

function getAuthHeaders() {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Please log in to place a food order.');
  }

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function placeFoodOrder(orderData) {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(orderData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || 'Unable to place food order.'
    );
  }

  return data;
}

export async function getMyFoodOrders() {
  const response = await fetch(`${API_BASE_URL}/my-orders`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || 'Unable to fetch food orders.'
    );
  }

  return data;
}
