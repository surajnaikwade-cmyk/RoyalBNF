
package com.royalbnf.backend.dto;

import com.royalbnf.backend.entity.FoodOrderStatus;
import jakarta.validation.constraints.NotNull;

public record FoodOrderStatusRequest(

        @NotNull(message = "Order status is required")
        FoodOrderStatus status

) {}
