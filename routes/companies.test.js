//Set to connect to test db
process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../app");
const db = require("../db");

let testCompany;

beforeEach(async () => {
  const result = await db.query(
    `INSERT INTO companies (code, name, description) VALUES ($1,$2,$3) RETURNING code, name, description`,
    ["google", "Google", "Actually know as Alphabet Inc"]
  );
  testCompany = result.rows[0];
});

afterEach(async () => {
  await db.query("DELETE FROM companies");
});

afterAll(async () => {
  //close db connection
  await db.end();
});

// **GET /companies
describe("GET /companies", () => {
  test("Returns list of companies", async () => {
    const result = await request(app).get(`/companies`);
    expect(result.statusCode).toEqual(200);
    expect(result.body).toEqual({ companies: [testCompany] });
  });
});

// **GET /companies/[code]
describe("GET /companies/[code]", () => {
  test("Returns obj of a company", async () => {
    const result = await request(app).get(`/companies/google`);
    expect(result.statusCode).toEqual(200);
    expect(result.body).toEqual({ company: testCompany });
  });
  test("Returns 404 if company cannot be found.", async () => {
    const result = await request(app).get(`/companies/random`);
    console.log(result.body);
    expect(result.statusCode).toEqual(404);
    expect(result.body).toEqual({
      error: "Company with code of 'random' not found",
      status: 404,
    });
  });
});

// **POST /companies
describe("POST /companies", () => {
  test("Adds a company, returns obj of new company added}`", async () => {
    const result = await request(app).post(`/companies`).send({
      name: "Apple",
      description: "Description of apple test",
    });
    expect(result.statusCode).toEqual(201);
    expect(result.body).toEqual({
      company: {
        code: "apple",
        name: "Apple",
        description: "Description of apple test",
      },
    });
  });
});

// **PATCH /companies/[code]
describe("PATCH /companies/:code", () => {
  test("Edit existing company, returns updated company object", async () => {
    const result = await request(app)
      .patch(`/companies/google`)
      .send({ name: "Test Company", description: "No longer google company" });
    expect(result.statusCode).toBe(200);
    expect(result.body).toEqual({
      company: {
        code: "google",
        name: "Test Company",
        description: "No longer google company",
      },
    });
  });
  test("Should return 404 if company cannot be found.", async () => {
    const result = await request(app).patch(`/companies/random`);
    expect(result.statusCode).toEqual(404);
    expect(result.body).toEqual({
      error: "Company with code of 'random' not found",
      status: 404,
    });
  });
});

// **DELETE /companies/[code]
describe("DELETE /companies/:code", () => {
  test("Delete an existing company", async () => {
    console.log(testCompany);
    const result = await request(app).delete(`/companies/google`);
    expect(result.statusCode).toEqual(200);
    expect(result.body).toEqual({ status: "deleted" });
  });
  test("Should return 404 if company cannot be found.", async () => {
    const result = await request(app).delete(`/companies/random`);
    expect(result.statusCode).toEqual(404);
    expect(result.body).toEqual({
      error: "Company with code of 'random' not found",
      status: 404,
    });
  });
});
