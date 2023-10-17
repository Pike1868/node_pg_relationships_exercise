//Set to connect to test db
process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../app");
const db = require("../db");

let testInvoice;

beforeEach(async () => {
  const testCompany = await db.query(
    `INSERT INTO companies (name, description) VALUES ($1,$2) RETURNING code, name, description`,
    ["Apple", "Maker of OsX"]
  );

  const result = await db.query(
    `INSERT INTO invoices (comp_code, amt, paid, paid_date) 
       VALUES ($1, $2, $3, $4) RETURNING id,comp_code, amt, paid, add_date, paid_date`,
    ["apple", 100, false, null]
  );
  testInvoice = result.rows[0];
  console.log(testInvoice.add_date);
  invoiceAddDate = testInvoice.add_date.toISOString();
});

afterEach(async () => {
  await db.query("DELETE FROM companies");
  await db.query("DELETE FROM invoices");
});

afterAll(async () => {
  //close db connection
  await db.end();
});

// **GET /invoices
describe("GET /invoices", () => {
  test("Returns info on invoices", async () => {
    const result = await request(app).get(`/invoices`);
    expect(result.statusCode).toEqual(200);
    expect(result.body).toEqual({
      invoices: [
        {
          id: testInvoice.id,
          comp_code: "apple",
          amt: 100,
          paid: false,
          add_date: invoiceAddDate,
          paid_date: null,
        },
      ],
    });
  });
});

// **GET /invoices/[id]
describe("GET /invoices/[id]", () => {
  test("Returns obj on given invoice", async () => {
    const result = await request(app).get(`/invoices/${testInvoice.id}`);
    expect(result.statusCode).toEqual(200);
    expect(result.body).toEqual({
      invoice: {
        id: testInvoice.id,
        comp_code: "apple",
        amt: 100,
        paid: false,
        add_date: invoiceAddDate,
        paid_date: null,
      },
    });
  });
  test("Returns 404 if invoice cannot be found.", async () => {
    const result = await request(app).get(`/invoices/999`);
    expect(result.statusCode).toEqual(404);
    expect(result.body).toEqual({
      error: "Invoice with id of '999' not found",
      status: 404,
    });
  });
});

// **POST /invoices
describe("POST /invoices", () => {
  test("Adds an invoice, returns obj of new invoice added", async () => {
    const result = await request(app).post(`/invoices`).send({
      comp_code: "apple",
      amt: 100,
    });
    expect(result.statusCode).toEqual(201);
    expect(result.body).toEqual({
      invoice: {
        id: testInvoice.id + 1,
        comp_code: "apple",
        amt: 100,
        paid: false,
        add_date: invoiceAddDate,
        paid_date: null,
      },
    });
  });
});

// **PATCH /invoices/[id]
describe("PATCH /invoices/[id]", () => {
  test("Updates an existing invoice, returns updated invoice object", async () => {
    const result = await request(app)
      .patch(`/invoices/${testInvoice.id}`)
      .send({ amt: 1000 });
    expect(result.statusCode).toBe(200);
    expect(result.body).toEqual({
      invoice: {
        id: testInvoice.id,
        comp_code: "apple",
        amt: 1000,
        paid: false,
        add_date: invoiceAddDate,
        paid_date: null,
      },
    });
  });
  test("Returns 404 if invoice cannot be found.", async () => {
    const result = await request(app).get(`/invoices/999`);
    expect(result.statusCode).toEqual(404);
    expect(result.body).toEqual({
      error: "Invoice with id of '999' not found",
      status: 404,
    });
  });
});

// **DELETE /invoices/[id]
describe("DELETE /invoices/[id]", () => {
  test("Delete an existing invoice", async () => {
    const result = await request(app).delete(`/invoices/${testInvoice.id}`);
    expect(result.statusCode).toBe(200);
    expect(result.body).toEqual({ status: "deleted" });
  });
  test("Returns 404 if invoice cannot be found.", async () => {
    const result = await request(app).get(`/invoices/999`);
    expect(result.statusCode).toEqual(404);
    expect(result.body).toEqual({
      error: "Invoice with id of '999' not found",
      status: 404,
    });
  });
});
