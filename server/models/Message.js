const mongoose = require("mongoose");

// สร้าง Schema สำหรับข้อความ
const MessageSchema = new mongoose.Schema({
    text: String, // ข้อความ
    file: String, // ชื่อไฟล์ (ถ้ามี)
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // ผู้ส่ง (reference ไปยังโมเดล User)
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // ผู้รับ (reference ไปยังโมเดล User)
}, { timestamps: true }); // เพิ่ม timestamps เพื่อบันทึกเวลาที่สร้างและแก้ไขข้อมูล

// สร้างโมเดล Message จาก Schema ที่กำหนด
const MessageModel = mongoose.model("Message", MessageSchema);

module.exports = MessageModel; // ส่งออกโมเดล MessageModel เพื่อใช้งานในส่วนอื่นของโปรเจค
