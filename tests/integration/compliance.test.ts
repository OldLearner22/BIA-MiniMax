import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../server/index";

describe("Compliance API", () => {
  it("GET /api/compliance/frameworks should return 200 and an array", async () => {
    const res = await request(app).get("/api/compliance/frameworks");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("GET /api/compliance/matrix should return 200 and stats", async () => {
    const res = await request(app).get("/api/compliance/matrix");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("stats");
    expect(res.body).toHaveProperty("frameworks");
  });
});
