const mongoose = require('mongoose');
const {User} = require('./userSchema');

const addNewUser = async (newUserName)=>{
    try{
        const newUser = new User({ username: newUserName})
        const saveNewUser = await newUser.save()
        return saveNewUser
    } catch (err) {
        throw new Error('User could not be saved :(')
    }
}

const getAllUsers = async () => {
    try{
        const allUsers = await User.find()
        return allUsers
    } catch(err){
        throw new Error('Cannot retrieve users')
    }
}

const findAndUpdateUser = async (userId, objWNewProps) => {
    try{
        const updatedUser = await User.findByIdAndUpdate(userId, 
            {
                $push: {exercises: objWNewProps}
            },
            {new: true}
        )
        const obj = {
            username: updatedUser.username,
            description: objWNewProps.description,
            duration: objWNewProps.duration,
            _id: userId,
            date: objWNewProps.date
        }
        return obj
    } catch (err){
        console.error(err)
        throw new Error('Cannot update user')
    }
}

const addNewExercise = async (exerciseDetails) => {
    try{
        const objWNewProps = {
            description: exerciseDetails.description,
            duration: exerciseDetails.duration,
            date: exerciseDetails.date.toDateString()
        }
        const updatedUser = await findAndUpdateUser(exerciseDetails.id, objWNewProps)
        if(updatedUser){
            const obj = {
                username: updatedUser.username,
                _id: updatedUser._id,
                description: updatedUser.description,
                duration: updatedUser.duration,
                date: new Date(exerciseDetails.date).toDateString()
            }
            return obj
        }else{
            return null
        }
    }catch(err){
        console.log(err)
        throw new Error('Could not add exercise')
    }
}

const fetchExercises = async (objRequest) => {
    try{
        const currentUser = await User.findById(objRequest.userId)
        let allExercises = null
        if(currentUser && currentUser.exercises){
            allExercises = currentUser.exercises
        }else{
            console.log(currentUser)
            return null
        }

        if(objRequest.fromDate && allExercises && allExercises.length > 0){
            allExercises = allExercises.reduce( (filtered, exercise) => {
                const fromDateParams = new Date(objRequest.fromDate).getTime
                const dateRetrieved = new Date(exercise.date).getTime
                if(dateRetrieved >= fromDateParams){
                    filtered.push(exercise)
                }
                return filtered
            }, [])
        }

        if (objRequest.toDate && allExercises && allExercises.length > 0) {
            allExercises = allExercises.reduce((filtered, exercise) => {
                const toDateParams = new Date(objRequest.toDate).getTime
                const dateRetrieved = new Date(exercise.date).getTime
                if (dateRetrieved <= toDateParams) {
                    filtered.push(exercise)
                }
                return filtered
            }, [])
        }

        if (allExercises && allExercises.length > 0) {
            allExercises = allExercises.map(exercise => ({
                description: exercise.description,
                duration: exercise.duration,
                date: exercise.date
            }))
        }

        if(objRequest.limit && allExercises && allExercises.length > 0){
            allExercises = allExercises.slice(0, objRequest.limit)
        }

        const exerciseLogCurrentUser = {
            username: currentUser.username,
            count: allExercises.length,
            _id: objRequest.userId,
            log: allExercises
        }

        return exerciseLogCurrentUser
    }catch(err){
        console.log(err)
        throw new Error('Cannot....')
    }
}

module.exports = { addNewUser, getAllUsers, addNewExercise, fetchExercises }