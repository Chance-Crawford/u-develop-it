const express = require('express');
const router = express.Router();
const db = require('../../db/connection');
const inputCheck = require('../../utils/inputCheck');

// get endpoint that returns row objects which show the winners and amount of
// votes per candidate. votes were counted and sorted using the below sql command.
router.get('/vote', (req, res)=>{
    // see google docs, MySQL - notes, Write Query to Get Vote Totals.
    // gives a step by step guide of what this sql command means.
    const sql = `SELECT candidates.*, parties.name AS party_name, COUNT(candidate_id) AS count
                 FROM votes
                 LEFT JOIN candidates ON votes.candidate_id = candidates.id
                 LEFT JOIN parties ON candidates.party_id = parties.id
                 GROUP BY candidate_id ORDER BY count DESC;
                `

    db.query(sql, (err, rows)=>{
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({
            message: "success",
            data: rows
        })
    })
});


// given the id of the candidate and id of the voter from the front end,
// we are saving the vote to the database as a row in the "votes"
// table
router.post('/vote', ({ body }, res) => {
    // Data validation
    const errors = inputCheck(body, 'voter_id', 'candidate_id');
    if (errors) {
      res.status(400).json({ error: errors });
      return;
    }
  
    // saving row with info in database, votes table.
    const sql = `INSERT INTO votes (voter_id, candidate_id) VALUES (?,?)`;
    const params = [body.voter_id, body.candidate_id];
  
    db.query(sql, params, (err, result) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({
        message: 'success',
        data: body,
        changes: result.affectedRows
      });
    });
});


module.exports = router;