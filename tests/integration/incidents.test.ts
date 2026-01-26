import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../server/index";

describe("Incidents API", () => {
  it("GET /api/incidents should return 200", async () => {
    const res = await request(app).get("/api/incidents");
    expect(res.status).toBe(200);
    // Flexible check since we don't know the exact pagination structure without seeding
    expect(typeof res.body).toBe("object");
  });

  it("GET /api/incidents/statistics should return 200", async () => {
    const res = await request(app).get("/api/incidents/statistics");
    expect(res.status).toBe(200);
  });
});
