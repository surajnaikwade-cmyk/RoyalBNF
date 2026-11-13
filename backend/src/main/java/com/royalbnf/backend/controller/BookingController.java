
package com.royalbnf.backend.controller;

import com.royalbnf.backend.dto.BookingRequest;
import com.royalbnf.backend.dto.BookingResponse;
import com.royalbnf.backend.service.BookingService;

import jakarta.validation.Valid;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:5173")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    // Get bookings belonging to the logged-in customer
    @GetMapping
    public List<BookingResponse> getMyBookings(
            Authentication authentication) {

        return bookingService.getMyBookings(authentication);
    }

    // Explicit customer booking history endpoint
    @GetMapping("/my-bookings")
    public List<BookingResponse> getCustomerBookings(
            Authentication authentication) {

        return bookingService.getMyBookings(authentication);
    }

    // Get a specific booking belonging to the logged-in customer
    @GetMapping("/{id}")
    public BookingResponse getBookingById(
            @PathVariable Long id,
            Authentication authentication) {

        return bookingService.getBookingById(id, authentication);
    }

    // Create booking for authenticated customer
    @PostMapping
    public BookingResponse createBooking(
            @Valid @RequestBody BookingRequest request,
            Authentication authentication) {

        return bookingService.createBooking(request, authentication);
    }

    // Cancel only the customer's own booking
    @PutMapping("/{id}/cancel")
    public BookingResponse cancelBooking(
            @PathVariable Long id,
            Authentication authentication) {

        return bookingService.cancelBooking(id, authentication);
    }
}
