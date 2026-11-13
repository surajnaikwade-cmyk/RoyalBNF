
package com.royalbnf.backend.controller;

import com.royalbnf.backend.dto.AuthResponse;
import com.royalbnf.backend.dto.LoginRequest;
import com.royalbnf.backend.dto.RegisterRequest;
import com.royalbnf.backend.service.AuthService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // Customer Registration
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(
            @Valid @RequestBody RegisterRequest request) {

        return authService.registerCustomer(request);
    }

    // Customer Login
    @PostMapping("/login")
    public AuthResponse login(
            @Valid @RequestBody LoginRequest request) {

        return authService.loginCustomer(request);
    }
}
