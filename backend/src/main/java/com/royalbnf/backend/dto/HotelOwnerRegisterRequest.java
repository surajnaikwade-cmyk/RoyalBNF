
package com.royalbnf.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Positive;

public record HotelOwnerRegisterRequest(

        @NotBlank(message = "Full name is required")
        @Size(max = 100, message = "Name cannot exceed 100 characters")
        String fullName,

        @NotBlank(message = "Email is required")
        @Email(message = "Please provide a valid email")
        @Size(max = 150)
        String email,

        @NotBlank(message = "Password is required")
        @Size(min = 8, max = 100,
                message = "Password must contain 8 to 100 characters")
        String password,

        @NotBlank(message = "Phone number is required")
        @Pattern(
                regexp = "^[0-9]{10}$",
                message = "Phone number must contain exactly 10 digits"
        )
        String phone,

        @NotNull(message = "Hotel ID is required")
        @Positive(message = "Hotel ID must be positive")
        Long hotelId

) {}
