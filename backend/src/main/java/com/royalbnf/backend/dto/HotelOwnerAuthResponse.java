
package com.royalbnf.backend.dto;

public record HotelOwnerAuthResponse(
        Long ownerId,
        String fullName,
        String email,
        Long hotelId,
        String hotelName,
        String token,
        String tokenType
) {}
