const mongoose= require('mongoose');
const Campground=require('../models/campground');
const cities= require('./cities');
const {places, descriptors}= require('./seedHelpers');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {useNewUrlParser: true, 
useUnifiedTopology: true 
})
.then(()=>{
    console.log('Database connected');  
    })
.catch( (err)=>{
    console.log("connection error:");
    console.log(err);
    })

const sampleElement= (array)=> {return array[Math.floor(Math.random()*array.length)];}  //returning a random element of an input array

const seedDB= async()=>{
    await Campground.deleteMany({}); //clearing the DB
    //adding seed data
    for (let i=0; i<300; i++){
        const p= Math.floor(Math.random()*20) +10;
        const random1000= Math.floor(Math.random()*1000); //cities is a list of 1000 cities, randomly selecting a city
        const camp= new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            geometry: {
                type: "Point",
                coordinates: [cities[random1000].longitude, cities[random1000].latitude]
            },
            author:'613d1402f2dfbcc4901e0912',
            title: `${sampleElement(descriptors)} ${sampleElement(places)}`,
            images: [
                {
                url : 'https://res.cloudinary.com/dvhs0ay92/image/upload/v1631629372/sample.jpg', 
                filename : 'sample'                
                },
                {
                url : 'https://res.cloudinary.com/dvhs0ay92/image/upload/v1631722297/YelpCamp/cvhsi5rt3ajthladidog.jpg',
                filename : 'YelpCamp/yqpsy63wid9noznv3wyq'
                }
            ],
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore',
            price: p
            })
    await camp.save();
    }
}
    seedDB().then(()=>{
        mongoose.connection.close();  //closing DB connection after successfully running the seed file.
    });