\c biztime

DROP TABLE IF EXISTS companies_industries;
DROP TABLE IF EXISTS industries;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS companies;



CREATE TABLE companies (
    code text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text
);
CREATE TABLE invoices (
    id serial PRIMARY KEY,
    comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
    amt float NOT NULL,
    paid boolean DEFAULT false NOT NULL,
    add_date date DEFAULT CURRENT_DATE NOT NULL,
    paid_date date,
    CONSTRAINT invoices_amt_check CHECK ((amt > (0)::double precision))
);
CREATE TABLE industries (
    code text PRIMARY KEY,
    name text NOT NULL UNIQUE
);
CREATE TABLE companies_industries(
    comp_code text NOT NULL REFERENCES companies(code) ON DELETE CASCADE,
    ind_code text NOT NULL REFERENCES industries(code),
    PRIMARY KEY(comp_code, ind_code)
);
INSERT INTO companies (code, name, description)
VALUES ('apple', 'Apple', 'Maker of OsX');
INSERT INTO companies (code, name, description)
VALUES (
        'deloitte',
        'Deloitte',
        'A big 4 accounting firm.'
    );
INSERT INTO invoices (comp_code, amt)
VALUES ('apple', 1000);
INSERT INTO invoices (comp_code, amt)
VALUES ('deloitte', 2000);
INSERT INTO industries (code, name)
VALUES ('tech', 'Tech');
INSERT INTO industries (code, name)
VALUES ('finance', 'Finance');
INSERT INTO companies_industries (comp_code, ind_code)
VALUES ('apple', 'tech');
INSERT INTO companies_industries (comp_code, ind_code)
VALUES ('deloitte', 'finance');