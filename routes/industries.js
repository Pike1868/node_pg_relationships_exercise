const express = require("express");
const router = new express.Router();
const db = require("../db");
const ExpressError = require("../expressError");
const slugify = require("slugify");

//**GET /industries:listing all industries, which should show the company code(s) for that industry ** Returns list of industries, like `{industries: [{code, name, [comp_code(s),comp_code(s)]}, ...]}`
router.get("/", async (req, res, next) => {
  try {
    const result = await db.query(
      "SELECT i.code, i.name, array_agg(ci.comp_code) AS companies FROM industries AS i, companies_industries As ci WHERE i.code = ci.ind_code GROUP BY i.code, i.name"
    );
    return res.json({ industries: result.rows });
  } catch (err) {
    return next(err);
  }
});

// **POST /industries :** Adds an industry. Needs to be given JSON like: `{code, name}` Returns obj of new industry:  `{industry:{code,name}}`

router.post("/", async (req, res, next) => {
  try {
    let { code, name } = req.body;
    code = slugify(code, { lower: true });
    const result = await db.query(
      "INSERT INTO industries (code, name) VALUES ($1,$2) RETURNING *",
      [code, name]
    );

    return res.status(201).json({ industry: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
