-- whenever we run the schema script all tables 
-- will be dropped if they previously already existed.
-- basically like a refresh everytime you run, source db/schema.sql
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