package com.royalbnf.backend.dto;

import java.math.BigDecimal;

public record FoodItemResponse(
        Long id,
        String name,
        String description,
        BigDecimal price,
        String imageUrl,
        boolean vegetarian,
        boolean available,
        Long categoryId,
        String categoryName
) {
}