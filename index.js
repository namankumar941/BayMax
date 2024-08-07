const express = require("express")
const mongoose = require('mongoose')
const path = require('path')
const cookieSession = require('cookie-session')
const passport = require("passport") 

const {secretKey } = require("./secretData")

const User = require("./models/user")

// import all route
const userRoute = require('./route/user');
const authRoute = require('./route/auth');
const userEditRoute = require("./route/userEdit")
const documentsRoute = require('./route/documents');
const allGroupRoute = require("./route/allGroup")



const app = express();
const port= 8000

//middleware to initialize passport and creating cookie
app.use(cookieSession({
    keys: [secretKey], // key used to encrypt cookie
    maxAge: 24*60*60*1000    
}))
app.use(passport.initialize())
app.use(passport.session())

// set view engine as ejs and set path location of ejs file
app.set("view engine", 'ejs')
app.set('views',path.resolve('./views'))

app.use(express.static(path.resolve("./public")))

app.use(express.urlencoded({extended: false}))

//middleware to redirect url to route
app.use('/user', userRoute)
app.use('/auth', authRoute)
app.use("/userEdit", userEditRoute)
app.use("/documents", documentsRoute)
app.use("/allGroup", allGroupRoute)

//get request for main page
app.get("/",async (req,res)=>{
    if(!req.user){
         return res.render('main')
    }
    return res.render('main',{
        user: {
            profileImageURL: req.user.profileImageURL,
            userId :  req.user.userId
        }
    }) 
})

// get request to log out user
app.get("/logout",async (req,res)=>{
   req.logout();
    return res.render('main') 
})

// connect mongo Db 
mongoose
.connect("mongodb://localhost:27017/medicalRecords")
.then(()=> console.log("mongo db connected"))
.catch((err)=> console.log("mongo connection error",err))

// starting server
app.listen(port, ()=> console.log("server started"))