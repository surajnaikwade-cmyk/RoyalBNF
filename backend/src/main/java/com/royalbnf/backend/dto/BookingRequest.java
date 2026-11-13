
package com.royalbnf.backend.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDate;

public record BookingRequest(

        @NotNull(message = "Check-in date is required")
        @FutureOrPresent(message = "Check-in cannot be in the past")
        LocalDate checkIn,

        @NotNull(message = "Check-out date is required")
        @FutureOrPresent(message = "Check-out cannot be in the past")
        LocalDate checkOut,

        @NotNull(message = "Room ID is required")
        @Positive(message = "Room ID must be positive")
        Long roomId,

        @NotNull(message = "Number of guests is required")
        @Positive(message = "Number of guests must be positive")
        Integer numberOfGuests
) {
}
