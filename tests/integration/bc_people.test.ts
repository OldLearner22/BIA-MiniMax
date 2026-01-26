import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../server/index";

describe("BC People & Teams API", () => {
  it("GET /api/bc-people should return 200", async () => {
    const res = await request(app).get("/api/bc-people");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("GET /api/bc-team-structure should return 200", async () => {
    const res = await request(app).get("/api/bc-team-structure");
    expect(res.status).toBe(200);
    // The endpoint returns an object with { teams, people, roles, assignments }
    expect(res.body).toHaveProperty("teams");
    expect(res.body).toHaveProperty("people");
    expect(res.body).toHaveProperty("roles");
    expect(res.body).toHaveProperty("assignments");
  });

  it("GET /api/bc-roles should return 200", async () => {
    const res = await request(app).get("/api/bc-roles");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
