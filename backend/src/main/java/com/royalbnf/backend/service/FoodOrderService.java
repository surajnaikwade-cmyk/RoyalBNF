
package com.royalbnf.backend.service;

import com.royalbnf.backend.dto.FoodOrderRequest;
import com.royalbnf.backend.dto.FoodOrderResponse;
import com.royalbnf.backend.dto.FoodOrderStatusRequest;
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
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

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

        // Find and validate the booking
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

        // Validate serving date
        if (request.servingDate().isBefore(booking.getCheckIn()) ||
                !request.servingDate().isBefore(booking.getCheckOut())) {
            throw new IllegalArgumentException(
                    "Serving date must fall within your booking period");
        }

        Hotel bookingHotel = booking.getRoom().getHotel();
        Long bookingHotelId = bookingHotel.getId();

        // Validate cart
        if (request.items() == null || request.items().isEmpty()) {
            throw new IllegalArgumentException(
                    "At least one food item is required");
        }

        Set<Long> processedMenuIds = new HashSet<>();

        FoodOrder order = new FoodOrder();
        order.setBooking(booking);
        order.setHotel(bookingHotel);
        order.setServingDate(request.servingDate());
        order.setSpecialInstructions(request.specialInstructions());
        order.setStatus(FoodOrderStatus.PENDING);

        BigDecimal grandTotal = BigDecimal.ZERO;

        // Validate and add every food item
        for (FoodOrderRequest.FoodOrderItemRequest itemRequest
                : request.items()) {

            if (itemRequest.hotelFoodMenuId() == null ||
                    itemRequest.quantity() == null ||
                    itemRequest.quantity() < 1) {
                throw new IllegalArgumentException(
                        "Each food item must have a valid menu ID and quantity");
            }

            Long menuId = itemRequest.hotelFoodMenuId();

            // Prevent duplicate menu entries in one order
            if (!processedMenuIds.add(menuId)) {
                throw new IllegalArgumentException(
                        "Duplicate food items are not allowed. " +
                        "Please combine their quantities.");
            }

            HotelFoodMenu menu = hotelFoodMenuRepository
                    .findById(menuId)
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Hotel food menu item not found: " + menuId));

            // Check menu and food availability
            if (!menu.isAvailable() ||
                    !menu.getFoodItem().isAvailable() ||
                    !menu.getFoodItem().getCategory().isActive()) {
                throw new IllegalArgumentException(
                        "Food item is currently unavailable: " +
                        menu.getFoodItem().getName());
            }

            // Ensure every item belongs to the booked hotel
            Long menuHotelId = menu.getHotel().getId();

            if (!bookingHotelId.equals(menuHotelId)) {
                throw new IllegalArgumentException(
                        "Food item does not belong to your booked hotel: " +
                        menu.getFoodItem().getName());
            }

            // Always calculate prices using the database price
            BigDecimal unitPrice = menu.getSellingPrice();

            BigDecimal itemTotal = unitPrice.multiply(
                    BigDecimal.valueOf(itemRequest.quantity())
            );

            FoodOrderItem orderItem = new FoodOrderItem();
            orderItem.setHotelFoodMenu(menu);
            orderItem.setQuantity(itemRequest.quantity());
            orderItem.setUnitPrice(unitPrice);
            orderItem.setTotalPrice(itemTotal);

            order.addItem(orderItem);

            grandTotal = grandTotal.add(itemTotal);
        }

        // Set the combined order total
        order.setTotalPrice(grandTotal);

        // Parent and child records are saved together through cascade
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

        // The booking determines the hotel's identity.
        Hotel hotel = order.getBooking().getRoom().getHotel();

        List<FoodOrderResponse.FoodOrderItemResponse> itemResponses =
                new ArrayList<>();

        // Map new multi-item orders
        if (order.getItems() != null && !order.getItems().isEmpty()) {

            for (FoodOrderItem item : order.getItems()) {

                HotelFoodMenu menu = item.getHotelFoodMenu();
                FoodItem foodItem = menu.getFoodItem();

                itemResponses.add(
                        new FoodOrderResponse.FoodOrderItemResponse(
                                item.getId(),
                                menu.getId(),
                                foodItem.getId(),
                                foodItem.getName(),
                                item.getQuantity(),
                                item.getUnitPrice(),
                                item.getTotalPrice()
                        )
                );
            }

        } else if (order.getHotelFoodMenu() != null) {

            // Backward compatibility for historical single-item orders
            HotelFoodMenu menu = order.getHotelFoodMenu();
            FoodItem foodItem = menu.getFoodItem();

            itemResponses.add(
                    new FoodOrderResponse.FoodOrderItemResponse(
                            null,
                            menu.getId(),
                            foodItem.getId(),
                            foodItem.getName(),
                            order.getQuantity(),
                            order.getUnitPrice(),
                            order.getTotalPrice()
                    )
            );
        }

        return new FoodOrderResponse(
                order.getId(),
                order.getBooking().getId(),
                hotel.getId(),
                hotel.getName(),
                itemResponses,
                order.getServingDate(),
                order.getSpecialInstructions(),
                order.getTotalPrice(),
                order.getStatus(),
                order.getCreatedAt()
        );
    }

    @Transactional(readOnly = true)
    public List<FoodOrderResponse> getMyOrders(
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
    public List<FoodOrderResponse> getHotelOrders(
            Authentication authentication) {

        if (!(authentication instanceof JwtAuthenticationToken jwtAuth)) {
            throw new IllegalArgumentException("Invalid authentication");
        }

        Number hotelId = jwtAuth.getToken().getClaim("hotelId");

        if (hotelId == null) {
            throw new IllegalArgumentException(
                    "Hotel ID missing from authentication token");
        }

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

        Number hotelIdClaim = jwtAuth.getToken().getClaim("hotelId");

        if (hotelIdClaim == null) {
            throw new IllegalArgumentException(
                    "Hotel ID missing from authentication token");
        }

        Long hotelId = hotelIdClaim.longValue();

        FoodOrder order = foodOrderRepository.findById(orderId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Food order not found"));

        // Verify ownership using the booking's hotel
        Long orderHotelId = order.getBooking()
                .getRoom()
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
