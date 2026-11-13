
package com.royalbnf.backend.service;

import com.royalbnf.backend.dto.AuthResponse;
import com.royalbnf.backend.dto.LoginRequest;
import com.royalbnf.backend.dto.RegisterRequest;
import com.royalbnf.backend.entity.Customer;
import com.royalbnf.backend.repository.CustomerRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
public class AuthService {

    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            CustomerRepository customerRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {

        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    // Customer Registration
    @Transactional
    public AuthResponse registerCustomer(RegisterRequest request) {

        String email = request.email()
                .trim()
                .toLowerCase(Locale.ROOT);

        // Check whether email is already registered
        if (customerRepository.existsByEmail(email)) {
            throw new IllegalArgumentException(
                    "Email is already registered");
        }

        // Create new customer
        Customer customer = new Customer();

        customer.setFullName(request.fullName().trim());
        customer.setEmail(email);

        // Store encrypted password using BCrypt
        customer.setPassword(
                passwordEncoder.encode(request.password()));

        customer.setPhone(request.phone());

        // Save customer in database
        Customer savedCustomer = customerRepository.save(customer);

        // Generate JWT token
        String token = jwtService.generateToken(
                savedCustomer.getId(),
                savedCustomer.getEmail()
        );

        return new AuthResponse(
                "Registration successful",
                token,
                savedCustomer.getId(),
                savedCustomer.getFullName(),
                savedCustomer.getEmail()
        );
    }

    // Customer Login
    public AuthResponse loginCustomer(LoginRequest request) {

        String email = request.email()
                .trim()
                .toLowerCase(Locale.ROOT);

        // Find customer using email
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Invalid email or password"));

        // Verify entered password against BCrypt hash
        if (!passwordEncoder.matches(
                request.password(),
                customer.getPassword())) {

            throw new IllegalArgumentException(
                    "Invalid email or password");
        }

        // Generate JWT token
        String token = jwtService.generateToken(
                customer.getId(),
                customer.getEmail()
        );

        return new AuthResponse(
                "Login successful",
                token,
                customer.getId(),
                customer.getFullName(),
                customer.getEmail()
        );
    }
}
