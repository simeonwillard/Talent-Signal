const express = require('express');
const { rejectUnauthenticated } = require('../modules/authentication-middleware');
const pool = require('../modules/pool');
const router = express.Router();


// get payments for a coach based with the user_id and if it has been paid yet. 
// the amount refers to total payment received. the coach only receives 75% of this. 
router.get('/', rejectUnauthenticated, (req, res) => {
    const sqlText = `SELECT "payments".payout_date, SUM("amount" * 0.75) as "total_paid", ARRAY_AGG("payments".id), "payments".confirmation_number, "payments".confirmation_number AS "id" FROM "payments"
    JOIN "client" ON "client".contract_id = "payments".contract_id
    JOIN "users" ON "client".user_id = "users".id
    WHERE "client".user_id = $1 and "payments".is_paid = true
    GROUP BY "payments".payout_date , "payments".confirmation_number;`;

    pool.query(sqlText, [req.user.id])
    .then((result) => {
        res.send(result.rows);
    })
    .catch((error) => {
        console.log('error getting coaches payments for dashboard', error);
        res.sendStatus(500);
    })
});

// get payment details given the confirmation number 
router.get('/:id', rejectUnauthenticated, (req, res) => {
  const confirmation_number = req.params.id

  const sqlText = `SELECT CONCAT("client".first_name, ' ', "client".last_name) AS "full_name", "client".coaching_status, "payments".payment_status, "payments".amount, SUM("amount" * 0.75) AS "total_paid", "payments".scheduled_date, "payments".id AS "id", "client".id AS "clientId" FROM "payments"
  JOIN "client" ON "client".contract_id = "payments".contract_id
  JOIN "users" on "client".user_id = "users".id
  WHERE "client".user_id = $1 AND "payments".confirmation_number = $2
  GROUP BY "full_name", "client".coaching_status, "payments".payment_status, "payments".amount, "payments".scheduled_date, "payments".id, "client".id;`;

  pool.query(sqlText, [req.user.id, confirmation_number])
  .then((result) => {
      res.send(result.rows);
  })
  .catch((error) => {
      console.log('error getting coaches payments details ', error);
      res.sendStatus(500);
  })
});

//get payment details for a month given the date selected. 
router.get('/date/:id', rejectUnauthenticated, (req, res) => {
  const queryDate = `${req.params.id}-%`
  const sqlText = `SELECT CONCAT("client".first_name, ' ', "client".last_name) AS "full_name", "client".coaching_status, "payments".payment_status, "payments".amount, SUM("amount" * 0.75) AS "total_paid", "payments".scheduled_date, "payments".id AS "id", "client".id AS "clientId" FROM "payments"
  JOIN "client" ON "client".contract_id = "payments".contract_id
  JOIN "users" on "client".user_id = "users".id
  WHERE "client".user_id = $1 AND "payments".due_date::text LIKE $2
  GROUP BY "full_name", "client".coaching_status, "payments".payment_status, "payments".amount, "payments".scheduled_date, "payments".id, "client".id;`;

  pool.query(sqlText, [req.user.id, queryDate])
  .then((result) => {
      res.send(result.rows);
  })
  .catch((error) => {
      console.log('error getting coaches payments details ', error);
      res.sendStatus(500);
  })
});


module.exports = router;