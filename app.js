/** BizTime express application. */
const express = require("express");
const path = require("path");
const app = express();
const ExpressError = require("./expressError");
const companiesRoutes = require("./routes/companies");
const invoicesRoutes = require("./routes/invoices");

app.use(express.json());
app.use("/companies", companiesRoutes);
app.use("/invoices", invoicesRoutes);

app.get("/favicon.ico", (req, res) => res.sendStatus(204));

app.get("/", (req, res) => {
  res.status(200).sendFile(path.resolve("index.html"));
});

/** 404 handler */

app.use(function (req, res, next) {
  const err = new ExpressError("Not Found", 404);
  return next(err);
});

/** general error handler */

app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";

  return res.status(status).json({
    error: message,
    status: status,
  });
});

module.exports = app;
