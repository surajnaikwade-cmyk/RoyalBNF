
package com.royalbnf.backend.service;

import com.royalbnf.backend.dto.FoodItemRequest;
import com.royalbnf.backend.dto.FoodItemResponse;
import com.royalbnf.backend.entity.FoodCategory;
import com.royalbnf.backend.entity.FoodItem;
import com.royalbnf.backend.repository.FoodCategoryRepository;
import com.royalbnf.backend.repository.FoodItemRepository;
import org.springframework.stereotype.Service;

@Service
public class FoodItemService {

    private final FoodItemRepository foodItemRepository;
    private final FoodCategoryRepository foodCategoryRepository;

    public FoodItemService(
            FoodItemRepository foodItemRepository,
            FoodCategoryRepository foodCategoryRepository) {
        this.foodItemRepository = foodItemRepository;
        this.foodCategoryRepository = foodCategoryRepository;
    }

    public FoodItemResponse createFoodItem(FoodItemRequest request) {

        FoodCategory category = foodCategoryRepository
                .findById(request.categoryId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Food category not found"
                        )
                );

        if (!category.isActive()) {
            throw new IllegalArgumentException(
                    "Cannot add food item to an inactive category"
            );
        }

        FoodItem foodItem = new FoodItem();

        foodItem.setName(request.name().trim());
        foodItem.setDescription(
                request.description() == null
                        ? null
                        : request.description().trim()
        );
        foodItem.setPrice(request.price());
        foodItem.setImageUrl(request.imageUrl());
        foodItem.setVegetarian(request.vegetarian());
        foodItem.setCategory(category);

        FoodItem savedItem = foodItemRepository.save(foodItem);

        return new FoodItemResponse(
                savedItem.getId(),
                savedItem.getName(),
                savedItem.getDescription(),
                savedItem.getPrice(),
                savedItem.getImageUrl(),
                savedItem.isVegetarian(),
                savedItem.isAvailable(),
                category.getId(),
                category.getName()
        );
    }
}
