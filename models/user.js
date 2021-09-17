const mongoose = require('mongoose');
const passportLocalMongoose= require('passport-local-mongoose');

const Schema= mongoose.Schema; //shortcut to call mongoose.Schema

const userSchema= new Schema({
    email:{
        type: String,
        required: true,
        unique: true
    }
});

userSchema.plugin(passportLocalMongoose);  //plugging in passport-local-mongoose, will auto create username, password, salt


module.exports= mongoose.model('User', userSchema);