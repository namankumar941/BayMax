const User = require("../models/user")
const Documents = require("../models/documents")
const callOpenAI = require("../runAssistant")

const express = require("express")
const path = require("path");
const multer  = require("multer")
const uuid = require ("uuid")
const fs = require('fs')

const router = express.Router()

//get request to display all uploaded reports
router.get("/:userId", async(req,res)=>{
    const user = await User.find({userId : req.user.userId})
    
    const doc = await Documents.find({userId : req.params.userId},'documentId , dateOfReport')

    const docOwner = await User.find({userId : req.params.userId}, 'profileImageURL , name , userId')
    
    return res.render('documents',{
        user: user[0],        
        doc: doc , 
        docOwner : docOwner[0]
    })
})

//get request to add report
router.get("/add/:userId", async(req,res)=>{
    const user = await User.find({userId : req.user.userId})
    const docOwner = await User.find({userId : req.params.userId}, 'profileImageURL , name , userId, resourceId')
   
    return res.render('addDocuments',{
        user: user[0],
        docOwner : docOwner[0]
    })
})


const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        const destPath = path.resolve(`./public/${req.params.resourceId}/reports`)

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
        const uniqueName = Date.now() + ".pdf"
        return callback(null, uniqueName)
      }
})
const upload = multer({storage})

//post request to add report
router.post("/add/:resourceId", upload.single('Report') , async(req,res)=>{
    const user = await User.find({resourceId : req.params.resourceId})
    
            
    const newDoc = await Documents.create({
        userId: user[0].userId,
        docURL : `/${req.params.resourceId}/reports/${req.file.filename}`,
        dateOfReport: req.body.dateOfReport,
        documentId : uuid.v4(),
    })
    callOpenAI(`./public/${req.params.resourceId}/reports/${req.file.filename}`)

    return res.redirect(`/documents/${user[0].userId}`)
    
})

//get request to view report
router.get("/viewReport/:documentId", async(req,res)=>{
    const doc = await Documents.find({documentId : req.params.documentId},'docURL')
    
    res.render('viewReport',{
        url : doc[0].docURL
    })
})

module.exports = router