
package com.royalbnf.backend.service;

import com.royalbnf.backend.dto.HotelFoodMenuRequest;
import com.royalbnf.backend.dto.HotelFoodMenuResponse;
import com.royalbnf.backend.entity.FoodItem;
import com.royalbnf.backend.entity.Hotel;
import com.royalbnf.backend.entity.HotelFoodMenu;
import com.royalbnf.backend.repository.FoodItemRepository;
import com.royalbnf.backend.repository.HotelFoodMenuRepository;
import com.royalbnf.backend.repository.HotelRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class HotelFoodMenuService {

    private final HotelFoodMenuRepository hotelFoodMenuRepository;
    private final HotelRepository hotelRepository;
    private final FoodItemRepository foodItemRepository;

    public HotelFoodMenuService(
            HotelFoodMenuRepository hotelFoodMenuRepository,
            HotelRepository hotelRepository,
            FoodItemRepository foodItemRepository) {

        this.hotelFoodMenuRepository = hotelFoodMenuRepository;
        this.hotelRepository = hotelRepository;
        this.foodItemRepository = foodItemRepository;
    }

    @Transactional
    public HotelFoodMenuResponse assignFoodItem(
            HotelFoodMenuRequest request) {

        Hotel hotel = hotelRepository.findById(request.hotelId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Hotel not found"));

        FoodItem foodItem = foodItemRepository.findById(request.foodItemId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Food item not found"));

        if (!foodItem.isAvailable()) {
            throw new IllegalArgumentException(
                    "Cannot assign an unavailable food item");
        }

        if (!foodItem.getCategory().isActive()) {
            throw new IllegalArgumentException(
                    "Cannot assign food from an inactive category");
        }

        boolean alreadyAssigned =
                hotelFoodMenuRepository.existsByHotel_IdAndFoodItem_Id(
                        request.hotelId(),
                        request.foodItemId()
                );

        if (alreadyAssigned) {
            throw new IllegalArgumentException(
                    "Food item is already assigned to this hotel");
        }

        HotelFoodMenu menu = new HotelFoodMenu();
        menu.setHotel(hotel);
        menu.setFoodItem(foodItem);
        menu.setSellingPrice(request.sellingPrice());

        HotelFoodMenu savedMenu =
                hotelFoodMenuRepository.save(menu);

        return new HotelFoodMenuResponse(
                savedMenu.getId(),
                hotel.getId(),
                hotel.getName(),
                foodItem.getId(),
                foodItem.getName(),
                savedMenu.getSellingPrice(),
                savedMenu.isAvailable()
        );
    }
}
