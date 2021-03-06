const express = require('express');
const pool = require('../modules/pool');
const router = express.Router();
const {
    rejectUnauthenticated,
  } = require('../modules/authentication-middleware');
const { isJSDocReadonlyTag, getParsedCommandLineOfConfigFile } = require('typescript');
require('dotenv').config()
const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN


const client = require('twilio')(accountSid, authToken)
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

// add new coach to the system 
router.post('/coach', async (req, res) => {
    // console.log(req.body)
    const connection = await pool.connect()
    try {
        await connection.query('BEGIN;')
        const query = `INSERT INTO "users" (first_name, last_name, email, phone, start_date, business_name, program_id) 
        VALUES ($1, $2, $3, $4, $5, $6, $7)`

        await connection.query(query, [req.body.firstName, req.body.lastName, req.body.email, req.body.phone, req.body.startDate, req.body.business, req.body.programID])

        await connection.query('COMMIT;')

        const msg = {
            to: req.body.email,
            from: 'talentsignalio@gmail.com',
            templateId: 'd-f36ff019d4074b29bd8465b092279f16', 

        }

        sgMail.send(msg)
        .then(m => {
            console.log('message sent')
        })
        .catch(error => {
            console.log(error)
        })

        
        res.sendStatus(201)

    } catch(err) {
        console.log(err)
        await connection.query('ROLLBACK;')
        res.sendStatus(500)
    } finally {
        connection.release()
    }
})

// add new client to the system 
router.post('/client', async (req, res) => {
    // console.log(req.body)
    const connection = await pool.connect()
    try {
        await connection.query('BEGIN;')
        const query = `INSERT INTO client (first_name, last_name, email, phone, contract_id, user_id, contract_status, coaching_status)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`

        await connection.query(query, [req.body.firstName, req.body.lastName, req.body.email, req.body.phone, req.body.contractID, req.body.coachID, req.body.contractStatus, req.body.coachingStatus])
        await connection.query('COMMIT;')
    } catch(err) {
        console.log(err)
        await connection.query('ROLLBACK;')
        res.sendStatus(500)
    } finally {
        connection.release()
    }
})

module.exports = router