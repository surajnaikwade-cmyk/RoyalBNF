
package com.royalbnf.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "hotel_owners",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_hotel_owner_email",
            columnNames = "email"
        ),
        @UniqueConstraint(
            name = "uk_hotel_owner_hotel",
            columnNames = "hotel_id"
        )
    }
)
@Getter
@Setter
@NoArgsConstructor
public class HotelOwner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String fullName;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, length = 15)
    private String phone;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "hotel_id",
        nullable = false,
        unique = true
    )
    private Hotel hotel;

    @Column(nullable = false)
    private boolean active = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
