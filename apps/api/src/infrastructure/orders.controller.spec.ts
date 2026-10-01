import "reflect-metadata";
import { Test } from "@nestjs/testing";
import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../app.module";
const drink = {
  base: "coffee",
  size: "large",
  syrups: ["vanilla", "vanilla"],
  toppings: ["whipped_cream"],
};
describe("Coffee API integration", () => {
  let app: INestApplication;
  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = testingModule.createNestApplication();
    await app.listen(0, "127.0.0.1");
  });
  afterAll(async () => {
    await app.close();
  });
  test("catalog supplies available options and integer prices", async () => {
    const response = await request(app.getHttpServer())
      .get("/catalog")
      .expect(200);
    expect(response.body.bases).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "coffee", price: 7000 }),
      ]),
    );
    expect(response.body.currency).toBe("THB");
  });
  test("quote calculates duplicates without creating an order", async () => {
    const response = await request(app.getHttpServer())
      .post("/quotes")
      .send(drink)
      .expect(200);
    expect(response.body).toEqual({
      description: "Large Coffee, Vanilla, Vanilla, Whipped Cream",
      price: 15000,
    });
  });
  test("creates an itemized order with HTTP 201", async () => {
    const response = await request(app.getHttpServer())
      .post("/orders")
      .send({
        drinks: [
          drink,
          { base: "milk", size: "small", syrups: [], toppings: [] },
        ],
      })
      .expect(201);
    expect(response.body.items).toHaveLength(2);
    expect(response.body.items[1]).toEqual({
      description: "Small Milk",
      price: 5000,
    });
    expect(response.body.grandTotal).toBe(20000);
  });
  test("returns clear validation paths for an invalid ingredient", async () => {
    const response = await request(app.getHttpServer())
      .post("/orders")
      .send({ drinks: [{ ...drink, syrups: ["bad"] }] })
      .expect(400);
    expect(response.body).toMatchObject({
      message: "Invalid request",
      errors: [{ path: "drinks.0.syrups.0", message: expect.any(String) }],
    });
  });
  test("rejects an empty order", async () => {
    await request(app.getHttpServer())
      .post("/orders")
      .send({ drinks: [] })
      .expect(400);
  });
  test("rejects client-supplied prices", async () => {
    await request(app.getHttpServer())
      .post("/quotes")
      .send({ ...drink, price: 1 })
      .expect(400);
  });
});
