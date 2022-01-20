// for mopre info see google docs, MySQL - notes
// Full setup for project using MySQL, MySQL2, Express
const express = require('express');
const mysql = require('mysql2');
// our module made for checking if a candidate can be posted
// to the database by making sure all of the candidate's fields are
// filled out by the user.
const inputCheck = require('./utils/inputCheck');

const PORT = process.env.PORT || 3001;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// for more info see google docs, MySQL - notes
// Connect Express.js server with MySQL database.
// Connect to database which we created in MySQL
// terminal see google docs MySQL - notes
const db = mysql.createConnection(
    {
      host: 'localhost',
      // MySQL username,
      user: 'root',
      // MySQL password
      password: 'Wc2X!cJk',
      database: 'election'
    },
    console.log('Connected to the election database.')
);



// prints all the row objects from the MySQL database
// and the candidates table
// Get all candidates when this api route is called.
// We just created an API endpoint to retrieve all the candidates 
// from the candidates table. Now the front-end team can loop 
// and parse this object on the front end to display a list of the 
// candidates' names.
app.get('/api/candidates', (req, res) => {
    // just to hold string for query in const variable
    const sql = `SELECT * FROM candidates`;
  
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
app.get('/api/candidate/:id', (req, res) => {
    // ? allows for a place holder to be put in the 
    // MySQL database query. 
    // This is called a prepared SQL statement.
    // The value to put in place
    // of the ? place holder is put after the "," and can be 
    // an array or a single value.
    const sql = `SELECT * FROM candidates WHERE id = ?`;
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

// API endpoint that will delete a candidate from the database.
// Delete a candidate
app.delete('/api/candidate/:id', (req, res) => {
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
app.post('/api/candidate', ({ body }, res) => {
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


// Default response for any other request (Not Found)
app.use((req, res) => {
    res.status(404).end();
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});