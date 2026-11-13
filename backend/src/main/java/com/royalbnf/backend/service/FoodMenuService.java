package com.royalbnf.backend.service;

import com.royalbnf.backend.dto.FoodMenuResponse;
import com.royalbnf.backend.entity.HotelFoodMenu;
import com.royalbnf.backend.repository.HotelFoodMenuRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FoodMenuService {

    private final HotelFoodMenuRepository hotelFoodMenuRepository;

    public FoodMenuService(
            HotelFoodMenuRepository hotelFoodMenuRepository) {
        this.hotelFoodMenuRepository = hotelFoodMenuRepository;
    }

    public List<FoodMenuResponse> getHotelFoodMenu(Long hotelId) {

        List<HotelFoodMenu> menuItems =
                hotelFoodMenuRepository.findAvailableMenuByHotelId(hotelId);

        return menuItems.stream()
                .map(menu -> new FoodMenuResponse(
                        menu.getId(),
                        menu.getFoodItem().getId(),
                        menu.getFoodItem().getName(),
                        menu.getFoodItem().getDescription(),
                        menu.getSellingPrice(),
                        menu.getFoodItem().getImageUrl(),
                        menu.getFoodItem().isVegetarian(),
                        menu.getFoodItem().getCategory().getName()
                ))
                .toList();
    }
}