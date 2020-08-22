const mongoose = require('mongoose')

const taskScheme = mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // 相关的表
    requried: true
  }
}, {
  timestamps: true
})

const Task = mongoose.model('Task', taskScheme)

module.exports = Task