const express=require('express');
const router=express.Router({mergeParams: true}); //so we can access campground ID from req.params

const reviews=require('../controllers/reviews'); //getting the controller

const catchAsync=require('../utils/catchAsync.js');

const { isLoggedIn, isReviewAuthor, validateReview } = require('../middleware');


//leave a review
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview)); 
//using the reviews controller


//delete a review
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))


module.exports=router;