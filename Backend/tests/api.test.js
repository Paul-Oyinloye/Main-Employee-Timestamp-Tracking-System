import request from "supertest";
import app from "../server.js";

describe("Backend API tests", () => {

  test("GET /ping should return ok", async () => {
    const res = await request(app).get("/ping");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  test("GET /employees should return an array", async () => {
    const res = await request(app).get("/employees");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

});