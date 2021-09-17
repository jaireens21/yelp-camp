const Campground = require("./models/campground");
const Review = require("./models/review");
const ExpressError=require('./utils/ExpressError.js');
const {campgroundSchema, reviewSchema}=require('./schemas.js'); //importing the joi schema for data validation


//middleware to check if user is logged in before giving access to protected routes of campgrounds & reviews
module.exports.isLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){   //isAuthenticated is a passport method
        
        req.session.returnTo= req.originalUrl;
        //store the address where the user was trying to go to before we stopped them to authenticate by adding a returnTo to the session

        req.flash('error', 'You must be logged in!');
        return res.redirect('/login');
    }
  next();
}


//middleware to authorize access to only author of campground
module.exports.isAuthor= async(req,res,next)=>{
  const {id}= req.params;
  const campground= await Campground.findById(id);
  if (!campground.author.equals(req.user._id))
  {
    req.flash('error', 'You do not have permission to do that!');
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
}

//middleware to authorize access to only author of review
module.exports.isReviewAuthor= async(req,res,next)=>{
  const{id, reviewId}= req.params;
  const review= await Review.findById(reviewId);
  if (!review.author.equals(req.user._id))
  {
    req.flash('error', 'You do not have permission to do that!');
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
}

//middleware for data validation of reviews using Joi
module.exports.validateReview=(req,res,next)=>{
  const {error}=reviewSchema.validate(req.body);
  if(error) {
      const msg= error.details.map(el=>el.message).join(',');
      throw new ExpressError(msg, 400);
  } else next();
}



//middleware for data validation of campgrounds via joi
module.exports.validateCampground= (req,res,next)=>{
    //using joi schema for data validation
  const {error} =campgroundSchema.validate(req.body);
  if(error){
      const msg=error.details.map(el=>el.message).join(',');
      //join all error messages together
      throw new ExpressError(msg, 400);
  }
  else next(); //if there is no error, go to next routehandler
}