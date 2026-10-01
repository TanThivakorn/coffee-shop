import { Injectable } from "@nestjs/common";
import type { DrinkInput, OrderInput } from "@coffee/shared";
import { catalog } from "../domain/catalog";
import { Drink } from "../domain/drink";
import { Order } from "../domain/order";
@Injectable()
export class OrdersService {
  getCatalog() {
    return catalog;
  }
  quote(input: DrinkInput) {
    return new Drink(input, catalog).toReceiptItem();
  }
  create(input: OrderInput) {
    return new Order(input, catalog).receipt();
  }
}
