//controller file with all the logic for campground routes

const Campground=require('../models/campground');

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding'); //for getting geocode for campground location
const mapboxToken= process.env.MAPBOX_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapboxToken});

const {cloudinary}= require("../cloudinary"); 

module.exports.index= async(req,res)=>{
let noMatch = false; let sstring="";
if (req.query.search) {
    sstring=req.query.search.replace(/[^a-zA-Z0-9 ]/g, "");
    Campground.find({}, function(err, campgrounds) {
      if (err) {
        console.log(err);
      } else {
            let regex=new RegExp(req.query.search, 'gi');
            let result = campgrounds.filter(place=> (place.title.match(regex)||place.location.match(regex)));
            
            if (result.length < 1) {
            noMatch = true;
            }
            
            res.render("campgrounds/index.ejs", {campgrounds: result, noMatch, sstring});
        }
    });
} else {
        Campground.find({}, function(err, campgrounds) {
          if (err) {
            console.log(err);
          } else {
              
            res.render("campgrounds/index.ejs", {campgrounds,noMatch,sstring});
          }
        });
    }
    // const campgrounds= await Campground.find({});
    // res.render('campgrounds/index.ejs', {campgrounds});
}

module.exports.renderNewForm= (req,res)=>{
    res.render('campgrounds/new.ejs');
}

module.exports.createCampground= async (req,res,next)=>{

    const geodata= await geocodingClient.forwardGeocode({
        query: req.body.campground.location,
        limit:1 //no. of results
    }).send()
    //res.send(geodata.body.features[0].geometry); gives a geoJSON
    
    const campground= new Campground(req.body.campground);
    campground.geometry= geodata.body.features[0].geometry; //saving location coordinates to campground
    campground.images= req.files.map( f=>( {url:f.path, filename:f.filename}) ); //uploaded images' details (available on req.files thanks to multer) being added to campground
    campground.author=req.user._id;
    await campground.save();
    req.flash('success', 'Successfully made a new campground!');// a flash
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.renderEditForm= async (req,res)=>{
    const campground= await Campground.findById(req.params.id);
    if(!campground) {
     req.flash('error', 'Campground not found!');
     res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', {campground});
}

module.exports.updateCampground= async(req,res)=>{
    const campground= await Campground.findByIdAndUpdate(req.params.id, {...req.body.campground}, {runValidators:true});

    const geodata= await geocodingClient.forwardGeocode({
        query: req.body.campground.location,
        limit:1 //no. of results
    }).send()
    campground.geometry= geodata.body.features[0].geometry; 
    const imgs= req.files.map( f=>({url:f.path, filename:f.filename})); //this is an array of objects
    campground.images.push(...imgs); //push 1 element of the array at a time
    await campground.save();

    //removing selected images from campground, filenames of images avbl on req.body.deleteImages[]
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename); //delete image file on cloudinary
        }
        await campground.updateOne( {$pull: {images: {filename: {$in: req.body.deleteImages}}}});  //remove image from campground instance
    }

    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteCampground= async(req,res)=>{
    await Campground.findByIdAndDelete(req.params.id);
    req.flash('success', 'Campground deleted!');
    res.redirect('/campgrounds');
}
//see the .post middleware defined in models/campgrounds


module.exports.showCampground=async(req,res)=>{
    const {id}= req.params;
    const campground= await Campground.findById(id).populate({
        path: 'reviews',
        populate:{
            path: 'author'
           }
       }).populate('author');
    if(!campground) {
        req.flash('error', 'Campground not found!');
        res.redirect('/campgrounds');
       }
   res.render('campgrounds/show.ejs', {campground});
}