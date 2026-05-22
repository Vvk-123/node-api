"use strict";

const request = require("supertest");
const app = require("../../src/app");
const { sequelize } = require("../../src/models");

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe("Items API", () => {
  let createdId;

  describe("POST /api/v1/items", () => {
    it("should create a new item", async () => {
      const res = await request(app)
        .post("/api/v1/items")
        .send({
          name: "Test Item",
          description: "A test item",
          status: "active",
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.item).toHaveProperty("id");
      expect(res.body.item.name).toBe("Test Item");
      createdId = res.body.item.id;
    });

    it("should return 422 for missing name", async () => {
      const res = await request(app)
        .post("/api/v1/items")
        .send({ description: "No name" });
      expect(res.statusCode).toBe(422);
    });
  });

  describe("GET /api/v1/items", () => {
    it("should return paginated items", async () => {
      const res = await request(app).get("/api/v1/items");
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("items");
      expect(res.body).toHaveProperty("pagination");
    });

    it("should filter by status", async () => {
      const res = await request(app).get("/api/v1/items?status=active");
      expect(res.statusCode).toBe(200);
      res.body.items.forEach((item) => expect(item.status).toBe("active"));
    });
  });

  describe("GET /api/v1/items/:id", () => {
    it("should return a single item", async () => {
      const res = await request(app).get(`/api/v1/items/${createdId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.item.id).toBe(createdId);
    });

    it("should return 404 for non-existent item", async () => {
      const res = await request(app).get(
        "/api/v1/items/00000000-0000-0000-0000-000000000000",
      );
      expect(res.statusCode).toBe(404);
    });
  });

  describe("PATCH /api/v1/items/:id", () => {
    it("should update an item", async () => {
      const res = await request(app)
        .patch(`/api/v1/items/${createdId}`)
        .send({ name: "Updated Item" });
      expect(res.statusCode).toBe(200);
      expect(res.body.item.name).toBe("Updated Item");
    });
  });

  describe("DELETE /api/v1/items/:id", () => {
    it("should soft-delete an item", async () => {
      const res = await request(app).delete(`/api/v1/items/${createdId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toMatch(/deleted/i);
    });
  });
});
