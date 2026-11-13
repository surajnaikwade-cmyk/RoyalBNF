package com.royalbnf.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record HotelFoodMenuRequest(

        @NotNull(message = "Hotel ID is required")
        Long hotelId,

        @NotNull(message = "Food item ID is required")
        Long foodItemId,

        @NotNull(message = "Selling price is required")
        @DecimalMin(
                value = "0.01",
                message = "Selling price must be greater than zero"
        )
        BigDecimal sellingPrice
) {}