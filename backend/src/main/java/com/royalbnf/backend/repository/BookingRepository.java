
package com.royalbnf.backend.repository;

import com.royalbnf.backend.entity.Booking;
import com.royalbnf.backend.entity.BookingStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    // Check whether a room has an overlapping booking
    @Query("""
        SELECT COUNT(b) > 0
        FROM Booking b
        WHERE b.room.id = :roomId
        AND b.status <> :cancelledStatus
        AND b.checkIn < :checkOut
        AND b.checkOut > :checkIn
    """)
    boolean existsOverlappingBooking(
            @Param("roomId") Long roomId,
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut,
            @Param("cancelledStatus") BookingStatus cancelledStatus
    );

    // Retrieve all bookings belonging to a customer
    List<Booking> findByCustomer_IdOrderByCreatedAtDesc(Long customerId);
}
