package com.royalbnf.backend.controller;

import com.royalbnf.backend.dto.HotelFoodMenuRequest;
import com.royalbnf.backend.dto.HotelFoodMenuResponse;
import com.royalbnf.backend.service.HotelFoodMenuService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/hotel-food-menus")
public class HotelFoodMenuController {

    private final HotelFoodMenuService hotelFoodMenuService;

    public HotelFoodMenuController(
            HotelFoodMenuService hotelFoodMenuService) {
        this.hotelFoodMenuService = hotelFoodMenuService;
    }

    @PostMapping
    public ResponseEntity<HotelFoodMenuResponse> assignFoodItem(
            @Valid @RequestBody HotelFoodMenuRequest request) {

        HotelFoodMenuResponse menu =
                hotelFoodMenuService.assignFoodItem(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(menu);
    }
}