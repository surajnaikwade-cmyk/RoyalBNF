
package com.royalbnf.backend.service;

import com.royalbnf.backend.dto.HotelOwnerAuthResponse;
import com.royalbnf.backend.dto.HotelOwnerLoginRequest;
import com.royalbnf.backend.dto.HotelOwnerRegisterRequest;
import com.royalbnf.backend.entity.Hotel;
import com.royalbnf.backend.entity.HotelOwner;
import com.royalbnf.backend.repository.HotelOwnerRepository;
import com.royalbnf.backend.repository.HotelRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class HotelOwnerAuthService {

    private final HotelOwnerRepository hotelOwnerRepository;
    private final HotelRepository hotelRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public HotelOwnerAuthService(
            HotelOwnerRepository hotelOwnerRepository,
            HotelRepository hotelRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {

        this.hotelOwnerRepository = hotelOwnerRepository;
        this.hotelRepository = hotelRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public HotelOwnerAuthResponse registerOwner(
            HotelOwnerRegisterRequest request) {

        String email = request.email().trim().toLowerCase();

        if (hotelOwnerRepository.existsByEmail(email)) {
            throw new IllegalArgumentException(
                    "Hotel owner email already registered");
        }

        Hotel hotel = hotelRepository.findById(request.hotelId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Hotel not found"));

        if (hotelOwnerRepository.existsByHotel_Id(hotel.getId())) {
            throw new IllegalArgumentException(
                    "This hotel already has an assigned owner");
        }

        HotelOwner owner = new HotelOwner();
        owner.setFullName(request.fullName().trim());
        owner.setEmail(email);
        owner.setPassword(passwordEncoder.encode(request.password()));
        owner.setPhone(request.phone());
        owner.setHotel(hotel);

        HotelOwner savedOwner =
                hotelOwnerRepository.save(owner);

        String token = jwtService.generateHotelOwnerToken(
                savedOwner.getId(),
                savedOwner.getEmail(),
                hotel.getId()
        );

        return buildAuthResponse(savedOwner, token);
    }

    @Transactional(readOnly = true)
    public HotelOwnerAuthResponse loginOwner(
            HotelOwnerLoginRequest request) {

        String email = request.email().trim().toLowerCase();

        HotelOwner owner = hotelOwnerRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Invalid email or password"));

        if (!owner.isActive()) {
            throw new IllegalArgumentException(
                    "Hotel owner account is inactive");
        }

        if (!passwordEncoder.matches(
                request.password(), owner.getPassword())) {
            throw new IllegalArgumentException(
                    "Invalid email or password");
        }

        String token = jwtService.generateHotelOwnerToken(
                owner.getId(),
                owner.getEmail(),
                owner.getHotel().getId()
        );

        return buildAuthResponse(owner, token);
    }

    private HotelOwnerAuthResponse buildAuthResponse(
            HotelOwner owner,
            String token) {

        return new HotelOwnerAuthResponse(
                owner.getId(),
                owner.getFullName(),
                owner.getEmail(),
                owner.getHotel().getId(),
                owner.getHotel().getName(),
                token,
                "Bearer"
        );
    }
}
