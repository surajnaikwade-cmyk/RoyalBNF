
package com.royalbnf.backend.dto;

import com.royalbnf.backend.entity.BookingStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record BookingResponse(

        Long id,

        String guestName,

        String guestEmail,

        String guestPhone,

        LocalDate checkIn,

        LocalDate checkOut,

        Integer numberOfGuests,

        String roomNumber,

        String roomType,

        String hotelName,

        String hotelLocation,

        BigDecimal totalPrice,

        BookingStatus status,

        LocalDateTime createdAt

) {
}
