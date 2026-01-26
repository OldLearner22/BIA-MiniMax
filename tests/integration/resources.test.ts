import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../server/index";

describe("Resources API", () => {
  it("GET /api/resources should return 200 and an array", async () => {
    const res = await request(app).get("/api/resources");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("GET /api/resource-dependencies should return 200 and an array", async () => {
    const res = await request(app).get("/api/resource-dependencies");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
