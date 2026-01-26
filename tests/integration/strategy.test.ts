import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../server/index";

describe("Strategy API", () => {
  it("GET /api/strategy/assessments should return 200", async () => {
    const res = await request(app).get("/api/strategy/assessments");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("GET /api/strategic-planning should return 200", async () => {
    const res = await request(app).get("/api/strategic-planning");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
