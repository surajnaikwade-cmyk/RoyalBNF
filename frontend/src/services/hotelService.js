const API_BASE_URL = 'http://localhost:8080/api';

export async function getAllHotels() {
  const response = await fetch(`${API_BASE_URL}/hotels`);

  if (!response.ok) {
    throw new Error('Unable to fetch hotels');
  }

  return response.json();
}

export async function getHotelById(id) {
  const response = await fetch(`${API_BASE_URL}/hotels/${id}`);

  if (!response.ok) {
    throw new Error('Unable to fetch hotel details');
  }

  return response.json();
}