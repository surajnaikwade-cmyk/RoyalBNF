
package com.royalbnf.backend.controller;

import com.royalbnf.backend.dto.FoodOrderResponse;
import com.royalbnf.backend.dto.FoodOrderStatusRequest;
import com.royalbnf.backend.service.FoodOrderService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hotel-owner/orders")
@CrossOrigin(origins = "http://localhost:5173")
public class HotelOwnerOrderController {

    private final FoodOrderService foodOrderService;

    public HotelOwnerOrderController(
            FoodOrderService foodOrderService) {
        this.foodOrderService = foodOrderService;
    }

    @GetMapping
    public ResponseEntity<List<FoodOrderResponse>> getHotelOrders(
            Authentication authentication) {

        List<FoodOrderResponse> orders =
                foodOrderService.getHotelOrders(authentication);

        return ResponseEntity.ok(orders);
    }

    @PatchMapping("/{orderId}/status")
    public ResponseEntity<FoodOrderResponse> updateOrderStatus(
            @PathVariable Long orderId,
            @Valid @RequestBody FoodOrderStatusRequest request,
            Authentication authentication) {

        FoodOrderResponse response =
                foodOrderService.updateOrderStatus(
                        orderId,
                        request,
                        authentication
                );

        return ResponseEntity.ok(response);
    }
}
