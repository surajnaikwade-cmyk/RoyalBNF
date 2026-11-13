
const API_BASE_URL = 'http://localhost:8080/api';

export async function getFoodCategories() {
  const response = await fetch(`${API_BASE_URL}/food-categories`);

  if (!response.ok) {
    throw new Error('Unable to fetch food categories.');
  }

  return response.json();
}

export async function getHotelFoodMenu(hotelId) {
  const response = await fetch(
    `${API_BASE_URL}/hotels/${hotelId}/food-menu`
  );

  if (!response.ok) {
    throw new Error('Unable to fetch hotel food menu.');
  }

  return response.json();
}
