package com.royalbnf.backend.repository;

import com.royalbnf.backend.entity.HotelFoodMenu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HotelFoodMenuRepository
        extends JpaRepository<HotelFoodMenu, Long> {

    @Query("""
        SELECT hfm
        FROM HotelFoodMenu hfm
        JOIN FETCH hfm.foodItem fi
        JOIN FETCH fi.category
        WHERE hfm.hotel.id = :hotelId
        AND hfm.available = true
        AND fi.available = true
        AND fi.category.active = true
        ORDER BY fi.name ASC
    """)
    List<HotelFoodMenu> findAvailableMenuByHotelId(
            @Param("hotelId") Long hotelId
    );
    boolean existsByHotel_IdAndFoodItem_Id(
            Long hotelId,
            Long foodItemId
    );
}