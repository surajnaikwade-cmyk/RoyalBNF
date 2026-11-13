
package com.royalbnf.backend.controller;

import com.royalbnf.backend.dto.FoodOrderRequest;
import com.royalbnf.backend.dto.FoodOrderResponse;
import com.royalbnf.backend.service.FoodOrderService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/food-orders")
@CrossOrigin(origins = "http://localhost:5173")
public class FoodOrderController {

    private final FoodOrderService foodOrderService;

    public FoodOrderController(FoodOrderService foodOrderService) {
        this.foodOrderService = foodOrderService;
    }

    @PostMapping
    public ResponseEntity<FoodOrderResponse> placeOrder(
            @Valid @RequestBody FoodOrderRequest request,
            Authentication authentication) {

        FoodOrderResponse response =
                foodOrderService.placeOrder(request, authentication);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping("/my-orders")
    public ResponseEntity<List<FoodOrderResponse>> getMyOrders(
            Authentication authentication) {

        return ResponseEntity.ok(
                foodOrderService.getMyOrders(authentication)
        );
    }
}
