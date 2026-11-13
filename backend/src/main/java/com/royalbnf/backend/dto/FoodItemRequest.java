
package com.royalbnf.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record FoodItemRequest(

        @NotBlank(message = "Food name is required")
        @Size(max = 150, message = "Food name cannot exceed 150 characters")
        String name,

        @Size(max = 1000, message = "Description cannot exceed 1000 characters")
        String description,

        @NotNull(message = "Food price is required")
        @DecimalMin(value = "0.01", message = "Price must be greater than zero")
        BigDecimal price,

        @Size(max = 500, message = "Image URL cannot exceed 500 characters")
        String imageUrl,

        boolean vegetarian,

        @NotNull(message = "Category ID is required")
        Long categoryId

) {
}
