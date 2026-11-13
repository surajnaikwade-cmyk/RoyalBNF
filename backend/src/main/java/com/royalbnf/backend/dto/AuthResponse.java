
package com.royalbnf.backend.dto;

public record AuthResponse(
        String message,
        String token,
        Long customerId,
        String fullName,
        String email
) {}
