const aws = require("aws-sdk")

aws.config.update({
    accessKeyId: "AKIAY3L35MCRVFM24Q7U",  // id
    secretAccessKey: "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",  // secret password
    region: "ap-south-1" 
});
 
const uploadFile = async (file) => {
    return new Promise((resolve, reject) => {
        let s3 = new aws.S3({ apiVersion: "2006-03-01" })
        const uploadParams = {
            ACL: "public-read",
            Bucket: "classroom-training-bucket", 
            Key: "Group_11/" + file.originalname, 
            Body: file.buffer
        }
        s3.upload(uploadParams, (err, data)=> {
            if (err){
                return reject({"error": err})
            }
            return resolve(data.Location)
        })
    })
}

module.exports.uploadFile = uploadFile