import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { app } from "../../server/index";

describe("Processes API", () => {
  it("GET /api/processes should return 200 and an array", async () => {
    const res = await request(app).get("/api/processes");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // Basic structure check for a process
  it("GET /api/processes should return processes with required fields", async () => {
    const res = await request(app).get("/api/processes");
    if (res.body.length > 0) {
      const process = res.body[0];
      expect(process).toHaveProperty("id");
      expect(process).toHaveProperty("name");
      expect(process).toHaveProperty("organizationId");
    }
  });
});
