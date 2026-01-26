import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../server/index";

describe("Exercises API", () => {
  it("GET /api/exercises returns 200 and an array", async () => {
    const res = await request(app).get("/api/exercises");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  }, 10000);
});
