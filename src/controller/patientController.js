const roleModel = require("../models/rolesModel");
const patientModel = require("../models/patientModel");
const progressModel=require("../models/progressModel")
const gameModel=require("../models/gameModel")
const validation = require("../validator/validator");
const AdmZip = require('adm-zip');
var fs = require('fs');

var multer = require('multer');
const axios = require("axios");

const nodemailer = require('nodemailer');



// var gamefile = multer({dest: 'src/gamefiles/'});

const createPatient = async function (req, res) {
    try {
        let body = req.body

        if (!validation.isrequestBody(body)) {
            return res.status(400).send({ status: false, msg: "Invalid parameters, please provide user details" })
        }

        const { DocId, patientFullName, email, phone, disabalityType, progress } = body

        if (!validation.isValidobjectId(DocId)) {
            return res.status(400).send({ status: false, msg: "Doctor id is wrong" })
        }

        if (!validation.isValid(patientFullName)) {
            return res.status(400).send({ status: false, msg: "please provide fullname" })

        }


        if (!validation.isValid(email)) {
            return res.status(400).send({ status: false, msg: "please provide email" })

        }

        if (!validation.isValid(phone)) {
            return res.status(400).send({ status: false, msg: "please provide phone" })

        }

        if (!validation.isValid(disabalityType)) {
            return res.status(400).send({ status: false, msg: "please provide disabalityType" })

        }


        if (!(/^\w+([\.-]?\w+)@\w+([\. -]?\w+)(\.\w{2,3})+$/.test(email))) {
            return res.status(400).send({ status: false, message: "email is not valid" })

        }

        if (!(/^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/.test(phone))) {
            return res.status(400).send({ status: false, message: "Mobile Number is not valid" })

        }

        let isDuplicateEmail = await patientModel.findOne({ email });
        if (isDuplicateEmail) {
            return res.status(400).send({ status: false, messgage: "Email is already registered"})
        }

        let duplicatephone = await patientModel.findOne({ phone });
        if (duplicatephone) {
            return res.status(400).send({ status: false, messgage: "phone is already registered" })
        }
        
        let testAccount = await nodemailer.createTestAccount();
         
        let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: "rashupandey029@gmail.com", // generated ethereal user
              pass: "nsedmjzulrvhucif", // generated ethereal password
            },
          });
        
         let info = await transporter.sendMail({
            from: "rashupandey029@gmail.com", // sender address
            to: body.email, // list of receivers
            subject: "Registration Confirmed VS", // Subject line
            text: "Welcome to Voice Simulation", // plain text body
             html: `<b>Dear ${body.patientFullName}</b><br><b>Welcome to Voice Simulation</b><br>
            <p>Your registration was successful. Thank you for joining our service!</p>
            <p>For any query do reply to this email</p><br>
            <p><a href="#"><img src="https://techmonitor.ai/wp-content/uploads/sites/4/2016/06/what-is-URL.jpg" height="200px" width="200px"/></a></p>
            <p><a href="#"><button>Download Application</button></a></p>
            <p>Best Regards</p>
            <p>Head Office</p><p>Voice Simulation</p><p>New Ashok Nagar Delhi 110096 Near Metro Station Noida sector-18</p><p><b>Thank You</b></p> `, // html body
      });
      
          console.log("new user", info.messageId);
          console.log("To", info);

       


        const output = await patientModel.create(body)
        const data = await roleModel.findOne({ _id: DocId })
        data.patientData.push(output);
        return res.status(201).send({ status: true, msg: "Patient Succesfully Created", data: output })

    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }

}

const findPatient = async (req, res) => {
    try {
        const email = req.query.email

        if (!email) {

            return res.status(400).send({ status: false, msg: "please enter patientId to find the patient" })
        }

        if (!(/^\w+([\.-]?\w+)@\w+([\. -]?\w+)(\.\w{2,3})+$/.test(email))) {
            return res.status(400).send({ status: false, message: "email is not valid" })

        }

        const patient = await patientModel.findOne({ email: email }).select({ _id: 1, DocId: 1, patientFullName: 1, email: 1, phone: 1, disabalityType: 1})

        if (!patient) {
            return res.status(400).send({ status: false, msg: "Patient not found please enter valid id/email id" })

        }

        return res.status(200).send({ status: true, msg: "patient details", data: patient })

    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}

const docPatient = async (req, res) => {

    try {
        const DocId = req.query.doc_id

        if (!DocId) {
            return res.status(400).send({ status: false, msg: "please enter Doctor Id to find the details" })
        }


        let doctor = await roleModel.findOne({ _id: DocId })

        if (!doctor) {
            return res.status(400).send({ status: false, msg: "Data not found please enter valid id" })

        }

        const patients = await patientModel.find({DocId: doctor._id}).select({createdAt:0,updatedAt:0,__v:0,DocId:0})

        let DoctorData = {
            DocFullName: doctor.fullname,
            email: doctor.email,
            phone: doctor.phone,
            role: doctor.role,
            patientData: patients
        }

        return res.status(200).send({ status: true, data: DoctorData })
    }
    catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }
}

const gameHistory = async (req,res)=>
{
    try{
        // const email = req.query.email;
        // if(!email){
        //     return res.status(400).send({status: false,message:"Please send an email id"})
        // }

        // if (!(/^\w+([\.-]?\w+)@\w+([\. -]?\w+)(\.\w{2,3})+$/.test(email))) {
        //     return res.status(400).send({ status: false, message: "email is not valid" })

        // }
        //     const patient = await patientModel.findOne({email : email})
        //     if(patient){
        //         return res.status(200).send({status : true,data : patient.progress})
        //   }

        //   else{
        //     const doctor = await roleModel.findOne({email : email});
        //     if(!doctor){
        //      return res.status(404).send({status: false, message:"Please enter a valid patient or doctor email id"})
        //   }

        //   const doctorID = await patientModel.find({DocId: doctor._id})
        //     if(!doctorID){
        //         return res.status(404).send({status:false ,message:`Doctor ${doctorID.fname} ${doctorID.lname} don't have patients right now`})
        //     }

        //     return res.status(200).send({status : true , data : doctorID.progress})
        // }         
        // const DocId = req.query.DocId;
        const patientId =req.query.patientId;

        // if(!DocId){
        //     return res.status(400).send({status:true,message:"Please Enter doctor  id"})
        // }

        if(!patientId){
            return res.status(400).send({status:true,message:"Please Enter patient id"})
        }

        // if (!(/^\w+([\.-]?\w+)@\w+([\. -]?\w+)(\.\w{2,3})+$/.test(DocEmail))) {
        //      return res.status(400).send({ status: false, message: "Doctor email is not valid" })
        // }

    //     if (!(/^\w+([\.-]?\w+)@\w+([\. -]?\w+)(\.\w{2,3})+$/.test(patientEmail))) {
    //         return res.status(400).send({ status: false, message:"Patient email is not valid" })
    //    }

    //    const doctor = await roleModel.findOne({_id : DocId});
    //      if(!doctor){
    //         return res.status(404).send({status: false, message:"Please enter a valid doctor id"})
    //    }
    //   console.log("Doc", doctor._id)

       const details = await patientModel.findOne({_id : patientId})
    //    console.log(details)
       if(!details){
        return res.status(404).send({status: false,message:"No such data found,Please check id"})
       }

       else {
        return res.status(200).send({status: true , data:details.progress})
       }
    }
    catch(error){
        return res.status(500).send({status: false , message:error.message})
    }
}

const zipfile = async (req,res) => {
    try{
        var uploadDir = fs.readdirSync(__dirname+"/upload"); 

        const zip = new AdmZip();
 
    for(var i = 0; i < uploadDir.length;i++){
        zip.addLocalFile(__dirname+"/upload/"+uploadDir[i]);
    }

    const downloadName = `${Date.now()}.zip`;
 
    const data = zip.toBuffer();

//    zip.writeZip(__dirname+"/"+downloadName);
    
    res.set('Content-Type','application/octet-stream');
    res.set('Content-Disposition',`attachment; filename=${downloadName}`);
    res.set('Content-Length',data.length);
     res.status(200).send(data);

    }
    catch(error){
        return res.status(500).send({status: false, message : error.message})
    }
}

const gameData = async (req,res) =>{
     try{
        const patientId = req.query.patientId;
        if(!patientId){
            return res.status(400).send({status:false,message:"Please enter valid Patient Id."});
        }

        if(!patientId){
            return res.status(400).send({status:true,message:"Please Enter patient  id"});
        }
        
        const gamedata = await progressModel.find({ patientId: patientId}).select({ _id: 1, gamebase: 1, counter: 1, gameId: 1, patientId: 1, overralrating: 1, date:1, elapsedTime: 1, LoudnessTarget: 1, NumberOfTrials: 1, cumulativeDurationOfSounds: 1, MeanPitch: 1, meanLoudness: 1,  stdDevPitch: 1, stdDevLoudness: 1, rangepitchMin: 1, rangepitchMax: 1, rangeLoudnessMin: 1, rangeLoudnessmax: 1, audioId: 1})

        if (!gamedata) {
            return res.status(400).send({ status: false, msg: "game data not found please enter valid id" })

        }

        return res.status(200).send({ status: true, msg: "game details", data: gamedata })

    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}

const storeData = async (req,res) => {
    try{
        const body = req.body;
        if(!validation.isrequestBody(body)){
            return res.status(400).send({status:false,message:"Game response is not coming"})
        }

        const {patientId}= body

        if(!validation.isValid(patientId)){
            return res.status(400).send({ status: false, msg: "Please provide  id"})
        }

        // if (!(/^\w+([\.-]?\w+)@\w+([\. -]?\w+)(\.\w{2,3})+$/.test(patientId))) {
        //     return res.status(400).send({ status: false, message: "Email is not valid" })

        // }

        const patient = await patientModel.findOne({_id : patientId})
        if(!patient){
            return res.status(400).send({status: false,message:"No such patient found"})
        }

        const output = await progressModel.create(body)

        patient.progress.push(output)

        return res.status(200).send({status: true ,data:patient})
    }
    catch(error){
        return res.status(500).send({status: false,message:error.message})
    } 
}


// image path
// limit
// filter


const addgames = async (req,res) => {
    try{
      

        let body = req.body


        if (!validation.isrequestBody(body)) {
            return res.status(400).send({ status: false, msg: "Invalid parameters, please provide user details" })
        }

        const {gamecategories, gamename, gameimage, gamedescription, gamefile} = body

        // if (!validation.isValidobjectId(gamecategories)) {
        //     return res.status(400).send({ status: false, msg: "please provide gamecategories" })
        // }

        // if (!validation.isValid(gamelink)) {
        //     return res.status(400).send({ status: false, msg: "please provide gamelink" })

        // }

        // if (!validation.isValid(gamedescription)) {
        //     return res.status(400).send({ status: false, msg: "please provide gamedescription" })

        // }

        // if (!validation.isValid(gamename)) {
        //     return res.status(400).send({ status: false, msg: "please provide gamedescription" })

        // }





        const output = await gameModel.create(body)
        
        return res.status(201).send({ status: true, msg: "game Succesfully added", data: output })

    }catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}


const gamelist = async (req, res) => {
    try {
        const gamecategories = req.query.gamecategories

        if (!gamecategories) {

            return res.status(400).send({ status: false, msg: "please enter gamecategories to find the game" })
        }

        const game = await gameModel.find({ gamecategories: gamecategories }).select({ _id: 1, gamecategories: 1, gametype:1, gamename: 1, gameimage:1, gamedescription: 1, gamefile: 1})

        if (!game) {
            return res.status(400).send({ status: false, msg: "game not found please enter valid categories" })

        }

        return res.status(200).send({ status: true, msg: "game details", data: game })

    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}

module.exports = { createPatient, findPatient, docPatient,gameHistory,zipfile,gameData,storeData,addgames,gamelist}
