
const API_BASE_URL = 'http://localhost:8080/api/food-orders';

function createApiError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function getAuthHeaders() {
  const token = localStorage.getItem('token');

  if (!token) {
    throw createApiError('Please log in to place a food order.', 401);
  }

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

async function getResponseData(response, fallbackMessage) {
  const text = await response.text();
  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (response.ok) return data;

  let message = data?.message || fallbackMessage;
  if (response.status === 401) {
    message = 'Your session has expired. Please sign in again.';
  } else if (response.status === 403) {
    message = 'You are not authorized to place this food order.';
  }

  throw createApiError(message, response.status);
}

async function sendRequest(url, options, fallbackMessage) {
  let response;
  try {
    response = await fetch(url, options);
  } catch {
    throw createApiError(
      'Unable to reach Royal BNF. Check your connection and try again.',
      0
    );
  }

  return getResponseData(response, fallbackMessage);
}

export async function placeFoodOrder(orderData) {
  return sendRequest(API_BASE_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(orderData),
  }, 'Unable to place food order.');
}

export async function getMyFoodOrders() {
  return sendRequest(`${API_BASE_URL}/my-orders`, {
    method: 'GET',
    headers: getAuthHeaders(),
  }, 'Unable to fetch food orders.');
}
