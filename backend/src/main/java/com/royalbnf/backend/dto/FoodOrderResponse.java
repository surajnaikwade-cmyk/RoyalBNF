
package com.royalbnf.backend.dto;

import com.royalbnf.backend.entity.FoodOrderStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record FoodOrderResponse(
        Long id,
        Long bookingId,
        Long hotelId,
        String hotelName,
        Long foodItemId,
        String foodName,
        Integer quantity,
        LocalDate servingDate,
        String specialInstructions,
        BigDecimal unitPrice,
        BigDecimal totalPrice,
        FoodOrderStatus status,
        LocalDateTime createdAt
) {}
