import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../server/index";

describe("Risk Management API", () => {
  it("GET /api/risks should return 200", async () => {
    const res = await request(app).get("/api/risks");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("GET /api/threats should return 200", async () => {
    const res = await request(app).get("/api/threats");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("GET /api/risk-treatments should return 200", async () => {
    const res = await request(app).get("/api/risk-treatments");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
