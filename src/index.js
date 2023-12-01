const express = require("express")
require('express-async-errors'); 
const session = require("express-session")
const passport = require('passport');
const cookieParser = require("cookie-parser")
const morgan = require("morgan")
const dotenv= require("dotenv")
const app = express();
dotenv.config();


app.use(express.json());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({ secret: process.env.SECRET_KEY, resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

//const NotFoundError =require("./errors/not-found");

//Routes
const UserAuthRouter =require("./routes/auth")
const UserProfileRouter =require("./routes/userProfile")


app.use('/api',UserAuthRouter)
app.use('/api',UserProfileRouter)


app.get('/', (req,res)=>{
    res.send("Welcome to Community Dreams Foundation")
})

app.all('*', async (req, res) => {
    res.status(404).json({message:"Route not found"})
  });
  
const PORT = process.env.PORT
app.listen(PORT,()=>{
    console.log(`Listening on port ${PORT} `)
})
