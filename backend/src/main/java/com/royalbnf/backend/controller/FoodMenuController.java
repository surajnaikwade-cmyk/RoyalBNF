
package com.royalbnf.backend.controller;

import com.royalbnf.backend.dto.FoodMenuResponse;
import com.royalbnf.backend.service.FoodMenuService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hotels")
@CrossOrigin(origins = "http://localhost:5173")
public class FoodMenuController {

    private final FoodMenuService foodMenuService;

    public FoodMenuController(FoodMenuService foodMenuService) {
        this.foodMenuService = foodMenuService;
    }

    @GetMapping("/{hotelId}/food-menu")
    public ResponseEntity<List<FoodMenuResponse>> getHotelFoodMenu(
            @PathVariable Long hotelId) {

        List<FoodMenuResponse> menu =
                foodMenuService.getHotelFoodMenu(hotelId);

        return ResponseEntity.ok(menu);
    }
}
