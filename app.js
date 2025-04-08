const express = require("express");
const app = express();
const nocache = require('nocache')
const env = require("dotenv").config();

const session = require("express-session")
const passport = require("./config/passport")
const connectDB = require('./config/db'); // Import the connectDB function

const userRouter = require("./routes/userRouter")
const adminRouter = require("./routes/adminRouter")

const path = require("path")

connectDB();

app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));

const User = require('./models/userSchema')


// Check if dotenv loaded correctly
if (env.error) {
    console.error("Error loading .env file:", env.error);
    process.exit(1);  
}

// Log MongoDB URI for debugging
console.log("MongoDB URI:", process.env.MONGODB_URI);

// Connect to the database


app.use(nocache())
app.use(express.json())
app.use(express.urlencoded({ extended: true }));


app.use(session({ 
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    // store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 72 * 60 * 60 * 1000
    }
}))

app.use((req, res, next) => {
    res.set('cache-control', 'no-store')
    next()
  })

// app.use((req, res, next) => {
//     res.locals.user = req.session.user || null; // Make user available in all views
//     next();
// });


app.use(passport.initialize())
app.use(passport.session())

app.set('view engine', 'ejs');
app.set('views', [path.join(__dirname, 'views/user'), path.join(__dirname, 'views/admin')]);
app.use(express.static(path.join(__dirname, 'public')));


app.use("/",userRouter)
app.use("/admin",adminRouter)
app.use('/uploads', express.static('uploads'));


// // SESSION
// app.use(async (req, res, next) => {
//     try {
//         if (req.session.user) {
//             const user = await User.findById(req.session.user);
//             if (user && user.isBlocked) {
//                 delete req.session.user;
//                 return res.redirect('/login');
//             }
//         }
//         next();
//     } catch (error) {
//         console.error("Error checking blocked user:", error);
//         res.status(500).send('Server Error');
//     }
//   });
  

// Start the server
const _PORT = process.env.PORT || 7000;
app.listen(_PORT, () => {
    console.log(`SERVER Running Successfully On PORT: ${_PORT}`);
});

// Export the app for testing or other modules
module.exports = app;