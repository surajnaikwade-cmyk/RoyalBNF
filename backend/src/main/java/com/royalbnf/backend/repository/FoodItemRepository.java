package com.royalbnf.backend.repository;

import com.royalbnf.backend.entity.FoodItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FoodItemRepository extends JpaRepository<FoodItem, Long> {

    List<FoodItem> findByAvailableTrueOrderByNameAsc();

    List<FoodItem> findByCategory_IdAndAvailableTrueOrderByNameAsc(Long categoryId);
}