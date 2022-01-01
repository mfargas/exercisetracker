require('dotenv').config()
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const User = require('./models/user.model')
const Exercise = require('./models/exercise.model')
const { Schema } = require("mongoose")
const mongoose = require('mongoose')

app.use(cors())

mongoose.connect(process.env.DB)

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
})

// post with form data username, create new user
app.post('/api/users', (req, res) => {
  const newUser = new User({ username: req.body.username })
  newUser.save((err, data)=>{
    if(err){
      console.log(err)
      res.send('Username taken')
    }else{
      console.log(data)
      res.json({ username: data.username, _id: data.id })
    }
  })
})

// form data, if no date is supplied, use todays date
// res will be user object w the exercise fields added
app.post('/api/users/:_id/exercises', (req, res) => {
  const { _id, username, description, duration, date } = req.body
  if (!date) date = new Date()
  User.find(_id, (err, data) => {
    console.log(data)
    if(!data) {
      res.send('Unknown username')
    } else {
      const username = data.username
      const newExercise = new Exercise({ _id, description, duration, date })
      newExercise.save((err, data) => {
        res.json({ _id, username, description, duration, date })
      })
  }})
})

// get list of all users
app.get('/api/users', (req, res) => {

  res.json({ Users })
})

//retrieve a full exercise log of any user
//return a user oject w a count prop representing the # of exercises logged to the user
app.get('/api/users/:_id/logs', (req, res) => {
  const { username } = req.query;
  res.json({ user: username, count: 1})
})

//return the user object with the log array of all the exercises added
app.get('/api/users/:id/logs', (req, res) => {
  const { username, description, duration, date } = req.body
  res.json({ user: username, exercises: {description, duration, date} })
})

const listener = app.listen(process.env.PORT || 4500, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})


// TEST CASES

// You can POST to / api / users with form data username to create a new user.


// The returned response from POST / api / users with form data username will be an object with username and _id properties.


// You can make a GET request to / api / users to get a list of all users.


// The GET request to / api / users returns an array.


// Each element in the array returned from GET / api / users is an object literal containing a user's username and _id.


// You can POST to / api / users /: _id / exercises with form data description, duration, and optionally date.
// If no date is supplied, the current date will be used.


// The response returned from POST / api / users /: _id / exercises will be the user object with the exercise fields added.


// You can make a GET request to / api / users /: _id / logs to retrieve a full exercise log of any user.


// A request to a user's log GET /api/users/:_id/logs returns a user object with a count property representing the number 
// of exercises that belong to that user.


// A GET request to / api / users /: id / logs will return the user object with a log array of all the exercises added.


// Each item in the log array that is returned from GET / api / users /: id / logs is an object that should have a description, 
// duration, and date properties.


// The description property of any object in the log array that is returned from GET / api / users /: id / logs should be a string.


// The duration property of any object in the log array that is returned from GET / api / users /: id / logs should be a number.


// The date property of any object in the log array that is returned from GET / api / users /: id / logs should be a string..
// Use the dateString format of the Date API.


// You can add from, to and limit parameters to a GET / api / users /: _id / logs request to retrieve part of the log of 
// any user.from and to are dates in yyyy - mm - dd format.limit is an integer of how many logs to send back.
