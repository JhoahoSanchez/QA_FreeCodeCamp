'use strict';
require('dotenv').config();
const express = require('express');
const myDB = require('./connection');
const fccTesting = require('./freeCodeCamp/fcctesting.js');
const LocalStrategy = require('passport-local');

const app = express();

const passport= require('passport');
const session= require('express-session');

const { ObjectID }= require('mongodb');

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.set('view engine', 'pug');
app.set('views', './views/pug');

app.use(passport.initialize());
app.use(passport.session());


myDB(async client => {
  const myDataBase = await client.db('database').collection('users');

  // Be sure to change the title
  app.route('/').get((req, res) => {
    // Change the response to render the Pug template
    res.render('index', {
      title: 'Connected to Database',
      message: 'Please login',
      'showLogin': true
    });
  });

   app.post('/login', passport.authenticate('local', { failureRedirect: '/'}), (req, res)=> {
    res.redirect('/profile');
   res.render('profile.pug');

    });

  // Serialization and deserialization here...

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser((id, done) => {
     myDataBase.findOne({ _id: new ObjectID(id) }, (err, doc) => {

    done(null, doc);
    });
  });

  // Be sure to add this...
}).catch(e => {
  console.log('unable to CONNECT')
  app.route('/').get((req, res) => {
    res.render('title', { title: e, message: 'Unable to connect to database' });
  });
});
// app.listen out here...

passport.use(new LocalStrategy((username, password, done) => {
  myDataBase.findOne({ username: username }, (err, user) => {
    console.log(`User ${username} attempted to log in.`);
    if (err) return done(err);
    if (!user) return done(null, false);
    if (password !== user.password) return done(null, false);
    return done(null, user);
  });
}));



fccTesting(app); //For FCC testing purposes
app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Listening on port ' + PORT);
});