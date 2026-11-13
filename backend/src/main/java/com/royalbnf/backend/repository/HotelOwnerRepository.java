
package com.royalbnf.backend.repository;

import com.royalbnf.backend.entity.HotelOwner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HotelOwnerRepository
        extends JpaRepository<HotelOwner, Long> {

    Optional<HotelOwner> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByHotel_Id(Long hotelId);
}
