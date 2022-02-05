require('dotenv').config()
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const User = require('./js/userSchema')
const { addNewUser, getAllUsers, addNewExercise, fetchExercises} = require('./js/fun')
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
app.post('/api/users', async (req, res, next) => {
  const userName = req.body.username;
  if(!userName || userName === 0 ){
    return res.json({error: 'Invalid username'})
  } else {
    try{
      const newUser = await addNewUser(userName);
      console.log(newUser)
      res.json({
        username: newUser.username,
        _id: newUser._id
      })
    } catch(err){
      console.error(err)
    }
  }
})

// get list of all users
app.get('/api/users', async(req, res, next) => {
  const users = await getAllUsers()
  res.json(users)
})

// form data, if no date is supplied, use todays date
// res will be user object w the exercise fields added
app.post('/api/users/:_id/exercises', bodyParser.urlencoded({ extended: false }), async (req, res, next) => {
  const userID = req.params._id || req.body._id
  const todaysDate = new Date()
  const yyyy = todaysDate.getFullYear()
  const m = todaysDate.getMonth() +1
  const d = todaysDate.getDate()
  const dateStr = yyyy + "-" + (m <= 9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d)
  const datePart = req.body.date === '' || req.body.date === undefined ? new Date(dateStr).toDateString() : new Date(req.body.date).toDateString()
  // const datePart = req.body.date ? new Date(req.body.date).toDateString() : new Date(dateStr).toDateString()
  // const date = req.body.date === '' || req.body.date === undefined ? new Date().toDateString() : new Date(req.body.date).toDateString()
  try{
    const addNE = await addNewExercise(
      {
        id: userID,
        description: req.body.description,
        duration: +req.body.duration,
        date: datePart
      }
    )
    if(addNE){
      res.json({ ...addNE })
    } else{
      console.log(addNE)
      res.end()
    }
  }catch(err){
    console.log(err)
    throw new Error('Could not add exercise')
  }
})

//retrieve a full exercise log of any user
//return a user oject w a count prop representing the # of exercises logged to the user
app.get('/api/users/:_id/logs', async (req, res, next) => {
  const userId = req.params["_id"];
  const { from, to, limit } = req.query;
  const obj = {
    userId: userId,
    fromDate: from,
    toDate: to,
    limit: limit
  }
  try{
    const exerciseLog = await fetchExercises(obj)
    if(exerciseLog){
      res.json(exerciseLog)
    } else{
      console.log(exerciseLog)
      res.end()
    }
  } catch(err){
    console.log(err)
    throw new Error('Could not.....')
  }
})

//return the user object with the log array of all the exercises added

const listener = app.listen(process.env.PORT || 4500, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

// TEST CASES LEFT

// The date property of any object in the log array that is returned from GET / api / users /: id / logs should be a string..
// Use the dateString format of the Date API.