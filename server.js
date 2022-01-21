// for mopre info see google docs, MySQL - notes
// Full setup for project using MySQL, MySQL2, Express
const express = require('express');

// local module, creates connection to MySQL database
const db = require('./db/connection');

// our module made for checking if a candidate can be posted
// to the database by making sure all of the candidate's fields are
// filled out by the user.
const inputCheck = require('./utils/inputCheck');

// automatically routes to apiRoutes/index.js module.
// Node.js will automatically look for index.js when requiring the directory.
const apiRoutes = require('./routes/apiRoutes');

const PORT = process.env.PORT || 3001;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// automatically adds api/ in front of any api endpoint routes.
// and uses all endpoints from the index file on the server.
app.use('/api', apiRoutes);



// Default response for any other request (Not Found)
app.use((req, res) => {
    res.status(404).end();
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});