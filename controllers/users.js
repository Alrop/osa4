const usersRouter = require('express').Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')



usersRouter.get('/', async (req, res) => {
    const users = await User.find({}).populate("blogs", { url: 1, title: 1 })
    res.json(users);
})


usersRouter.post('/', async (req, res, next) => {
    const body = req.body
    if (body.password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" })
    }
    const passwordHash = await bcrypt.hash(body.password, 10)
    const user = new User({
        username: body.username,
        name: body.name,
        passwordHash,
    })
    const savedUser = await user.save()
    res.status(201).json(savedUser)
})

// usersRouter.get('/:id', async (req, res, next) => {
//     const user = await User.findById(req.params.id).populate('blogs', { title: 1, author: 1, url: 1, likes: 1 });
//     if (user) {
//         res.json(user);
//     } else {
//         res.status(404).end();
//     }
// });

module.exports = usersRouter 
