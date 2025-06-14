const mongoose = require("mongoose")

const profileSchema = new mongoose.Schema({
    profileImageUri : {type : String,required : true },
    eloRating : {type : Number , required : true},
    profileId : {type : String , required : true}
})

module.exports = mongoose.model("Profile",profileSchema)

