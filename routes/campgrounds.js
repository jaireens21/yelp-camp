const express=require('express');
const router= express.Router();

const maxSize= 2*1024*1024; //in bytes; max Image file size set to 2MB

const multer  = require('multer'); //for image uploads
const {storage} = require('../cloudinary');

const whitelist = [ //allowed formats of images
    'image/png',
    'image/jpeg',
    'image/jpg'
]

const upload = multer({  
    storage,  //upload to cloudinary

    limits: {fileSize: maxSize, files:3},  
    //limit to 3 image uploads at once, each limited to 2MB in size

    //checking is file extension is an allowed format
    fileFilter: (req, file, cb) => {
        if (!whitelist.includes(file.mimetype)){
          cb(null, false);
          return cb(new Error('Only .png, .jpg and .jpeg formats allowed!'));
        }
        else{
            cb(null, true);
        } 
    }
}); 

const campgrounds=require('../controllers/campgrounds') //requiring controllers

const catchAsync=require('../utils/catchAsync.js');

const {isLoggedIn, isAuthor, validateCampground}=require('../middleware.js'); //importing middleware 

//show list of all campgrounds
router.get('/', catchAsync(campgrounds.index)); //using controllers


//serve a form to add a new campground
router.get('/new', isLoggedIn, campgrounds.renderNewForm);
//isLoggedIn middleware will check if user is logged in before giving access to this route


//adding a new campground
router.post('/', isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground));
//validateCampground middleware added for server-side data validation 
//isLoggedIn middleware will check if user is logged in before giving access to this route even through postman



//serve a form to edit
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    //show details of a campground

    .put( isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    //edit a campground
    //validateCampground middleware added for server-side data validation 

    .delete( isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))
    //delete a campground
    //now use mongoose middleware (in models/campground.js) to delete associated reviews 


module.exports=router;