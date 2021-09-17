const User=require('../models/user');

module.exports.renderRegisterForm= (req,res)=>{
    res.render('users/register.ejs');
}



module.exports.registerUser= async(req,res,next)=>{
    try{
        const {email, username, password} = req.body;
        const user= new User({email, username});
        const registeredUser= await User.register(user,password);  
        //.register comes from passport-local-mongoose

        //to get the registered user signed in (.login is made by passport)
        req.login(registeredUser, (err)=>{
            if (err) { return next(err); }
            req.flash('success', 'Welcome to Yelp Camp!');//successfully registerd & logged in
            res.redirect('/campgrounds');
        })
    } catch(e){
        req.flash('error', e.message);
        res.redirect('/register');
    }
}



module.exports.renderLoginForm= (req,res)=>{
    res.render('users/login.ejs');
}


module.exports.loginUser= (req,res)=>{
    //we reach here only if there was no error in validating credentials
    req.flash('success', 'Welcome back!');

    //redirecting to where the user was before authentication asked them to login
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);       
}

module.exports.logoutUser= (req,res)=>{
    req.logout(); //logout is a method made by passport for us
    req.flash('success', 'Successfully logged out!');
    res.redirect('/campgrounds');
}