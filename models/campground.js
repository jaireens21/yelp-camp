// making a model

const mongoose = require('mongoose');
const { cloudinary } = require('../cloudinary');
const Schema= mongoose.Schema; //shortcut to call mongoose.Schema
const Review=require('./review.js');

const ImageSchema= new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('cropped').get(function(){
    return this.url.replace('/upload', '/upload/ar_4:3,c_crop');
});  
//a virtual to crop images to similar sizes using cloudinary to show on edit campgroud page


const opts={ toJSON: {virtuals:true}};
//to ensure virtual on campgroundSchema is included when using json.stringify. basically for mapbox cluster map.


const campgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],  //an array of objects, each with url & filenamme
    price: Number,
    description: String,
    location: String,
    geometry: {
        type: {
          type: String, 
          enum: ['Point'], 
          required: true
        },
        coordinates: {
          type: [Number],
          required: true
        }
      },
    author: {
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);

campgroundSchema.virtual('properties.popupText').get(function(){
    return `<strong><a href="/campgrounds/${this._id}">${this.title}</a></strong><p>${this.location}</p>`;
});  //a virtual to create a propoerties filed to match the data format that mapbox cluster expects


//define a mongoose middleware to delete associated reviews when a campground is deleted
campgroundSchema.post('findOneAndDelete', async function(doc){
    if(doc){  //if we have actually found & deleted a campground
        await Review.deleteMany({
           _id: { $in: doc.reviews} //delete those reviews whose id appears in the deleted campground
        })

        //deleting related images from cloudinary
        if(doc.images){
            for (let img of doc.images)
            await cloudinary.uploader.destroy(img.filename);
        }
    }
})


module.exports= mongoose.model('Campground', campgroundSchema);