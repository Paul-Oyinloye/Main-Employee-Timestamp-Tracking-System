import request from "supertest";
import app from "../server.js";

describe("Employees API", () => {

  it("GET /employees should return an array", async () => {
    const res = await request(app).get("/employees");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("POST /employees should create a new employee", async () => {
    const res = await request(app)
      .post("/employees")
      .send({ name: "Test User", role: "Tester" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("id");
    expect(res.body.name).toBe("Test User");
  });

});