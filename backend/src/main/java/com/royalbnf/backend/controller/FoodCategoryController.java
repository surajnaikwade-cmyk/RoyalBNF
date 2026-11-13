
package com.royalbnf.backend.controller;

import com.royalbnf.backend.dto.FoodCategoryRequest;
import com.royalbnf.backend.dto.FoodCategoryResponse;
import com.royalbnf.backend.service.FoodCategoryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/food-categories")
@CrossOrigin(origins = "http://localhost:5173")
public class FoodCategoryController {

    private final FoodCategoryService foodCategoryService;

    public FoodCategoryController(
            FoodCategoryService foodCategoryService) {
        this.foodCategoryService = foodCategoryService;
    }

    // Get all active food categories
    @GetMapping
    public ResponseEntity<List<FoodCategoryResponse>> getAllCategories() {

        List<FoodCategoryResponse> categories =
                foodCategoryService.getAllCategories();

        return ResponseEntity.ok(categories);
    }

    // Create a food category
    @PostMapping
    public ResponseEntity<FoodCategoryResponse> createCategory(
            @Valid @RequestBody FoodCategoryRequest request) {

        FoodCategoryResponse response =
                foodCategoryService.createCategory(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }
}
