const mongoose = require('mongoose')
require('dotenv').config()

const url = process.env.MONGODB_URI
mongoose.connect(url)


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Enter a valid username"],
        unique: true,
        minlength: [3, "Username needs to be at least 3 characters"]
    },
    name: String,
    passwordHash: String,
    blogs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Blog',
        },
    ],
});

userSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
        delete returnedObject.passwordHash;
    },
});


module.exports = mongoose.model("User", userSchema)