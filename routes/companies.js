const express = require("express");
const router = new express.Router();
const db = require("../db");
const ExpressError = require("../expressError");
const slugify = require("slugify");

//**GET /companies :** Returns list of companies, like `{companies: [{code, name}, ...]}`
router.get("/", async function (req, res, next) {
  try {
    const result = await db.query(
      "SELECT c.code, c.name AS company_name, c.description, array_agg(i.name) AS industries FROM companies AS c LEFT JOIN companies_industries AS ci ON c.code = ci.comp_code LEFT JOIN industries AS i ON ci.ind_code=i.code GROUP BY c.code, c.name, c.description"
    );
    return res.json({ companies: result.rows });
  } catch (err) {
    return next(err);
  }
});

//**GET /companies/[code] :** Return obj of company: `{company: {code, name, description}}`
//If the company given cannot be found, this should return a 404 status response.
router.get("/:code", async (req, res, next) => {
  const { code } = req.params;
  try {
    const result = await db.query("SELECT * FROM companies WHERE code=$1 ", [
      code,
    ]);
    if (result.rows.length === 0) {
      throw new ExpressError(`Company with code of '${code}' not found`, 404);
    }
    return res.json({ company: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

// **POST /companies :** Adds a company. Needs to be given JSON like: `{code, name, description}` Returns obj of new company:  `{company: {code, name, description}}`
router.post("/", async (req, res, next) => {
  try {
    const { name, description } = req.body;
    let code = slugify(name, { lower: true });
    const result = await db.query(
      "INSERT INTO companies (code, name, description) VALUES ($1,$2,$3) RETURNING *",
      [code, name, description]
    );
    return res.status(201).json({ company: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

// **PUT /companies/[code] :** Edit existing company. Should return 404 if company cannot be found.
// Needs to be given JSON like: `{name, description}` Returns update company object: `{company: {code, name, description}}`
router.patch("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    const { name, description } = req.body;
    const result = await db.query(
      "UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING *",
      [name, description, code]
    );
    if (result.rows.length === 0) {
      throw new ExpressError(`Company with code of '${code}' not found`, 404);
    }
    return res.json({ company: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

// **DELETE /companies/[code] :** Deletes company. Should return 404 if company cannot be found.
// Returns `{status: "deleted"}`
router.delete("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;

    const result = await db.query("DELETE FROM companies WHERE code=$1", [
      code,
    ]);
    if (result.rowCount !== 1) {
      throw new ExpressError(`Company with code of '${code}' not found`, 404);
    }
    return res.status(200).json({ status: "deleted" });
  } catch (err) {
    return next(err);
  }
});

//POST /companies/[company_code]/industries/[ind_code]
router.post("/:comp_code/industries/:ind_code", async (req, res, next) => {
  try {
    const { comp_code, ind_code } = req.params;
    const result = await db.query(
      "INSERT INTO companies_industries (comp_code, ind_code) VALUES ($1, $2) RETURNING *",
      [comp_code, ind_code]
    );
    console.log(result.rows);
    if (result.rows.length === 0) {
      throw new ExpressError(
        `Company with code of '${comp_code}' not found`,
        404
      );
    }
    return res.json(result.rows[0]);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
