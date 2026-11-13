
package com.royalbnf.backend.service;

import com.royalbnf.backend.dto.FoodOrderRequest;
import com.royalbnf.backend.dto.FoodOrderResponse;
import com.royalbnf.backend.entity.*;
import com.royalbnf.backend.exception.ResourceNotFoundException;
import com.royalbnf.backend.repository.BookingRepository;
import com.royalbnf.backend.repository.FoodOrderRepository;
import com.royalbnf.backend.repository.HotelFoodMenuRepository;
import com.royalbnf.backend.repository.CustomerRepository;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import com.royalbnf.backend.dto.FoodOrderStatusRequest;

@Service
public class FoodOrderService {

    private final FoodOrderRepository foodOrderRepository;
    private final BookingRepository bookingRepository;
    private final HotelFoodMenuRepository hotelFoodMenuRepository;
    private final CustomerRepository customerRepository;

    public FoodOrderService(
            FoodOrderRepository foodOrderRepository,
            BookingRepository bookingRepository,
            HotelFoodMenuRepository hotelFoodMenuRepository,
            CustomerRepository customerRepository) {

        this.foodOrderRepository = foodOrderRepository;
        this.bookingRepository = bookingRepository;
        this.hotelFoodMenuRepository = hotelFoodMenuRepository;
        this.customerRepository = customerRepository;
    }

    @Transactional
    public FoodOrderResponse placeOrder(
            FoodOrderRequest request,
            Authentication authentication) {

        Customer customer = getAuthenticatedCustomer(authentication);

        Booking booking = bookingRepository.findById(request.bookingId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Booking not found"));

        if (booking.getCustomer() == null ||
                !booking.getCustomer().getId().equals(customer.getId())) {
            throw new ResourceNotFoundException("Booking not found");
        }

        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new IllegalArgumentException(
                    "Food orders are allowed only for confirmed bookings");
        }

        if (request.servingDate().isBefore(booking.getCheckIn()) ||
                !request.servingDate().isBefore(booking.getCheckOut())) {
            throw new IllegalArgumentException(
                    "Serving date must fall within your booking period");
        }

        HotelFoodMenu menu = hotelFoodMenuRepository
                .findById(request.hotelFoodMenuId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Hotel food menu item not found"));

        if (!menu.isAvailable() ||
                !menu.getFoodItem().isAvailable() ||
                !menu.getFoodItem().getCategory().isActive()) {
            throw new IllegalArgumentException(
                    "This food item is currently unavailable");
        }

        Long bookingHotelId = booking.getRoom().getHotel().getId();
        Long menuHotelId = menu.getHotel().getId();

        if (!bookingHotelId.equals(menuHotelId)) {
            throw new IllegalArgumentException(
                    "Food item does not belong to your booked hotel");
        }

        BigDecimal unitPrice = menu.getSellingPrice();

        BigDecimal totalPrice = unitPrice.multiply(
                BigDecimal.valueOf(request.quantity())
        );

        FoodOrder order = new FoodOrder();
        order.setBooking(booking);
        order.setHotelFoodMenu(menu);
        order.setQuantity(request.quantity());
        order.setServingDate(request.servingDate());
        order.setSpecialInstructions(request.specialInstructions());
        order.setUnitPrice(unitPrice);
        order.setTotalPrice(totalPrice);
        order.setStatus(FoodOrderStatus.PENDING);

        FoodOrder savedOrder = foodOrderRepository.save(order);

        return mapToResponse(savedOrder);
    }

    private Customer getAuthenticatedCustomer(
            Authentication authentication) {

        if (!(authentication instanceof JwtAuthenticationToken jwtAuth)) {
            throw new IllegalArgumentException("Invalid authentication");
        }

        Number customerId =
                jwtAuth.getToken().getClaim("customerId");

        if (customerId == null) {
            throw new IllegalArgumentException(
                    "Customer ID missing from token");
        }

        return customerRepository.findById(customerId.longValue())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Customer not found"));
    }

    private FoodOrderResponse mapToResponse(FoodOrder order) {

        Hotel hotel = order.getHotelFoodMenu().getHotel();
        FoodItem foodItem = order.getHotelFoodMenu().getFoodItem();

        return new FoodOrderResponse(
                order.getId(),
                order.getBooking().getId(),
                hotel.getId(),
                hotel.getName(),
                foodItem.getId(),
                foodItem.getName(),
                order.getQuantity(),
                order.getServingDate(),
                order.getSpecialInstructions(),
                order.getUnitPrice(),
                order.getTotalPrice(),
                order.getStatus(),
                order.getCreatedAt()
        );
    }

    @Transactional(readOnly = true)
    public java.util.List<FoodOrderResponse> getMyOrders(
            Authentication authentication) {

        Customer customer = getAuthenticatedCustomer(authentication);

        return foodOrderRepository
                .findByBooking_Customer_IdOrderByCreatedAtDesc(
                        customer.getId()
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    @Transactional(readOnly = true)
    public java.util.List<FoodOrderResponse> getHotelOrders(
            Authentication authentication) {

        if (!(authentication instanceof JwtAuthenticationToken jwtAuth)) {
            throw new IllegalArgumentException("Invalid authentication");
        }

        // Get hotel ID from the authenticated owner's JWT
        Number hotelId = jwtAuth.getToken().getClaim("hotelId");

        if (hotelId == null) {
            throw new IllegalArgumentException(
                    "Hotel ID missing from authentication token");
        }

        // Fetch only orders belonging to this hotel
        return foodOrderRepository
                .findByHotelIdOrderByCreatedAtDesc(hotelId.longValue())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    @Transactional
    public FoodOrderResponse updateOrderStatus(
            Long orderId,
            FoodOrderStatusRequest request,
            Authentication authentication) {

        if (!(authentication instanceof JwtAuthenticationToken jwtAuth)) {
            throw new IllegalArgumentException("Invalid authentication");
        }

        // Get the authenticated owner's hotel ID
        Number hotelIdClaim = jwtAuth.getToken().getClaim("hotelId");

        if (hotelIdClaim == null) {
            throw new IllegalArgumentException(
                    "Hotel ID missing from authentication token");
        }

        Long hotelId = hotelIdClaim.longValue();

        // Find the requested food order
        FoodOrder order = foodOrderRepository.findById(orderId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Food order not found"));

        // Verify that the order belongs to this owner's hotel
        Long orderHotelId = order.getHotelFoodMenu()
                .getHotel()
                .getId();

        if (!hotelId.equals(orderHotelId)) {
            throw new ResourceNotFoundException("Food order not found");
        }

        FoodOrderStatus currentStatus = order.getStatus();
        FoodOrderStatus newStatus = request.status();

        // Validate allowed status transitions
        boolean validTransition =
                (currentStatus == FoodOrderStatus.PENDING &&
                        (newStatus == FoodOrderStatus.ACCEPTED ||
                        newStatus == FoodOrderStatus.REJECTED))
                ||
                (currentStatus == FoodOrderStatus.ACCEPTED &&
                        newStatus == FoodOrderStatus.SERVED);

        if (!validTransition) {
            throw new IllegalArgumentException(
                    "Invalid order status transition: " +
                    currentStatus + " to " + newStatus);
        }

        order.setStatus(newStatus);

        FoodOrder updatedOrder = foodOrderRepository.save(order);

        return mapToResponse(updatedOrder);
    }


}
