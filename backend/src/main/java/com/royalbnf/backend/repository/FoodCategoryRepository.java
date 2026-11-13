package com.royalbnf.backend.repository;

import com.royalbnf.backend.entity.FoodCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FoodCategoryRepository
        extends JpaRepository<FoodCategory, Long> {

    boolean existsByName(String name);
}