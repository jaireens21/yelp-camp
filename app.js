if(process.env.NODE_ENV !== 'production'){  //if we are in development
    require('dotenv').config();  //will add details of .env file to process.env
}


const express= require('express');
const path= require('path');
const mongoose = require('mongoose');
const ejsMate= require('ejs-mate');
const methodOverride= require('method-override');
const session=require('express-session');
const flash=require('connect-flash');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoDBStore=require('connect-mongo'); //using MongoDB session store

const passport=require('passport');
const LocalStrategy= require('passport-local');
const User=require('./models/user'); //require the model with passport-local-mongoose plugged in
const ExpressError=require('./utils/ExpressError.js');
const campgroundRoutes=require('./routes/campgrounds'); //requiring the /campgrounds routes 
const reviewRoutes=require('./routes/reviews'); //requiring the reviews routes
const userRoutes=require('./routes/users');  //requiring the user login/register routes
const multer = require('multer');
const app= express();

// const dbUrl=process.env.DB_URL;
const dbUrl= 'mongodb://localhost:27017/yelp-camp'

mongoose.connect(dbUrl, {
    useNewUrlParser: true, 
    useUnifiedTopology: true 
})
.then(()=>{
    console.log('Database connected');  
})
.catch( (err)=>{
    console.log("connection error:");
    console.log(err);
})



app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,'public'))); //serving static pages from the public folder 

const sessionConfig={
    store:MongoDBStore.create({ //using mongoDB for session store
        mongoUrl:dbUrl, 
        touchAfter: 24*60*60, //Lazy session update , time in seconds
        
    }),         
    name:'bigbluesky',  //changing cookie name from connect.ssid
    secret: 'thisshouldbeabettersecret!', 
    resave:false, //don't save session if unmodified
    saveUninitialized: true,
    cookie:{
        httpOnly: true,         // a safety provision
        // secure: true,  //https only
        expires: Date.now() + (1000*60*60*24*7), //cookie will expire after a week (in milliseconds)
        maxAge: 1000*60*60*24*7
    }
}
app.use(session(sessionConfig));
app.use(flash());
app.use(mongoSanitize());//prevent mongo injection

app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net/",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.1.0/dist/css/bootstrap.min.css",
    
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://*.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ['blob:'],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dvhs0ay92/image/upload/", 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);



app.use(passport.initialize());  // to initialise passport
app.use(passport.session()); //to have persistent login sessions; must be after app.use(session)
passport.use(new LocalStrategy(User.authenticate()));
//.authenticate() is a static method on User, created automatically by passport-local-mongoose

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// use static serialize and deserialize methods (created on User model automatically by passport-local-mongoose) for passport session support


//middleware for flash, must come before all routes
app.use((req,res,next)=>{
    
    res.locals.currentUser=req.user; 
    //req.user is given by passport; it has username, _id, email of a logged in user
    //req.user will be undefined if user is not logged in 
    //currentUser is now available to all the ejs files under 'views'

    res.locals.success= req.flash('success');
    res.locals.error=req.flash('error');
    next();
})


app.use('/campgrounds', campgroundRoutes); //using the /campgrounds routes
app.use('/campgrounds/:id/reviews', reviewRoutes); //using the reviews routes
app.use('/', userRoutes); //using the user routes

app.get('/', (req,res)=>{
   res.render('home.ejs');
})


//custom error handler middleware
app.use((err, req, res, next)=>{
    const {statusCode=500} = err;   
    if(!err.message) 
        err.message='Oh No, something went wrong';
    if (err.code === 'LIMIT_FILE_SIZE')  //instanceof multer.MulterError
        {err.message = 'File Size is too large. Allowed file size is 2MB';}
    res.status(statusCode).render('error.ejs', {err});
})


//if address doesnt match any of the above routes
app.all('*', (req,res,next)=>{
    next(new ExpressError('Page Not Found', 404));
})
//There is a special routing method, app.all(), used to load middleware functions at a path for all HTTP request methods. 




app.listen(3010, ()=>{
    console.log('LISTENING ON PORT 3010');
})