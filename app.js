const express = require("express");
const app = express();
const path = require("path");
const mongoose = require('mongoose');
const methodOverride = require("method-override");
const ejsMate = require('ejs-mate');
const ExpressError = require("./utils/ExpressError");
const routerListing = require("./routes/listings");
const routerReview = require("./routes/reviews");
const session = require("express-session");
const flash = require("connect-flash");
const User = require('./models/user');
const LocalStrategy = require("passport-local")
const passport = require("passport")
const routerUser = require("./routes/user")

main()
    .then(() => { console.log("connected to mongoDB"); })
    .catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

// Body parsing middleware 
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// other middleware
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const sessionOptions = {
    secret: "secretKeyGoesHere",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
}

//root route
app.get("/", (req, res) => {
    res.send("on root route");
});

app.use(session(sessionOptions));
app.use(flash())

// Authentication
app.use(passport.initialize());
passport.session();
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req, res , next) => {
    res.locals.success = req.flash("success")
    res.locals.errorMsg = req.flash("errorMsg")
    next()
})

app.get("/demouser", async (req, res) => {
    let newUser = new User({
        email: "example@email.com",
        username: "demoUser1",
    });
    const result =  await User.register(newUser, "passwordGoesHere");
    res.send(result);
})
// Router object  parent routes
app.use("/listings", routerListing)
app.use("/listings/:id/reviews", routerReview)
app.use("/user", routerUser)

// route for invalid req 
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page not found!"));
});

// error handling middleware
app.use((err, req, res, next) => {
    let { status = 500, message = "somthing went wrong at server side !" } = err;
    res.status(status).render("./listings/error.ejs", { message });
});

app.listen(8080, () => {
    console.log("server is listening on port 8080");
});