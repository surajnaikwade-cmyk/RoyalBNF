
const API_BASE_URL = 'http://localhost:8080/api';

export async function getAllRooms() {
  const response = await fetch(`${API_BASE_URL}/rooms`);

  if (!response.ok) {
    throw new Error('Unable to fetch rooms');
  }

  return response.json();
}

export async function getRoomById(id) {
  const response = await fetch(`${API_BASE_URL}/rooms/${id}`);

  if (!response.ok) {
    throw new Error('Unable to fetch room details');
  }

  return response.json();
}
