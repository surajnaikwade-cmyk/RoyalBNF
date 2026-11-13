package com.royalbnf.backend.repository;

import com.royalbnf.backend.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {

    @Override
    @EntityGraph(attributePaths = {"hotel", "hotel.amenities"})
    List<Room> findAll();

    @Override
    @EntityGraph(attributePaths = {"hotel", "hotel.amenities"})
    Optional<Room> findById(Long id);
}