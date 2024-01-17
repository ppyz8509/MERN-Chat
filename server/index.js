const express = require("express");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const cookieParser =  require("cookie-parser");
const User = require("./models/User")

//เพื่อเรียกใช้ไฟล์ .env
dotenv.config();
const app = express();

app.use(cors({credentials: true, origin:"http://localhost:5173"}));
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(__dirname+"/uploads"));

//เชื่อมต่อกับ mongo
const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI,(err)=>{
    if(err) console.log(err);
    console.log('connect');
});

//ลองว่าเชื่อมต่อกับเซิฟเวอร์ได้ไหม
app.get("/", (req, res) =>{
    res.send("<h1>This is a RESaFUL")
})

//User Register
const salt = bcrypt.genSaltSync(10);
app.post("/register", async (req,res)=>{
    const {username, password} = req.body; // สลายโครงสร้าง  
    try {
        const userDoc = await User.create({
            username,
            password: bcrypt.hashSync(password, salt),
        });
        res.json(userDoc)
    } catch (error) {
        console.log(error);
        res.status(400).json(error)
    }
})


//Login
const secret = process.env.SECRET;
app.post("/login", async(req,res)=>{
    const {username, password} = req.body;
    const userDoc = await User.findOne({username}); //เอา username ไปหาข้อมูลจากฐานข้อมูล
    if (userDoc) { 
    const isMatchedPassword = bcrypt.compareSync(password, userDoc.password); //เช็ค พาส ที่ได้จากฟอร์ม และในฐานข้อมูลว่าเหมือนกันไหม
    if(isMatchedPassword){
        //logged in
        jwt.sign({username, userid: userDoc._id}, secret, {}, (err, token)=>{
            if(err) throw err;
            //save data in cookie
            res.cookie("token", token).json({
                userid: userDoc._id,
                username,
            });
        });
    }else{
        res.status(400).json("wrong credentials")
    }
}
    else{
        res.status(400).json("user not found")

    }
});

app.post("/logout", (req, res) =>{
    res.cookie("token","").json("ok")
});

app.get("/profile" , (req,res) => {
    const token = req.cookies?.token;
    if (token) {
        jwt.verify(token,secret, {}, (err, userData) => {
            if (err) throw err;
            res.json(userData);
        });
    } else {
        res.status(401).json("no token")
    }
})

//บอกว่าให้ฟังที่ PORTไหน โดยดึงมาจากไฟล์ env
const PORT = process.env.PORT;
app.listen(PORT, () =>{
    console.log("Server is" + PORT);
})