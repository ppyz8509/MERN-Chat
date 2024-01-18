const mongoose = require("mongoose")
const MessageSchema = new mongoose.Schema({
    text: String,
    file: String,
    sender: {type: mongoose.Schema.Types.ObjectId,ref:"User"},
    recipient: {type: mongoose.Schema.Types.ObjectId,ref:"User"},
},
  { timestamps: true }
);
const messageModel = mongoose.model("Message",MessageSchema);
module.exports  = messageModel;