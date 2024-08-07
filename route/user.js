const User = require("../models/user")
const allGroup = require("../models/allGroup")
const uuid= require('uuid')

const express = require("express")

const router = express.Router()

//get request to login user
router.get('/login', (req,res)=>{
    return res.render('login')
})

//get request to user details
router.get("/:userId", async(req,res)=>{
    const user = await User.find({userId : req.user.userId})
    
    const userDetails = await User.find({userId : req.params.userId})

    console.log(userDetails)
    
    return res.render('viewUserDetails',{
        user: user[0],        
        userDetails : userDetails[0]
    })
})



module.exports = router