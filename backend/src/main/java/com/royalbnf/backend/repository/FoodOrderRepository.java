
package com.royalbnf.backend.repository;

import com.royalbnf.backend.entity.FoodOrder;
import com.royalbnf.backend.entity.FoodOrderStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface FoodOrderRepository
        extends JpaRepository<FoodOrder, Long> {

    // Customer: retrieve their orders
    @Query("""
            SELECT DISTINCT fo
            FROM FoodOrder fo
            JOIN FETCH fo.booking b
            JOIN FETCH b.room r
            JOIN FETCH r.hotel
            LEFT JOIN FETCH fo.items items
            LEFT JOIN FETCH items.hotelFoodMenu
            WHERE b.customer.id = :customerId
            ORDER BY fo.createdAt DESC
            """)
    List<FoodOrder> findByBooking_Customer_IdOrderByCreatedAtDesc(
            @Param("customerId") Long customerId
    );

    // Retrieve orders associated with a booking
    List<FoodOrder> findByBooking_IdOrderByCreatedAtDesc(
            Long bookingId
    );

    // Dashboard: total orders for a hotel
    long countByHotel_Id(Long hotelId);

    // Dashboard: count orders by status
    long countByHotel_IdAndStatus(
            Long hotelId,
            FoodOrderStatus status
    );

    // Dashboard: revenue from successfully served orders
    @Query("""
            SELECT COALESCE(SUM(fo.totalPrice), 0)
            FROM FoodOrder fo
            WHERE fo.hotel.id = :hotelId
            AND fo.status = :status
            """)
    BigDecimal calculateRevenueByHotelAndStatus(
            @Param("hotelId") Long hotelId,
            @Param("status") FoodOrderStatus status
    );

    // Hotel owner: retrieve all orders with their items
    @Query("""
            SELECT DISTINCT fo
            FROM FoodOrder fo
            JOIN FETCH fo.booking b
            JOIN FETCH b.room r
            JOIN FETCH r.hotel
            LEFT JOIN FETCH fo.items items
            LEFT JOIN FETCH items.hotelFoodMenu menu
            LEFT JOIN FETCH menu.foodItem
            WHERE fo.hotel.id = :hotelId
            ORDER BY fo.createdAt DESC
            """)
    List<FoodOrder> findByHotelIdOrderByCreatedAtDesc(
            @Param("hotelId") Long hotelId
    );
}
