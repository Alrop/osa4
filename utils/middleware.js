const logger = require('./logger')
const User = require('../models/user');
const jwt = require('jsonwebtoken')


const requestLogger = (req, res, next) => {
    // logger.info('Method:', req.method)
    // logger.info('Path:  ', req.path)
    // logger.info('Body:  ', req.body)
    // logger.info('---')
    next()
}

const unknownEndpoint = (req, res) => {
    res.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, req, res, next,) => {
    logger.error(error.message)

    if (error.name === 'CastError') {
        return res.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return res.status(400).json({ error: error.message })
    } else if (error.name === 'MongoServerError' && error.message.includes('E11000 duplicate key error')) {
        return res.status(400).json({ error: 'expected `username` to be unique' })
    } else if (error.name === 'JsonWebTokenError') {
        return res.status(400).json({ error: 'token missing or invalid' })
    } else if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'token expired' })
    }
    next(error)
}

const tokenExtractor = (req, res, next) => {
    const authorization = req.get("authorization")

    if (authorization && authorization.startsWith("Bearer ")) {
        req.token = authorization.replace("Bearer ", "")
    } else {
        console.log("Token failed in middleware")
        req.token = null
    }
    next()
}

const userExtractor = async (req, res, next) => {
    const authorization = req.get("authorization")
    let decodedToken
    // console.log("userExtractor says: ", authorization)
    if (authorization && authorization.startsWith("Bearer ")) {
        const token = authorization.replace("Bearer ", "")
        decodedToken = jwt.verify(token, process.env.SECRET)
        // console.log(req.token);
    } else {
        console.log("User failed in middleware")
    }
    if (!decodedToken || !req.token) {
        return res.status(401).json({ error: 'token invalid' })
    }
    req.user = await User.findById(decodedToken.id)
    if (!req.user) {
        console.log("userExtractor can't find user")
        return res.status(418).json({ error: "User not found" })
    }
    next()
}


module.exports = {
    requestLogger,
    unknownEndpoint,
    errorHandler,
    tokenExtractor,
    userExtractor
}