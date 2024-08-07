const mongoose = require ("mongoose")

const documentSchema = new mongoose.Schema({
    documentId : {
        type: String,
        unique:true
    },
    userId:{
        type: String,
    },
    docURL : {
        type: String,
        required: true,
    },
    
    dateOfReport: {
        type : String,   
            
    },
},{timestamps : true})

const document = mongoose.model("document",documentSchema)

module.exports = document