import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../server/index";

describe("Document Management API", () => {
  // Documents has a slightly different base path structure in server/index.ts
  // routed as app.use("/api", documentRoutes);

  it("GET /api/documents should return 200", async () => {
    const res = await request(app).get("/api/documents");
    expect(res.status).toBe(200);
    // Flexible check as documents structure might be complex
    expect(res.body).toBeTruthy();
  });

  it("GET /api/document-templates should return 200", async () => {
    const res = await request(app).get("/api/document-templates");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
