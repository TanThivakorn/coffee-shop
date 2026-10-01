import { Module } from "@nestjs/common";
import { OrdersService } from "./application/orders.service";
import { OrdersController } from "./infrastructure/orders.controller";
@Module({ controllers: [OrdersController], providers: [OrdersService] })
export class AppModule {}
