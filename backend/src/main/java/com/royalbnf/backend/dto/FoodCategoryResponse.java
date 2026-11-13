package com.royalbnf.backend.dto;

public record FoodCategoryResponse(
        Long id,
        String name,
        String description,
        boolean active
) {}