const express = require('express');
const app = express();
const { User } = require('./db');
const bcrypt = require('bcrypt');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const hashPassword = async (password, salt) => {
  const hash = await bcrypt.hash(password, salt);
  return hash;
}

app.get('/', async (req, res, next) => {
  try {
    res.send('<h1>Welcome to Loginopolis!</h1><p>Log in via POST /login or register via POST /register</p>');
  } catch (error) {
    console.error(error);
    next(error)
  }
});

// POST /register
// TODO - takes req.body of {username, password} and creates a new user with the hashed password
app.post('/register', async (req, res, next) => {
  try {
    let {username, password} = req.body;
    const hashedPw = await hashPassword(password, 10);
    let createdUser = await User.create({username, password: hashedPw});
    res.status(200).send(`successfully created user ${username}`);
  } catch (error) {
      console.error(error);
      next(error);
  }
})

// POST /login
// TODO - takes req.body of {username, password}, finds user by username, and compares the password with the hashed version from the DB
app.post('/login', async (req, res, next) => {
  try {
    let {username, password} = req.body;
    let foundUser = await User.findOne({where:{username}});
    if(foundUser){
      const isMatch = await bcrypt.compare(password, foundUser.password);
      if(isMatch) {
        res.status(200).send(`successfully logged in user ${username}`);
      } else {
        res.status(401).send('incorrect username or password')
      }
    }
  } catch (error) {
      console.error(error);
      next(error);
  }
})
// we export the app, not listening in here, so that we can run tests
module.exports = app;
