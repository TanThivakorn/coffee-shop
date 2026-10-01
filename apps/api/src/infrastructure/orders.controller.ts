import { Body, Controller, Get, HttpCode, Post } from "@nestjs/common";
import {
  drinkSchema,
  orderSchema,
  type DrinkInput,
  type OrderInput,
} from "@coffee/shared";
import { OrdersService } from "../application/orders.service";
import { ZodPipe } from "./zod.pipe";
@Controller()
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}
  @Get("catalog") catalog() {
    return this.orders.getCatalog();
  }
  @Post("quotes")
  @HttpCode(200)
  quote(@Body(new ZodPipe(drinkSchema)) body: DrinkInput) {
    return this.orders.quote(body);
  }
  @Post("orders")
  create(@Body(new ZodPipe(orderSchema)) body: OrderInput) {
    return this.orders.create(body);
  }
}
