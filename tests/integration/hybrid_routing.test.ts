import { describe, it, expect } from "vitest";
import request from "supertest";

const BASE_URL = "http://localhost:5000";

describe("Hybrid Routing Verification", () => {
  it("GET /api/risks should be served by .NET (v2)", async () => {
    const res = await request(BASE_URL).get("/api/risks");
    expect(res.status).toBe(200);
    expect(res.headers["x-source"]).toBe("NET-Core-V2");
    expect(Array.isArray(res.body)).toBe(true);
  });

  let createdRiskId: string;

  it("POST /api/risks should create a risk in .NET", async () => {
    const newRisk = {
      title: "Hybrid Test Risk",
      category: "Strategic",
      description: "Verifying .NET migration persistence",
      status: "Open",
      criticality: "High",
      probability: 0.5,
      impact: 0.8,
      exposure: 0.4,
    };

    const res = await request(BASE_URL).post("/api/risks").send(newRisk);
    expect(res.status).toBe(200);
    expect(res.body.title).toBe(newRisk.title);
    expect(res.body.id).toBeDefined();
    createdRiskId = res.body.id;
  });

  it("PUT /api/risks/:id should update a risk in .NET", async () => {
    const updateData = {
      id: createdRiskId,
      title: "Updated Hybrid Risk",
      category: "Strategic",
      status: "Mitigated",
    };

    const res = await request(BASE_URL)
      .put(`/api/risks/${createdRiskId}`)
      .send(updateData);
    expect(res.status).toBe(200);
    expect(res.body.title).toBe(updateData.title);
    expect(res.body.status).toBe(updateData.status);
  });

  it("DELETE /api/risks/:id should delete a risk in .NET", async () => {
    const res = await request(BASE_URL).delete(`/api/risks/${createdRiskId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("GET /api/threats should be served by Node.js (v1)", async () => {
    const res = await request(BASE_URL).get("/api/threats");
    expect(res.status).toBe(200);
    // Node doesn't send x-source header
    expect(res.headers["x-source"]).toBeUndefined();
    expect(Array.isArray(res.body)).toBe(true);
  });
});
