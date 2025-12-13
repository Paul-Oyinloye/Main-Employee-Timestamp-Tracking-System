import request from "supertest";
import app from "../server.js";

describe("Employees API", () => {
  it("GET /employees should return array", async () => {
    const res = await request(app).get("/employees");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});