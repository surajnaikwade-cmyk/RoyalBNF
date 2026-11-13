
package com.royalbnf.backend.dto;

import com.royalbnf.backend.entity.FoodOrderStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record FoodOrderResponse(

        Long id,
        Long bookingId,
        Long hotelId,
        String hotelName,

        List<FoodOrderItemResponse> items,

        LocalDate servingDate,
        String specialInstructions,
        BigDecimal totalPrice,
        FoodOrderStatus status,
        LocalDateTime createdAt

) {

    public record FoodOrderItemResponse(

            Long foodOrderItemId,
            Long hotelFoodMenuId,
            Long foodItemId,
            String foodName,
            Integer quantity,
            BigDecimal unitPrice,
            BigDecimal totalPrice

    ) {}
}
