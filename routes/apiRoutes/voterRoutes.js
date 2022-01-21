const express = require('express');
const router = express.Router();
const db = require('../../db/connection');
const inputCheck = require('../../utils/inputCheck');


// endpoint to return all voters
// as row objects
router.get('/voters', (req, res) => {
    // The front-end team wanted the data returned in alphabetical order by 
    // last name. We could use JavaScript and the Array.prototype.sort() 
    // method before sending the response back, but why do that when SQL has 
    // sort options built in?
    // In SQL, rows can be sorted on retrieval simply by including an ORDER BY 
    // clause. If you want to sort the data in descending order (i.e., 
    // starting at Z instead of A), you can add a DESC keyword (e.g., ORDER BY last_name DESC).
    const sql = `SELECT * FROM voters ORDER BY last_name`;
  
    // queries the database
    db.query(sql, (err, rows) => {
      if (err) {
          // 500 is a server error.
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({
        message: 'success',
        data: rows,
      });
    });
});



// Get single voter based on id.
router.get('/voter/:id', (req, res) => {
    const sql = `SELECT * FROM voters WHERE id = ?`;
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


// First, let's implement the POST request. Assuming the front end will send us 
// the user's first name, last name, and email address, we can write the route 
// to appear like the following code:
router.post('/voter', ({ body }, res) => {

    // Data validation
    const errors = inputCheck(body, 'first_name', 'last_name', 'email');
    if (errors) {
    res.status(400).json({ error: errors });
    return;
    }

    const sql = `INSERT INTO voters (first_name, last_name, email) VALUES (?,?,?)`;
    const params = [body.first_name, body.last_name, body.email];
  
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


// PUT route so users can update their email address based on
// the user's id and req.body
// update voter email.
router.put('/voter/:id', (req, res) => {
    // Data validation
    const errors = inputCheck(req.body, 'email');
    if (errors) {
      res.status(400).json({ error: errors });
      return;
    }
  
    const sql = `UPDATE voters SET email = ? WHERE id = ?`;
    const params = [req.body.email, req.params.id];
  
    db.query(sql, params, (err, result) => {
      if (err) {
        res.status(400).json({ error: err.message });
      } else if (!result.affectedRows) {
          // voter with id doesn't exist
        res.json({
          message: 'Voter not found'
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


// remove voters from the database.
router.delete('/voter/:id', (req, res) => {
    const sql = `DELETE FROM voters WHERE id = ?`;
  
    db.query(sql, req.params.id, (err, result) => {
      if (err) {
        res.status(400).json({ error: res.message });
      } else if (!result.affectedRows) {
        res.json({
          // voter with id doesn't exist
          message: 'Voter not found'
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



module.exports = router;