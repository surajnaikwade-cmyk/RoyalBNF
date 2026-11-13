
package com.royalbnf.backend.service;

import com.royalbnf.backend.dto.FoodCategoryRequest;
import com.royalbnf.backend.dto.FoodCategoryResponse;
import com.royalbnf.backend.entity.FoodCategory;
import com.royalbnf.backend.repository.FoodCategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FoodCategoryService {

    private final FoodCategoryRepository foodCategoryRepository;

    public FoodCategoryService(
            FoodCategoryRepository foodCategoryRepository) {
        this.foodCategoryRepository = foodCategoryRepository;
    }

    public FoodCategoryResponse createCategory(
            FoodCategoryRequest request) {

        String categoryName = request.name().trim();

        if (foodCategoryRepository.existsByName(categoryName)) {
            throw new IllegalArgumentException(
                    "Food category already exists"
            );
        }

        FoodCategory category = new FoodCategory();

        category.setName(categoryName);
        category.setDescription(
                request.description() == null
                        ? null
                        : request.description().trim()
        );

        FoodCategory savedCategory =
                foodCategoryRepository.save(category);

        return new FoodCategoryResponse(
                savedCategory.getId(),
                savedCategory.getName(),
                savedCategory.getDescription(),
                savedCategory.isActive()
        );
    }

    // Get all active food categories
    public List<FoodCategoryResponse> getAllCategories() {

        return foodCategoryRepository.findAll()
                .stream()
                .filter(FoodCategory::isActive)
                .map(category -> new FoodCategoryResponse(
                        category.getId(),
                        category.getName(),
                        category.getDescription(),
                        category.isActive()
                ))
                .toList();
    }
}
