require('dotenv').config()
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const User = require('./models/user.model')
const Exercise = require('./models/exercise.model')
const { Schema } = require('mongoose')
const mongoose = require('mongoose')

app.use(cors())

mongoose.connect(process.env.DB, {useNewUrlParser: true, useUnifiedTopology: true}, () =>{
  console.log('Successfully connected to DB')
})

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
      res.json(data)
    }
  })
})

// form data, if no date is supplied, use todays date
// res will be user object w the exercise fields added
app.post('/api/users/:_id/exercises', (req, res) => {
  const { description, duration } = req.body
  const idParam = { "id": req.params._id }
  const userId = idParam.id
  const date = req.body.date === '' || req.body.date === undefined ? new Date().toDateString() : new Date(req.body.date).toDateString()
  User.findById(userId,(err, userData) => {
    if (err || !userData) {
      res.send('Unknown userId')
      console.log(err)
      console.log(userData)
    } else {
      const newExercise = new Exercise({
        userID: userId, 
        description,
        duration, 
        date: new Date(date).toDateString(), 
      })
      console.log(newExercise)
      newExercise.save((err, data) => {
        if(err){
          console.log(err)
        } else {
          const { description, duration, date } = data
          console.log(userData)
          res.send({
            user:{
              username: userData.username,
              userID: userId,
              exercise: [{
                description,
                duration,
                date
              }]
            }
          })
          // res.json({
          //   username: userData.username,
          //   description,
          //   duration,
          //   date,
          //   userID: userId
          // })
        }
      })
  }})
})

// get list of all users
app.get('/api/users', async(req, res) => {
  const users = await User.find().select('_id username')
  res.json((users))
})

//retrieve a full exercise log of any user
//return a user oject w a count prop representing the # of exercises logged to the user
app.get('/api/users/:_id/logs', (req, res) => {
  const { from, to, limit } = req.query
  const {_id} = req.params
  User.findById(_id, (err, user) => {
    if (err || !user) {
      console.log(err)
      res.json({ username: null, count: 0, log: [] })
    } else {
      console.log(user)
      let filter = {
        userId: user.id
      }
      let dateObj = {};
      if (from) {
        dateObj["$gte"] = new Date(from).toDateString()
      }
      if (to) {
        dateObj["$lte"] = new Date(to).toDateString()
      }
      if (from || to) {
        filter.date = dateObj
      }
      let validLimit = limit ?? 100
      Exercise.find((filter)).limit(+validLimit).exec((err, docs) => {
        let log = [];
        if (err) {
          console.log(err)
        } else if (!docs) {
          res.json({
            "userId": userId,
            "username": user.username,
            "count": 0,
            "log": []
          })
        } else {
          console.log(docs)
          const docData = docs
          let count = docs.length
          const { username, _id } = user
          const log = docData.map((item) => {
            itemDate = new Date(item.date).toDateString()
            return ({
              description: item.description,
              duration: item.duration,
              date: itemDate
            })
          })
          console.log(log)
          res.send({ username, count, _id, log })
        }
      })
    }
  })
})

//return the user object with the log array of all the exercises added

const listener = app.listen(process.env.PORT || 4500, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

// TEST CASES

// The response returned from POST / api / users /: _id / exercises will be the user object with the exercise fields added


// A GET request to / api / users /: id / logs will return the user object with a log array of all the exercises added.


// The description property of any object in the log array that is returned from GET / api / users /: id / logs should be a string.


// The duration property of any object in the log array that is returned from GET / api / users /: id / logs should be a number.


// The date property of any object in the log array that is returned from GET / api / users /: id / logs should be a string..
// Use the dateString format of the Date API.


// You can add from, to and limit parameters to a GET / api / users /: _id / logs request to retrieve part of the log of 
// any user.from and to are dates in yyyy - mm - dd format.limit is an integer of how many logs to send back.
