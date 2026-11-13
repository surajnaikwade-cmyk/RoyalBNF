
package com.royalbnf.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

public record FoodOrderRequest(

        @NotNull(message = "Booking ID is required")
        Long bookingId,

        @NotEmpty(message = "At least one food item is required")
        List<@Valid FoodOrderItemRequest> items,

        @NotNull(message = "Serving date is required")
        LocalDate servingDate,

        @Size(max = 500, message = "Special instructions cannot exceed 500 characters")
        String specialInstructions

) {

    public record FoodOrderItemRequest(

            @NotNull(message = "Hotel food menu ID is required")
            Long hotelFoodMenuId,

            @NotNull(message = "Quantity is required")
            @Min(value = 1, message = "Quantity must be at least 1")
            Integer quantity

    ) {}
}
