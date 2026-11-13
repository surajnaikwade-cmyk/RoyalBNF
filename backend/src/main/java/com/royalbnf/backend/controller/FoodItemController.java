
package com.royalbnf.backend.controller;

import com.royalbnf.backend.dto.FoodItemRequest;
import com.royalbnf.backend.dto.FoodItemResponse;
import com.royalbnf.backend.service.FoodItemService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/food-items")
public class FoodItemController {

    private final FoodItemService foodItemService;

    public FoodItemController(FoodItemService foodItemService) {
        this.foodItemService = foodItemService;
    }

    @PostMapping
    public ResponseEntity<FoodItemResponse> createFoodItem(
            @Valid @RequestBody FoodItemRequest request) {

        FoodItemResponse foodItem =
                foodItemService.createFoodItem(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(foodItem);
    }
}
