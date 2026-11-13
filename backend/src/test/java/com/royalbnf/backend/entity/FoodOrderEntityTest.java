package com.royalbnf.backend.entity;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;

class FoodOrderEntityTest {

    @Test
    void addingItemKeepsBothSidesOfRelationshipInSync() {
        FoodOrder order = new FoodOrder();
        FoodOrderItem item = new FoodOrderItem();

        order.addItem(item);

        assertEquals(1, order.getItems().size());
        assertSame(item, order.getItems().get(0));
        assertSame(order, item.getFoodOrder());
    }

    @Test
    void removingItemDetachesItFromParent() {
        FoodOrder order = new FoodOrder();
        FoodOrderItem item = new FoodOrderItem();
        order.addItem(item);

        order.removeItem(item);

        assertEquals(0, order.getItems().size());
        assertNull(item.getFoodOrder());
    }
}
