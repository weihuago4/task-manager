const express = require('express')
const app = express()
const userRouter = require('./routes/userRoutes')
const taskRouter = require('./routes/taskRoutes')
require('./db/mongoose')

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

module.exports = app
