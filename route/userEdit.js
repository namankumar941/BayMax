const express = require("express")
const path = require("path");
const multer  = require("multer")
const fs = require("fs")

const User = require("../models/user")
const allGroup = require("../models/allGroup")
const Documents = require("../models/documents")

const router = express.Router()

//get request to edit user
router.get('/:userId',async (req,res)=>{
    const user = await User.find({userId : req.user.userId})
    const userEdit = await User.find({userId : req.params.userId})
    return res.render("userEdit",{
        user: user[0],
        userView : userEdit[0]
    })

})

//view profile image
router.get('/view/:userId',async (req,res)=>{
    const user = await User.find({userId : req.user.userId})
    const userView = await User.find({userId : req.params.userId})
    return res.render("userView",{
        user: user[0],
        userView : userView[0]
    })

})


//get request to edit profile image
router.get('/image/:userId',async (req,res)=>{
    const user = await User.find({userId : req.user.userId})
    const editUser = await User.find({userId : req.params.userId})

    return res.render("userEditImage",{
        user : user[0] ,
        editUser: editUser[0]
    })
})


//middleware to save profile image
const storage = multer.diskStorage({

    destination: function (req, file, callback) {
        const destPath = path.resolve(`./public/${req.params.userId}/profile`);
    
        // Check if the directory exists at destination
        fs.access(destPath, fs.constants.F_OK, (err) => {
          if (err) {   // If the directory does not exist, create one
            fs.mkdir(destPath, { recursive: true }, (err) => {
              if (err) {
                return callback(err);
              } else {
                return callback(null, destPath);
              }
            });
          } else {
            // If the directory exists, proceed
            return callback(null, destPath);
          }
        });
      },

      filename: function (req, file, callback) {
        const uniqueName =`${Date.now()}`
        return callback(null, uniqueName)
      }
})
const upload = multer({storage})


//post to change profile image
router.post('/image/:userId',upload.single('profileImage'), async (req,res)=>{
    
    const editUser = await User.findOneAndUpdate({userId : req.params.userId },{
        profileImageURL: `/${req.params.userId}/profile/${req.file.filename}`
    })    
    res.redirect(`/userEdit/${req.params.userId}`)
})


//get request to edit name
router.get('/name/:userId',async (req,res)=>{
    const user = await User.find({userId : req.user.userId})
    const editUser = await User.find({userId : req.params.userId})
    return res.render("userEditName",{
        user : user[0] ,
        editUser: editUser[0]
    })
})


//post to change Name
router.post('/name/:userId',async (req,res)=>{
    const body = req.body
    const editUser = await User.findOneAndUpdate({ userId : req.params.userId},{
        name: body.name
    }) 
    
    res.redirect(`/userEdit/${req.params.userId}`)
})

//get to edit age
router.get('/age/:userId',async (req,res)=>{
    const user = await User.find({userId : req.user.userId})
    const editUser = await User.find({userId : req.params.userId})
    
    return res.render("userEditAge",{
        user : user[0] ,
        editUser: editUser[0]
    })
})


//post to edit age
router.post('/age/:userId',async (req,res)=>{
    const body = req.body
    const editUser = await User.findOneAndUpdate({ userId : req.params.userId},{
        age: body.age
    }) 
    
    res.redirect(`/userEdit/${req.params.userId}`)
})

//get to edit phoneNumber
router.get('/phoneNumber/:userId',async (req,res)=>{
    const user = await User.find({userId : req.user.userId})
    const editUser = await User.find({userId : req.params.userId})
    
    return res.render("userEditPhoneNumber",{
        user : user[0] ,
        editUser: editUser[0]
    })
})


//post to edit phoneNumber
router.post('/phoneNumber/:userId',async (req,res)=>{
    const body = req.body
    const editUser = await User.findOneAndUpdate({ userId : req.params.userId},{
        phoneNumber: body.phoneNumber
    }) 
    
    res.redirect(`/userEdit/${req.params.userId}`)
})

//get request to add email
router.get('/email/:userId',async (req,res)=>{
    const user = await User.find({userId : req.user.userId})
    const editUser = await User.find({userId : req.params.userId})

    return res.render("addEmail",{
        user : user[0] ,
        editUser: editUser[0]
    })
})

//post request to add email
router.post('/email/:userId',async (req,res)=>{
    const email = req.body.email
    const user = await User.find({email : req.body.email})
    
    if(!user[0]){
        const editUser = await User.findOneAndUpdate({ userId : req.params.userId},{
            email: email
        })    
        
        return res.redirect(`/userEdit/${req.params.userId}`)
    }else{
        const oldUser = await User.find({userId : req.params.userId})

        await allGroup.updateMany({ user_id : oldUser[0]._id},{
            user_id : user[0]._id
        })        

        if(oldUser[0].age < user[0].age) oldUser[0].age = user[0].age 
        if(user[0].phoneNumber){
            oldUser[0].phoneNumber = user[0].phoneNumber
        }
        if(user[0].profileImageURL != "/default.png" ){
            oldUser[0].profileImageURL = user[0].profileImageURL
        }
        await User.findOneAndUpdate({ userId : user[0].userId},{
            age: oldUser[0].age , 
            phoneNumber: oldUser[0].phoneNumber ,
            profileImageURL: oldUser[0].profileImageURL ,
        })

        await Documents.updateMany({ userId : req.params.userId},{
            userId : user[0].userId
        }) 

        await User.deleteOne({ userId: req.params.userId });

    }
        
    res.redirect(`/userEdit/${user[0].userId}`)
})

module.exports = router
