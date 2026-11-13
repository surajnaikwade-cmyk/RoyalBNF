
const API_BASE_URL = 'http://localhost:8080/api/hotel-owner';

export async function hotelOwnerLogin(credentials) {
    const response = await fetch(
        `${API_BASE_URL}/auth/login`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || 'Invalid hotel-owner email or password.'
        );
    }

    // Keep owner authentication separate from customer authentication.
    localStorage.setItem('ownerToken', data.token);

    localStorage.setItem(
        'hotelOwner',
        JSON.stringify({
            ownerId: data.ownerId,
            fullName: data.fullName,
            email: data.email,
            hotelId: data.hotelId,
            hotelName: data.hotelName
        })
    );

    return data;
}

export function hotelOwnerLogout() {
    localStorage.removeItem('ownerToken');
    localStorage.removeItem('hotelOwner');
}
