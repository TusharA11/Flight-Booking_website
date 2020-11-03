//Dependencies
var express = require('express'),
	bodyParser = require('body-parser'),
	app = express();
var mongoose = require('mongoose'),
	passport = require('passport'),
	localStrategy = require('passport-local'),
	passportLocalMongoose = require('passport-local-mongoose');
var methodOverride = require("method-override");


//Importing databse models
var user = require('./models/user.js'),
	flight = require('./models/flight.js'),
	admin = require('./models/admin.js'),
	booking = require('./models/booking.js');

//Connecting Database
mongoose.connect('mongodb+srv://tushar:tushar@cluster0.eoy5c.mongodb.net/<dbname>?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true})
.then(console.log("DB  is connected"));

//============================== App Settings ==============================

//Hashing Secret For Password
app.use(require('express-session')({
	secret: "Java Project for Group 1",
	resave: false,
	saveUninitialized: false
}));

//Setting Views
app.set('view engine', 'ejs');
// app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));


//Login Logout Settings For User
passport.use(new localStrategy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

// //Login Logout Settings For User
// passport.use(new localStrategy(admin.authenticate()));
// passport.serializeUser(admin.serializeUser());
// passport.deserializeUser(admin.deserializeUser());


//===================================== ROUTES ==================================

//Landing Route
app.get('/', (req, res) => {
	res.render('land');
});


//Customer Register / Login / Logout Pages

//Sign Up Page
app.get('/register', (req, res) => {
	res.render('register');
});

app.post('/register', (req, res) => {
	user.register(new user({username: req.body.username}), req.body.password, (err, user) => {
		if(err){
			console.log(err);
			return res.render('register');
		} else{
			passport.authenticate("local")(req, res, function(){
				res.redirect('home');
			});
		}
	});
});

//Login Page
app.get('/login', (req, res) => {
	res.render('login');
});

app.post('/login', passport.authenticate("local", {
	successRedirect: "/home",
	failureRedirect: "/"
}),(req, res) => {
});



//===================================== PAGES ======================================
//Home Page showing all flights
app.get('/home', isLoggedIn, (req, res) => {
	flight.find({}, (err, flights) => {
		res.render('home', {flights: flights});
	});
});

//Detail for specific flight
app.get("/home/:id", isLoggedIn, function(req, res){
	flight.findById(req.params.id, function(err, foundFlight){
		if (err){
			res.send(err);
			res.redirect("/home");
		}
		else{
			res.render("show", {flight: foundFlight});
		}
	});
});

//Booking For Specific Selected Flight
app.get("/home/:id/book", isLoggedIn, function(req, res){
	flight.findById(req.params.id, (err, foundFlight) => {
		res.render('book', {flight: foundFlight});
	});
});

app.post('/home/:id/book/bill', isLoggedIn, (req, res) => {
	flight.findById(req.params.id, (err, foundFlight) => {
		booking.create(req.body.book, (err, newBooking) => {
			if(err){
				res.redirect('/');
			}
			res.render('bill', {book: newBooking, flight: foundFlight});
		});
	});
});

//==========================================================
app.get('/allflights', (req, res) => {
	flight.find({}, (err, flights) => {
		if(err){
			console.log(err);
		} else {
			res.render('allflights', {flights: flights});
		}
	});
});

app.get('/allflights/new', (req, res) => {
	res.render('new');
});

app.post('/allflights', (req, res) => {
	flight.create(req.body.flight, (err, newBlog) => {
		if(err){
			res.render("new");
		}
		else{
			res.redirect("/allflights");
		}
	});
});

app.get("/allflights/:id", function(req, res){
	flight.findById(req.params.id, function(err, foundFlight){
		if (err){
			res.redirect("/allflights");
		}
		else{
			res.render("showflight", {flight: foundFlight});
		}
	});
});

app.get("/allflights/:id/edit", function(req, res){
	flight.findById(req.params.id, function(err, foundFlight){
		if(err){
			res.redirect("/allflights");
		}
		else{
			res.render("edit", {flight: foundFlight});
		}
	});
});

app.put("/allflights/:id", function(req, res){
	flight.findByIdAndUpdate(req.params.id, req.body.flight, function(err, updatedFlight){
		if(err){
			res.redirect("/allflights");
		}
		else{
			res.redirect("/allflights/" + req.params.id);
		}
	});
});

app.delete("/allflights/:id", function(req, res){
	flight.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect("/allflights");
		}
		else{
			res.redirect("/allflights");
		}
	});
});


//Logout for Customer
app.get('/logout', (req, res) => {
	req.logout();
	res.redirect('/');
});

//Middleware
function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect('/login');
}

//====Listen Route
app.listen(process.env.PORT || 3000, () => {
	console.log('Server running ....');
});