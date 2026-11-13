
const API_BASE_URL = 'http://localhost:8080/api/hotel-owner/orders';

function getAuthHeaders() {
    const token = localStorage.getItem('ownerToken');

    if (!token) {
        throw new Error('Please log in as a hotel owner.');
    }

    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
    };
}

async function handleResponse(response) {
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
        throw new Error(
            data?.message || 'Unable to process the request.'
        );
    }

    return data;
}

export async function getHotelOwnerOrders() {
    const response = await fetch(API_BASE_URL, {
        method: 'GET',
        headers: getAuthHeaders()
    });

    return handleResponse(response);
}

export async function updateFoodOrderStatus(orderId, status) {
    const response = await fetch(
        `${API_BASE_URL}/${orderId}/status`,
        {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify({ status })
        }
    );

    return handleResponse(response);
}
