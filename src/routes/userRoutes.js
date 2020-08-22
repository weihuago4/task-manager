const express = require('express')
const router = express.Router()
const auth = require('../middlewares/auth')
const multer = require('multer') // 文件上传中间件，仅支持mutiple-form

const User = require('../models/user')

router.post('/users', async (req, res) => {
  let user = new User(req.body)
  try {
    user = await user.save()
    const token = await user.generateToken()
    res.send({ user, token })
  } catch (err) {
    res.status(400).send(err)
  }
})

router.get('/users', async (req, res) => {
  try {
    const users = await User.find({})
    res.send(users)
  } catch (err) {
    res.status(500).send()
  }
})

router.get('/users/me', auth, async (req, res) => {
  try {
    res.send(req.user)
  } catch (e) {
    res.status(500).send()
  }
})

router.get('/users/:id', async (req, res) => {
  const _id = req.params.id
  try {
    const user = await User.findById(_id)
    if (!user) {
      res.status(404).send()
    } else {
      res.send(user)
    }
  } catch (err) {
    res.status(500).send()
  }
})

router.patch('/users/me', auth, async (req, res) => {
  const udpates = Object.keys(req.body)
  const allowedUpates = ['name', 'age', 'email', 'password']
  const isValidOperation = udpates.every(update => allowedUpates.includes(update))

  if (!isValidOperation) {
    return res.status(500).send('Invalid udpates.')
  }

  try {
    const user = req.user
    udpates.forEach(update => user[update] = req.body[update])
    await user.save()

    res.send(user)
  } catch (error) {
    res.status(500).send()
  }
})

router.delete('/users/me', auth, async (req, res) => {
  try {
    await req.user.remove()
    res.send(req.user)
  } catch (error) {
    res.status(500).send()
  }
})

router.post('/users/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password)
    const token = await user.generateToken()
    res.send({ user, token })
  } catch (error) {
    console.log(error)
    res.status(500).send(error)
  }
})

router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(token => {
      return token.token != req.token
    })
    await req.user.save()
    res.send('Logout success.')
  } catch (error) {
    console.log(error)
    res.status(500).send()
  }
})

router.post('/users/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = []
    await req.user.save()
    res.send('LogoutAll success.')
  } catch (error) {
    res.status(500).send()
  }
})

const upload = multer({
  // dest: 'avatars', // 文件上传目录，取消后可通过req.file访问
  limits: {
    fileSize: 1000000
  },
  fileFilter (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('File type mismatch.'))
    }
    cb(undefined, true)
  }
})


router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
  req.user.avatar = req.file.buffer
  await req.user.save()
  res.send('Upload Success.')
}, (error, req, res, next) => {
  res.status(500).send(error.message)
})

router.delete('/users/me/avatar', auth, async (req, res) => {
  try {
    req.user.avatar = undefined
    await req.user.save()
    res.send('Delete User Avatar Success.')
  } catch (error) {
    res.status(500).send()
  }
})

router.get('/users/:id/avatar', async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user || !user.avatar) {
    return res.status(404).send('Get User Avatar Error.')
  }

  res.set('Content-Type', 'image/jpg')
  res.send(user.avatar)
})


module.exports = router