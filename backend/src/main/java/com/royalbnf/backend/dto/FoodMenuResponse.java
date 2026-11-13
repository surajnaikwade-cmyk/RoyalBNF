package com.royalbnf.backend.dto;

import java.math.BigDecimal;

public record FoodMenuResponse(
        Long menuId,
        Long foodItemId,
        String name,
        String description,
        BigDecimal sellingPrice,
        String imageUrl,
        boolean vegetarian,
        String categoryName
) {
}