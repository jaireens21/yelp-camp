//controller containg all the logic for review routes

const Campground=require('../models/campground');
const Review=require('../models/review.js');

module.exports.createReview= async(req,res)=>{
    const campground= await Campground.findById(req.params.id);
    const review= new Review(req.body.review);
    review.author=req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Successfully added new review!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteReview= async(req,res)=>{
    const{id, reviewId}= req.params;
    await Campground.findByIdAndUpdate(id, { $pull:{reviews: reviewId}});
    //The $pull operator removes from an existing array all instances of a value or values that match a specified condition.
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Review deleted!');
    res.redirect(`/campgrounds/${id}`);
}