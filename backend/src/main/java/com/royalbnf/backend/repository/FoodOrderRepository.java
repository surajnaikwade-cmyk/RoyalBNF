
package com.royalbnf.backend.repository;

import com.royalbnf.backend.entity.FoodOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.royalbnf.backend.entity.FoodOrderStatus;

import java.util.List;

@Repository
public interface FoodOrderRepository
        extends JpaRepository<FoodOrder, Long> {

    // Existing customer queries
    List<FoodOrder> findByBooking_Customer_IdOrderByCreatedAtDesc(
            Long customerId
    );

    List<FoodOrder> findByBooking_IdOrderByCreatedAtDesc(
            Long bookingId
    );


    // Dashboard: total orders for a hotel
    long countByHotelFoodMenu_Hotel_Id(Long hotelId);

    // Dashboard: count orders by status
    long countByHotelFoodMenu_Hotel_IdAndStatus(
            Long hotelId,
            FoodOrderStatus status
    );

    // Dashboard: revenue from successfully served orders
    @Query("""
            SELECT COALESCE(SUM(fo.totalPrice), 0)
            FROM FoodOrder fo
            WHERE fo.hotelFoodMenu.hotel.id = :hotelId
            AND fo.status = :status
            """)
    java.math.BigDecimal calculateRevenueByHotelAndStatus(
            @Param("hotelId") Long hotelId,
            @Param("status") FoodOrderStatus status
    );


    // Find all food orders belonging to a particular hotel
    @Query("""
            SELECT fo
            FROM FoodOrder fo
            JOIN FETCH fo.booking b
            JOIN FETCH fo.hotelFoodMenu hfm
            JOIN FETCH hfm.hotel h
            JOIN FETCH hfm.foodItem fi
            WHERE h.id = :hotelId
            ORDER BY fo.createdAt DESC
            """)
    List<FoodOrder> findByHotelIdOrderByCreatedAtDesc(
            @Param("hotelId") Long hotelId
    );
}
