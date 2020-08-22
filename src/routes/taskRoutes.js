const express = require('express')
const router = express.Router()

const Task = require('../models/task')
const auth = require('../middlewares/auth')

router.post('/tasks', auth, async (req, res) => {
  const task = new Task({
    ...req.body,
    owner: req.user._id
  })
  try {
    const data = await task.save()
    res.send(data)
  } catch (err) {
    res.status(400).send(err)
  }
})

router.get('/tasks', auth, async (req, res) => {
  const match = {}
  let sort = {}
  if (req.query.completed) {
    match.completed = req.query.completed === 'true'
  }

  if (req.query.sort) {
    const parts = req.query.sort.split(':')
    sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
  }

  try {
    await req.user.populate({
      path: 'tasks',
      match,
      options: {
        limit: parseInt(req.query.limit), // 结果的数量限制
        skip: parseInt(req.query.skip), // 跳过多少条记录，从哪里开始返回数据
        sort
      }
    }).execPopulate()
    res.send(req.user.tasks)
  } catch (error) {
    res.status(500).send()
  }
})

router.get('/tasks/:id', auth, async (req, res) => {
  try {
    const _id = req.params.id
    const task = await Task.findOne({ _id, owner: req.user._id })
    if (!task) {
      res.status(404).send()
    } else {
      res.send(task)
    }
  } catch (error) {
    res.status(500).send()
  }
})

router.patch('/tasks/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ['description', 'completed']
  const isValidOperation = updates.every(update => allowedUpdates.includes(update))

  if (!isValidOperation) {
    return res.status(500).send('Invalid updates.')
  }

  try {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })

    if (!task) {
      return res.status(404).send()
    }
    updates.forEach(update => task[update] = req.body[update])
    await task.save()

    res.send(task)
  } catch (error) {
    res.status(500).send()
  }
})

router.delete('/tasks/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
    if (!task) {
      res.status(404).send()
    } else {
      res.send(task)
    }
  } catch (error) {
    res.status(500).send()
  }
})

module.exports = router