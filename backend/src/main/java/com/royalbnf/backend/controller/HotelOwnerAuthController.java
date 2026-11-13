
package com.royalbnf.backend.controller;

import com.royalbnf.backend.dto.HotelOwnerAuthResponse;
import com.royalbnf.backend.dto.HotelOwnerLoginRequest;
import com.royalbnf.backend.service.HotelOwnerAuthService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/hotel-owner/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class HotelOwnerAuthController {

    private final HotelOwnerAuthService hotelOwnerAuthService;

    public HotelOwnerAuthController(
            HotelOwnerAuthService hotelOwnerAuthService) {
        this.hotelOwnerAuthService = hotelOwnerAuthService;
    }

    @PostMapping("/login")
    public ResponseEntity<HotelOwnerAuthResponse> login(
            @Valid @RequestBody HotelOwnerLoginRequest request) {

        HotelOwnerAuthResponse response =
                hotelOwnerAuthService.loginOwner(request);

        return ResponseEntity.ok(response);
    }
}
