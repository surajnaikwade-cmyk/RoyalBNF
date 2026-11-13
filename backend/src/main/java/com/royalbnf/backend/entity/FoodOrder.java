
package com.royalbnf.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "food_orders")
@Getter
@Setter
@NoArgsConstructor
public class FoodOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Booking associated with this food order
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    // Hotel that receives and prepares this order
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "hotel_id", nullable = false)
    private Hotel hotel;

    /*
     * Legacy single-item fields.
     * Retained to preserve historical orders.
     * New multi-item orders can leave these fields null.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_food_menu_id")
    private HotelFoodMenu hotelFoodMenu;

    @Column(name = "quantity")
    private Integer quantity;

    // Date on which the hotel should serve the food
    @Column(name = "serving_date", nullable = false)
    private LocalDate servingDate;

    @Column(name = "special_instructions", length = 500)
    private String specialInstructions;

    // Overall status of the complete food order
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private FoodOrderStatus status = FoodOrderStatus.PENDING;

    // Legacy single-item price
    @Column(name = "unit_price", precision = 10, scale = 2)
    private BigDecimal unitPrice;

    // Total price of all items in the order
    @Column(name = "total_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPrice;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Multiple food items belonging to one order
    @OneToMany(
            mappedBy = "foodOrder",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<FoodOrderItem> items = new ArrayList<>();

    // Add an item and maintain both sides of the relationship
    public void addItem(FoodOrderItem item) {
        if (item == null) {
            throw new IllegalArgumentException("Food order item cannot be null");
        }

        items.add(item);
        item.setFoodOrder(this);
    }

    // Remove an item and maintain both sides of the relationship
    public void removeItem(FoodOrderItem item) {
        if (items.remove(item)) {
            item.setFoodOrder(null);
        }
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
