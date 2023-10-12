const express = require("express");
const router = new express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

/**


**GET /companies/[code] :** Return obj of company: `{company: {code, name, description, invoices: [id, ...]}}` If the company given cannot be found, this should return a 404 status response. */

// GET /invoices :** Return info on invoices: like `{invoices: [{id, comp_code}, ...]}`

router.get("/", async (req, res, next) => {
  try {
    const result = await db.query("SELECT * FROM invoices");
    return res.json({ invoices: result.rows });
  } catch (err) {
    return next(err);
  }
});

// **GET /invoices/[id] :** Returns obj on given invoice.
// If invoice cannot be found, returns 404. Returns `{invoice: {id, amt, paid, add_date, paid_date, company: {code, name, description}}}`

router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query("SELECT * FROM invoices WHERE id=$1", [id]);

    if (result.rowCount === 0) {
      throw new ExpressError(`Invoice with id of '${id}' not found`, 404);
    }
    return res.json(result.rows[0]);
  } catch (err) {
    return next(err);
  }
});

// **POST /invoices :** Adds an invoice. Needs to be passed in JSON body of: `{comp_code, amt}`
// Returns: `{invoice: {id, comp_code, amt, paid, add_date, paid_date}}`
router.post("/", async (req, res, next) => {
  try {
    const { comp_code, amt } = req.body;
    const result = await db.query(
      "INSERT INTO invoices (comp_code, amt) VALUES ($1,$2) RETURNING *",
      [comp_code, amt]
    );
    return res.json(result.rows[0]);
  } catch (err) {
    return next(err);
  }
});

// **PUT /invoices/[id] :** Updates an invoice. If invoice cannot be found, returns a 404.
// Needs to be passed in a JSON body of `{amt}` Returns: `{invoice: {id, comp_code, amt, paid, add_date, paid_date}}`

router.patch("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amt } = req.body;
    const result = await db.query(
      "UPDATE invoices SET amt=$1 WHERE id=$2 RETURNING *",
      [amt, id]
    );
    if (result.rowCount === 0) {
      throw new ExpressError(`Invoice with id of '${id}' not found`, 404);
    }
    return res.json(result.rows[0]);
  } catch (err) {
    return next(err);
  }
});

// **DELETE /invoices/[id] :** Deletes an invoice.If invoice cannot be found, returns a 404. Returns: `{status: "deleted"}` Also, one route from the previous part should be updated:

router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query("DELETE FROM invoices WHERE code=$1", [id]);
    if (result.rowCount === 0) {
      throw new ExpressError(`Invoice with id of '${id}' not found`, 404);
    }
    return res.json({ status: "deleted" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
