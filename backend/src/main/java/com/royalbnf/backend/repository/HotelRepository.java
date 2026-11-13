package com.royalbnf.backend.repository;

import com.royalbnf.backend.entity.Hotel;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HotelRepository extends JpaRepository<Hotel, Long> {

    @Override
    @EntityGraph(attributePaths = "amenities")
    List<Hotel> findAll();

    @Override
    @EntityGraph(attributePaths = "amenities")
    Optional<Hotel> findById(Long id);
}