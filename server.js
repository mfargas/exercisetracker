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
app.post('/api/users/:_id/exercises', async (req, res, next) => {
  const userID = req.params._id || req.body._id
  const todaysDate = new Date()
  const yyyy = todaysDate.getFullYear()
  const m = todaysDate.getMonth() +1
  const d = todaysDate.getDate()
  const dateStr = yyyy + "-" + (m <= 9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d)
  const datePart = req.body.date ? new Date(req.body.date).toDateString() : new Date(dateStr).toDateString
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

// TEST CASES

// The response returned from POST / api / users /: _id / exercises will be the user object with the exercise fields added


// A GET request to / api / users /: id / logs will return the user object with a log array of all the exercises added.


// The description property of any object in the log array that is returned from GET / api / users /: id / logs should be a string.


// The duration property of any object in the log array that is returned from GET / api / users /: id / logs should be a number.


// The date property of any object in the log array that is returned from GET / api / users /: id / logs should be a string..
// Use the dateString format of the Date API.










// You can add from, to and limit parameters to a GET / api / users /: _id / logs request to retrieve part of the log of 
// any user.from and to are dates in yyyy - mm - dd format.limit is an integer of how many logs to send back


// const { description, duration } = req.body
// const idParam = { "id": req.params._id }
// const userId = idParam.id
// const date = req.body.date === '' || req.body.date === undefined ? new Date().toDateString() : new Date(req.body.date).toDateString()
// User.findById(userId).exec().then(userData => {
//   if (!userData) {
//     res.send('Unknown userId')
//     console.log(userData)
//   } else {
//     const newExercise = new Exercise({
//       userID: userId,
//       description,
//       duration,
//       date: new Date(date).toDateString(),
//     })
//     console.log(newExercise)
//     newExercise.save().then(data => {
//       const { description, duration, date } = data
//       console.log(userData)
//       let resObj = {}
//       resObj['username'] = userData.username
//       resObj['description'] = description
//       resObj['duration'] = duration
//       resObj['date'] = date
//       resObj['id'] = userId
//       let l = userData.exercises.push(resObj)
//       userData.save().then(userData => {
//         res.status(200).send({
//           username: userData.username,
//           userID: userId,
//           exercise: newExercise
//         })
//       })
//     })
//   }
// })



// const { from, to, limit } = req.query
// const idParam = { "id": req.params._id }
// const idSearch = idParam.id

// User.findById(idSearch, (err, user) => {
//   if (err || !user) {
//     console.log(err)
//     res.json({ username: null, count: 0, log: [] })
//   } else {
//     console.log(user)
//     let filter = {
//       userId: idSearch
//     }
//     let dateObj = {};
//     if (from) {
//       dateObj["$gte"] = new Date(from).toDateString()
//     }
//     if (to) {
//       dateObj["$lte"] = new Date(to).toDateString()
//     }
//     if (from || to) {
//       filter.date = dateObj
//     }
//     let validLimit = limit ?? 100
//     User.Exercise.find(filter).limit(+validLimit).exec((err, docs) => {
//       if (err) {
//         console.log(err)
//       } else if (!docs) {
//         res.json({
//           "userId": userId,
//           "username": user.username,
//           "count": 0,
//           "log": []
//         })
//       } else {
//         console.log(docs)
//         const docData = docs
//         let count = docs.length
//         const { username, _id } = user
//         const log = docData.map((item) => {
//           itemDate = new Date(item.date).toDateString()
//           return ({
//             description: item.description,
//             duration: item.duration,
//             date: itemDate
//           })
//         })
//         console.log(log)
//         res.send({ user: { username, count, _id, log } })
//       }
//     })
//   }
// })