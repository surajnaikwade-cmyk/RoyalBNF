
package com.royalbnf.backend.dto;

import java.math.BigDecimal;

public record HotelFoodMenuResponse(
        Long menuId,
        Long hotelId,
        String hotelName,
        Long foodItemId,
        String foodName,
        BigDecimal sellingPrice,
        boolean available
) {}
