const mongoose = require("mongoose")
const ObjectId = mongoose.Schema.Types.ObjectId

const rolesSchema = new mongoose.Schema({

    fullname: {
        type: String,
        required: true,
        trim: true 
    },

    lastfullname:{
        type: String,
        required: true,
        trim: true
    },

    username:{
        type: String,
        require:true
    },

    adminid:{
      type:String,
      require:true
    },
    
    email: {
        type: String,
        required: true,
        unique: true,
        match: /^\w+([\.-]?\w+)@\w+([\. -]?\w+)(\.\w{2,3})+$/,
        trim:true
    },


    Dob:{
        type:String
    },

    phone: {
        type: String,
        required: true,
        unique: true,
        match: /^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/,
        trim:true
    },

    password: {
        type: String,
        required: true,
        trim:true,
        
    },

    role: {
        type: String,
        enum: ["Admin","Sub-Admin","Doctor"],
        default: "Doctor"
    },

    Address:{
        type: String,
    },  

    file: {
        type: String,
        default: "test.jpg",
    },


    Country:{
        type: String,
    }, 

    City:{
        type: String,
    }, 

    State:{
        type: String,
    }, 

    pincode:{
        type: String,
    },

    Biography:{
        type:String
    },

    status:{
        type:String
    },
    
    payment: {
        type: Boolean,
        default: false
    },
    isdoctor:{
        type:String,
        default:true
    },

    count:{
        type:String,
        default:"0"
    },

    patientData:[Object],
},{timestamps:true})

module.exports=mongoose.model("roles",rolesSchema)
