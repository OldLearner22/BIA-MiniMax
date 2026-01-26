import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../server/index";

describe("Settings API", () => {
  it("GET /api/settings/dimensions should return 200", async () => {
    const res = await request(app).get("/api/settings/dimensions");
    expect(res.status).toBe(200);
    // Settings API returns a Record<string, any>, so it should be an object
    expect(typeof res.body).toBe("object");
    // Ensure it's not an array (which typeof [] === 'object' would pass)
    expect(Array.isArray(res.body)).toBe(false);
  });
});
