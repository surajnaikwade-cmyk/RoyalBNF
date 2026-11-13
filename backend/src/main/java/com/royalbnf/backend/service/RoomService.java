package com.royalbnf.backend.service;

import com.royalbnf.backend.entity.Hotel;
import com.royalbnf.backend.entity.Room;
import com.royalbnf.backend.repository.HotelRepository;
import com.royalbnf.backend.repository.RoomRepository;

import org.springframework.stereotype.Service;
import java.util.List;




@Service
public class RoomService {

        private final RoomRepository roomRepository;
    private final HotelRepository hotelRepository;

    public RoomService(
            RoomRepository roomRepository,
            HotelRepository hotelRepository) 
            {
        this.roomRepository = roomRepository;
        this.hotelRepository = hotelRepository;
    }

    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    public Room getRoomById(Long id) {
        return roomRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Room not found with ID: " + id)
                );
    }

    public Room createRoom(Room room) {
    if (room.getHotel() == null || room.getHotel().getId() == null) {
        throw new IllegalArgumentException("Hotel ID is required");
    }

    Long hotelId = room.getHotel().getId();

    Hotel hotel = hotelRepository.findById(hotelId)
            .orElseThrow(() ->
                    new IllegalArgumentException("Hotel not found: " + hotelId));

    room.setHotel(hotel);
    return roomRepository.save(room);
}
}