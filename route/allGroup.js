const express = require("express")
const uuid = require ("uuid")

const User = require("../models/user")
const allGroup = require("../models/allGroup")
const callOpenAI = require("../runAssistant")
const user = require("../models/user")


const router = express.Router()

//get all group as per login id
router.get('/', async (req,res)=>{
    const user = await User.find({userId : req.user.userId})
    const allGroups = await allGroup.find({user_id : req.user._id},'groupId , groupName')
        
    return res.render('allGroup',{
        user: user[0],
        allGroups : allGroups
    })
})

//get request to create Group
router.get('/create', async (req,res)=>{
    const editUser = await User.find({userId : req.user.userId})
    return res.render('createGroup',{
        user: editUser[0]
    })
})

//post request to create Group
router.post('/create', async (req,res)=>{
    const body = req.body 

    const allGroupId = uuid.v4()
    const GroupId = uuid.v4()
    
    allGroup.create({
        allGroupId: allGroupId,
        groupId: GroupId,
        groupName : body.name,
        user_id: req.user._id
    })

    return res.redirect('/allGroup')
})

//get request to display all user of one group
router.get('/:groupId', async (req,res)=>{
    const user = await User.find({userId : req.user.userId})

    const allUsers = await allGroup.find({groupId : req.params.groupId},'user_id , groupId , groupName').populate('user_id')
    
    return res.render('allMember',{
        user: user[0],
        allUsers : allUsers
    })
})

//get request to add member in a group
router.get('/add/:groupId', async (req,res)=>{
    const user = await User.find({userId : req.user.userId})
   
    return res.render('addMember',{
        user: user[0],
        groupId : req.params.groupId
    })
})


//post request to add member in a group
router.post('/add/:groupId', async (req,res)=>{
    const body = req.body 
    const newUser = await User.create({
        userId: uuid.v4(),
        resourceId : uuid.v4(),
        name : body.name,
        age: body.age,
        
    })

    const allGroupId = uuid.v4()
    const allGroups = await allGroup.find({groupId : req.params.groupId},'groupName')

    allGroup.create({
        allGroupId: allGroupId ,
        groupId: req.params.groupId,
        groupName : allGroups[0].groupName,
        user_id: newUser._id
    })


    return res.redirect(`/allgroup/${req.params.groupId}`)
})


module.exports = router