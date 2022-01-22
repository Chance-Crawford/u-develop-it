-- whenever we run the schema script all tables 
-- will be dropped if they previously already existed.
-- basically like a refresh everytime you run, source db/schema.sql
-- the order which you drop tables is very important if tables
-- have foreign keys or are dependent on other tables.
DROP TABLE IF EXISTS votes;
DROP TABLE IF EXISTS candidates;
DROP TABLE IF EXISTS parties;
DROP TABLE IF EXISTS voters;

-- creates a table in the MySQL database
CREATE TABLE parties (
  -- creates a field for the rows in the parties table, with the name id.
  -- the data type of the row will be an integer.
  -- this row will auto increment which means that every time a new
  -- row is added, the id number will automatically increase by 1.
  -- since the field auto increments, a value is not assigned to the id field
  -- in seeds.sql.
  -- we are marking the id as the primary key which means that the id
  -- field will be the only field that will uniquely identify each party.
  -- only one field in a table can be labeled as a primary key.
  id INTEGER AUTO_INCREMENT PRIMARY KEY,
  -- name field for rows, string with a maximum of 50 characters, can not be null or else
  -- an error will be thrown
  name VARCHAR(50) NOT NULL,
  -- dewscription field for rows, a string of any length. Best to use varchar when you
  -- can in order to save storage.
  description TEXT
);

CREATE TABLE candidates (
  id INTEGER AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(30) NOT NULL,
  last_name VARCHAR(30) NOT NULL,
  party_id INTEGER,
  industry_connected BOOLEAN NOT NULL,
  -- see MySQL - notes, update data in table
  -- tells sql that the party_id row in the candidates table is a FOREIGN KEY
  -- which means a key that references the id of the "parties" table.
  -- if the row in the parties table that the id was referencing is deleted at asome point,
  -- then set the candidate's party_id to NULL.
  CONSTRAINT fk_party FOREIGN KEY (party_id) REFERENCES parties(id) ON DELETE SET NULL
);

CREATE TABLE voters (
  id INTEGER AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(30) NOT NULL,
  last_name VARCHAR(30) NOT NULL,
  email VARCHAR(50) NOT NULL,
  -- capture the date and time when the voter registered.
  -- DATETIME data type.
  -- DEFAULT: If you don't specify NOT NULL, then a field could 
  -- potentially be NULL if that value isn't provided in an INSERT 
  -- statement. With DEFAULT, however, you can specify what the value 
  -- should be if no value is provided.
  -- CURRENT_TIMESTAMP: This will return the current date and time in the same 
  -- 2020-01-01 13:00:00 format. Note that the time will be based on what time 
  -- it is according to your server, not the client's machine.
  -- So, in our code we're specifying CURRENT_TIMESTAMP as the value for DEFAULT.
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- What's the benefit of having a separate table to track votes, though? 
-- It does two things for us:
-- It keeps the candidate and voter data clean by not cluttering up 
-- their tables with vote information.
-- It makes it easier to hold other elections later on. For instance, 
-- you could simply reset the votes table, or keep that history and 
-- track multiple elections by the dates on which the votes were cast.
CREATE TABLE votes (
  id INTEGER AUTO_INCREMENT PRIMARY KEY,
  voter_id INTEGER NOT NULL,
  candidate_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  -- This new votes table accommodates everything we need, but we should 
  -- think about potential problems that might arise. For instance, a voter 
  -- isn't allowed to vote twice, so the table should prevent duplicate records. 
  -- Also, what happens to a vote if the relevant candidate or voter is removed 
  -- from the database? We should probably remove the vote as well!
  -- uc_voter, signifies that the values inserted into the voter_id field must 
  -- be unique. For example, whoever has a voter_id of 1 can only appear in this table once.
  CONSTRAINT uc_voter UNIQUE (voter_id),
  -- The next two constraints are foreign key constraints, which you've seen before. 
  -- it establishes a field in this table as a reference to the id primary key of
  -- another table.
  -- The difference now is the ON DELETE CASCADE statement. Previously, ON DELETE SET 
  -- NULL would set the record's field to NULL if the key from the reference table was 
  -- deleted. With ON DELETE CASCADE, deleting the reference key will also delete the 
  -- entire row from this table.
  -- meaning if voter 1 is deleted from its original table (voter). Voter 1's entire vote
  -- (which is a row in this vote table) will be deleted too.
  -- so their vote will no longer exist in the database
  CONSTRAINT fk_voter FOREIGN KEY (voter_id) REFERENCES voters(id) ON DELETE CASCADE,
  -- if candidate 1 is deleted from its original table (candidate). 
  -- any votes (which is a row in this vote table)
  -- tthat voted for candidate 1 will be deleted as well.
  -- so the votes will no longer exist in the database
  CONSTRAINT fk_candidate FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
);