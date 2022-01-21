const express = require('express');
const router = express.Router();
// local module, connects to MySQL database.
const db = require('../../db/connection');
// local module, validates input.
const inputCheck = require('../../utils/inputCheck');



// prints all the row objects from the MySQL database
// and the candidates table
// Get all candidates when this api route is called.
// We just created an API endpoint to retrieve all the candidates 
// from the candidates table. Now the front-end team can loop 
// and parse this object on the front end to display a list of the 
// candidates' names.
router.get('/candidates', (req, res) => {
    // just to hold string for query in const variable
    // see google docs MySQL - notes, 
    // Joining data from different tables together.

    // selects all columns from candidates table.
    // selects the name colum from parties and gives it the
    // alias of "party_name" so that it doesnt show up as just "name"
    // in the candidate table column.
    // left join, join the selected row from parties onto the 
    // candidates table and match the party_name based on the candidate's
    // id.
    const sql = `SELECT candidates.*, parties.name 
                 AS party_name 
                 FROM candidates 
                 LEFT JOIN parties 
                 ON candidates.party_id = parties.id`;
  
    // queries our database to select all rows from
    // the candidates table
    db.query(sql, (err, rows) => {
      if (err) {
        // Instead of logging the error, we'll send a status 
        // code of 500 and place the error message within a 
        // JSON object. This will all be handled within the error-handling 
        // conditional. The 500 status code indicates a server 
        // error—different than a 404, which indicates a user 
        // request error. The return statement will exit the database 
        // call once an error is encountered.
        res.status(500).json({ error: err.message });
        return;
      }
      // if no error in retrieving the rows data from the
      // database, the send back the data as json.
      // object.message will be the success message
      // object.data will be the data on every candidate
      // as an array of individual objects. 
      // [{candidate info}, {candidate info}]
      res.json({
        message: 'success',
        data: rows
      });
    });
});



// For the next request, we'll create an api endpoint
// that will return a single candidate 
// from the candidates table inside our database 
// based on their id. As we 
// discussed before, selecting a single candidate by their 
// primary key is the only way to ensure that the candidate 
// requested is the one that's returned.
// GET a single candidate's row of info.
// the row contains this single candidates name, id etc.
// http://localhost:3001/api/candidate/1 would bring
// up the json data on the candidate with an id of 1.
router.get('/candidate/:id', (req, res) => {
    // ? allows for a place holder to be put in the 
    // MySQL database query. 
    // This is called a prepared SQL statement.
    // The value to put in place
    // of the ? place holder can be 
    // an array or a single value.
    // see above get function for more comments...
    const sql = `SELECT candidates.*, parties.name 
                 AS party_name 
                 FROM candidates 
                 LEFT JOIN parties 
                 ON candidates.party_id = parties.id 
                 WHERE candidates.id = ?`;
    // takes the id number from the request url
    const params = [req.params.id];
  
    db.query(sql, params, (err, row) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({
        message: 'success',
        data: row
      });
    });
});



// It's possible that a candidate will change his or her party 
// affiliation over time. Ronald Firbank, for instance, might decide 
// one day that he likes HTML more than JavaScript. This kind of 
// update is something the front-end team would like to be able to make 
// through the app itself. Sounds like the team will need an API route!
// What request type would be appropriate for updating data? We've 
// established that GET is for reading, POST for creating, and DELETE 
// for deleting. None of those make sense for updating, but there is a fourth 
// request type we can use: the PUT request.
// Update a candidate's party based on candidate's id
router.put('/candidate/:id', (req, res) => {

    // we should be extra sure that a party_id was 
    // provided before we attempt to update the database.
    const errors = inputCheck(req.body, 'party_id');
  
    if (errors) {
      res.status(400).json({ error: errors });
      return;
    }
  
    // update candidates table, set party_id to <id>
    // where the candidates id is equal to the specified id that
    // was passed in in the req.params.
    const sql = `UPDATE candidates SET party_id = ? 
                 WHERE id = ?`;
    const params = [req.body.party_id, req.params.id];
  
    db.query(sql, params, (err, result) => {
      if (err) {
        res.status(400).json({ error: err.message });
        // check if a record was found
      } else if (!result.affectedRows) {
        res.json({
          message: 'Candidate not found'
        });
      } else {
        res.json({
          message: 'success',
          data: req.body,
          changes: result.affectedRows
        });
      }
    });
  });



// API endpoint that will delete a candidate from the database.
// Delete a candidate
router.delete('/candidate/:id', (req, res) => {
    const sql = `DELETE FROM candidates WHERE id = ?`;
    const params = [req.params.id];
  
    db.query(sql, params, (err, result) => {
      if (err) {
        res.statusMessage(400).json({ error: res.message });
      } else if (!result.affectedRows) {
        // checks to see if the deletion request affected
        // any row in the table. If it did not, then there
        // was not any candidate with the specified id.
        res.json({
          message: 'Candidate not found'
        });
      } else {
        res.json({
          message: 'deleted',
          changes: result.affectedRows,
          id: req.params.id
        });
      }
    });
  });
  
  
// Create a candidate.
// To insert a candidate into the candidates table. We'll use 
// the endpoint /api/candidate. In the callback function, we'll use 
// the object req.body to populate the candidate's data. Destructuring
// the req object just to get its body property.
router.post('/candidate', ({ body }, res) => {
    // This inputCheck module was provided by a helpful U Develop It 
    // member. We'll use this module to verify that user info in the 
    // request can create a candidate.
    // We have to validate the user data before the changes are 
    // inserted into the database, to keep the database free of 
    // erroneous data and avoid wasting resources on expensive 
    // database calls.
    const errors = inputCheck(body, 'first_name', 'last_name', 'industry_connected');
    // if errors has been assigned any value, which is the error strings
    // that inputCheck() will return if one or more properties was not
    // specified, then we will send an error message and json of an object
    // with the property "error" which contains all the error messages returned
    // by inputCheck().
    if (errors) {
        res.status(400).json({ error: errors });
        return;
    }

    // after candidate input was validated, save the new candidate to the database.
    // prepared statement using ? place holders for values, which are then filled in 
    // by the params array in the query() method below.
    // there is no column for the id. MySQL will autogenerate the id and relieve 
    // us of the responsibility to know which id is available to populate.
    const sql = `INSERT INTO candidates (first_name, last_name, industry_connected)
    VALUES (?,?,?)`;
    const params = [body.first_name, body.last_name, body.industry_connected];

    db.query(sql, params, (err, result) => {
        if (err) {
        res.status(400).json({ error: err.message });
        return;
        }
        res.json({
        message: 'success',
        data: body
        });
    });
  
});



module.exports = router;