
package com.royalbnf.backend.service;

import com.royalbnf.backend.dto.BookingRequest;
import com.royalbnf.backend.dto.BookingResponse;

import com.royalbnf.backend.entity.Booking;
import com.royalbnf.backend.entity.BookingStatus;
import com.royalbnf.backend.entity.Customer;
import com.royalbnf.backend.entity.Room;

import com.royalbnf.backend.repository.BookingRepository;
import com.royalbnf.backend.repository.CustomerRepository;
import com.royalbnf.backend.repository.RoomRepository;

import com.royalbnf.backend.exception.ResourceNotFoundException;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final CustomerRepository customerRepository;

    public BookingService(
            BookingRepository bookingRepository,
            RoomRepository roomRepository,
            CustomerRepository customerRepository) {

        this.bookingRepository = bookingRepository;
        this.roomRepository = roomRepository;
        this.customerRepository = customerRepository;
    }

    // Get authenticated customer from JWT
    private Customer getAuthenticatedCustomer(
            Authentication authentication) {

        if (!(authentication instanceof JwtAuthenticationToken jwtAuth)) {
            throw new IllegalArgumentException("Invalid authentication");
        }

        Number customerId = jwtAuth.getToken().getClaim("customerId");

        if (customerId == null) {
            throw new IllegalArgumentException(
                    "Customer ID missing from token");
        }

        return customerRepository.findById(customerId.longValue())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Customer not found"));
    }

    // Find a booking and verify its ownership
    private Booking getCustomerBooking(Long bookingId, Customer customer) {

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Booking not found"));

        if (booking.getCustomer() == null ||
                !booking.getCustomer().getId().equals(customer.getId())) {

            throw new ResourceNotFoundException("Booking not found");
        }

        return booking;
    }

    // Convert Booking entity into BookingResponse DTO
    private BookingResponse mapToResponse(Booking booking) {

        return new BookingResponse(
                booking.getId(),
                booking.getGuestName(),
                booking.getGuestEmail(),
                booking.getGuestPhone(),
                booking.getCheckIn(),
                booking.getCheckOut(),
                booking.getNumberOfGuests(),
                booking.getRoom().getRoomNumber(),
                booking.getRoom().getRoomType(),
                booking.getRoom().getHotel().getName(),
                booking.getRoom().getHotel().getLocation(),
                booking.getTotalPrice(),
                booking.getStatus(),
                booking.getCreatedAt()
        );
    }

    // Get bookings belonging to the authenticated customer
    @Transactional(readOnly = true)
    public List<BookingResponse> getMyBookings(
            Authentication authentication) {

        Customer customer = getAuthenticatedCustomer(authentication);

        return bookingRepository
                .findByCustomer_IdOrderByCreatedAtDesc(customer.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // Get a specific booking belonging to the authenticated customer
    @Transactional(readOnly = true)
    public BookingResponse getBookingById(
            Long id,
            Authentication authentication) {

        Customer customer = getAuthenticatedCustomer(authentication);

        Booking booking = getCustomerBooking(id, customer);

        return mapToResponse(booking);
    }

    // Create booking for the authenticated customer
    @Transactional
    public BookingResponse createBooking(
            BookingRequest request,
            Authentication authentication) {

        Customer customer = getAuthenticatedCustomer(authentication);

        LocalDate checkIn = request.checkIn();
        LocalDate checkOut = request.checkOut();

        if (!checkOut.isAfter(checkIn)) {
            throw new IllegalArgumentException(
                    "Check-out must be after check-in");
        }

        Long roomId = request.roomId();

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Room not found with ID: " + roomId));

        if (!room.isActive()) {
            throw new IllegalArgumentException("Room is not active");
        }

        if (request.numberOfGuests() > room.getCapacity()) {
            throw new IllegalArgumentException(
                    "Number of guests exceeds room capacity. Maximum allowed: "
                            + room.getCapacity());
        }

        if (bookingRepository.existsOverlappingBooking(
                roomId,
                checkIn,
                checkOut,
                BookingStatus.CANCELLED)) {

            throw new IllegalArgumentException(
                    "Room is already booked for these dates");
        }

        long nights = ChronoUnit.DAYS.between(checkIn, checkOut);

        BigDecimal totalPrice = room.getPricePerNight()
                .multiply(BigDecimal.valueOf(nights));

        Booking booking = new Booking();

        booking.setGuestName(customer.getFullName());
        booking.setGuestEmail(customer.getEmail());
        booking.setGuestPhone(customer.getPhone());
        booking.setNumberOfGuests(request.numberOfGuests());

        booking.setCheckIn(checkIn);
        booking.setCheckOut(checkOut);

        booking.setRoom(room);
        booking.setCustomer(customer);
        booking.setTotalPrice(totalPrice);
        booking.setStatus(BookingStatus.CONFIRMED);

        Booking savedBooking = bookingRepository.save(booking);

        return mapToResponse(savedBooking);
    }

    // Cancel only the authenticated customer's booking
    @Transactional
    public BookingResponse cancelBooking(
            Long id,
            Authentication authentication) {

        Customer customer = getAuthenticatedCustomer(authentication);

        Booking booking = getCustomerBooking(id, customer);

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new IllegalArgumentException(
                    "Booking is already cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);

        Booking cancelledBooking = bookingRepository.save(booking);

        return mapToResponse(cancelledBooking);
    }
}
