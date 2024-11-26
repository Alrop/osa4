const blogsRouter = require("express").Router()
const Blog = require("../models/blog")
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const userExtractor = require("../utils/middleware").userExtractor


blogsRouter.get('/', async (req, res) => {
    const blogs = await Blog.find({}).populate("user", { username: 1, name: 1, id: 1 })
    res.json(blogs)
})

blogsRouter.post('/', userExtractor, async (req, res, next) => {
    const body = req.body
    const user = req.user
    const newBlog = new Blog({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes,
        user: user._id
    })
    const savedBlog = await newBlog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()
    res.status(201).json(savedBlog)
})

blogsRouter.get('/:id', async (req, res, next) => {
    const blog = await Blog.findById(req.params.id)
    if (blog) {
        res.json(blog)
    } else {
        res.status(404).end()
    }
})

blogsRouter.put('/:id', async (req, res, next) => {
    const body = req.body
    const blog = ({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes,
    })
    const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, blog, { new: true })
    res.json(updatedBlog)
})


blogsRouter.delete('/:id', userExtractor, async (req, res, next) => {
    console.log("Start of Del")
    const user = req.user
    const blog = await Blog.findById(req.params.id)
    if (user.id === blog.user.toString()) {
        await Blog.findByIdAndDelete(req.params.id)
        res.status(204).end()
    } else {
        return res.status(401).json({
            error: "Not authorized to del"
        })
    }
})


module.exports = blogsRouter 