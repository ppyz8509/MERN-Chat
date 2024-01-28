const express = require("express");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const User = require("./models/User");
const Message = require("./models/Message");
const ws = require("ws");
const fs = require("fs");
const { setTimeout } = require("timers/promises");
const { log } = require("console");
const { resolve } = require("path");
const { rejects } = require("assert");

dotenv.config(); //เพื่อเรียกใช้ไฟล์ .env
const app = express();

app.use(cors({ credentials: true, origin: "http://localhost:5173" }));
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(__dirname + "/uploads"));


//connet mongo
const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI,(err)=>{
    if(err) console.log(err);
    console.log('connect');
});

//ไว้ตรวจสอบการเชื่อมต่อฐานข้อมูล
app.get("/", (req, res) => {
  res.send("This is a Restful api mernchat");
});

//User Register
const salt = bcrypt.genSaltSync(10);
app.post("/register", async (req, res) => {
  const { username, password } = req.body; // สลายโครงสร้าง
  try {
    const userDoc = await User.create({
      username,
      password: bcrypt.hashSync(password, salt),
    });
    res.json(userDoc);
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

//Login
const secret = process.env.SECRET;
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const userDoc = await User.findOne({ username }); //เอา username ไปหาข้อมูลจากฐานข้อมูล
  if (userDoc) {
    const isMatchedPassword = bcrypt.compareSync(password, userDoc.password); //เช็ค พาส ที่ได้จากฟอร์ม และในฐานข้อมูลว่าเหมือนกันไหม
    if (isMatchedPassword) {
      //logged in
      jwt.sign({ username, userId: userDoc._id }, secret, {}, (err, token) => {
        if (err) throw err;
        //save data in cookie
        res.cookie("token", token).json({
          userId: userDoc._id,
          username,
        });
      });
    } else {
      res.status(400).json("wrong credentials");
    }
  } else {
    res.status(400).json("user not found");
  }
});

app.post("/logout", (req, res) => {
  res.cookie("token", "").json("ok");
});

app.get("/profile", (req, res) => {
  const token = req.cookies?.token;
  if (token) {
    jwt.verify(token, secret, {}, (err, userData) => {
      if (err) throw err;
      res.json(userData);
    });
  } else {
    res.status(401).json("no token");
  }
});

app.get("/people", async (req, res) => {
  const users = await User.find({}, { _id: 1, username: 1 });
  res.json(users);
});

//บอกว่าให้ฟังที่ PORTไหน โดยดึงมาจากไฟล์ env
const PORT = process.env.PORT;
const server = app.listen(PORT, () => {
  console.log("Server is" + PORT);
});

//Web Socket Server
const wss = new ws.WebSocketServer({ server });


app.get("/people", async (req, res) => {
  const users = await User.find({}, { _id: 1, username: 1 });
  res.json(users);
});

const getUserDataFromRequest = (req) => {
  return new Promise((resolve, reject) => {
    const token = req.cookies?.token;
    if(token){
      jwt.verify(token,secret,{},(err,userData) =>{
        if(err) throw err ;
        resolve(userData)
      })
    } else {
      reject("no token")
    }
  })
}
app.get("/messages/:userId", async (req, res) => {
  const { userId } = req.params; // รับ userId จากพารามิเตอร์ของคำขอ
  const userData = await getUserDataFromRequest(req); // ดึงข้อมูลผู้ใช้ที่เข้าสู่ระบบ
  const ourUserId = userData.userId; // ได้รับ userId ของผู้ใช้ที่เข้าสู่ระบบ

  // ค้นหาข้อความที่ส่งไประหว่างผู้ใช้ที่ระบุและผู้ใช้ที่เข้าสู่ระบบ
  const messages = await Message.find({
    sender: { $in: [userId, ourUserId] }, // ค้นหาโดยใช้ sender เป็น userId ของผู้ใช้ที่ระบุหรือผู้ใช้ที่เข้าสู่ระบบ
    recipient: { $in: [userId, ourUserId] } // ค้นหาโดยใช้ recipient เป็น userId ของผู้ใช้ที่ระบุหรือผู้ใช้ที่เข้าสู่ระบบ
  }).sort({ createAt: 1 }); // เรียงลำดับข้อความตามเวลาสร้าง

  res.json(messages); // ส่งข้อมูลข้อความกลับให้กับผู้ใช้เป็น JSON
});




wss.on("connection", (connection, req) => {
  //เเจ้งเพื่อนๆว่าออนไลน์อยู่
  const notifyAboutOnlinePeople = () => {
    [...wss.clients].forEach((client) => {
      client.send(
        JSON.stringify({
          online: [...wss.clients].map((c) => ({
            userId: c.useId, // แก้ไข c.userId เป็น c.useId
            username: c.username,
          })),
        })
      );
    });
  };
  connection.isAlive = true;

  connection.timer = setInterval(() => {
    connection.ping(); // ส่ง ping ไปยัง client เพื่อตรวจสอบว่ายังคงเชื่อมต่ออยู่หรือไม่
    connection.deadTimer = setTimeout(() => {
      clearInterval(connection.timer); // หยุดการส่ง ping ถ้าไม่ได้รับ pong ในเวลาที่กำหนด
      connection.terminate(); // สิ้นสุดการเชื่อมต่อ
      notifyAboutOnlinePeople(); // แจ้งเพื่อนๆว่ามีสมาชิกตัดการเชื่อมต่อ
      console.log("dead");
    }, 1000); // ตรวจสอบสถานะภายในเวลา 1 วินาทีหลังจากส่ง ping
  }, 5000); // ส่ง ping ทุก 5 วินาที
  
  connection.on("pong", () => {
    clearTimeout(connection.deadTimer);
  });

  //read username and id from the cookie for this connection
// อ่าน username และ id จากคุกกี้สำหรับการเชื่อมต่อนี้
const cookies = req.headers.cookie;
if (cookies) {
  // หากมีคุกกี้ในคำขอ
  const tokenCookieString = cookies
    .split(";")
    .find((str) => str.startsWith("token="));
  if (tokenCookieString) {
    // หากมีคุกกี้ที่ชื่อ "token"
    const token = tokenCookieString.split("=")[1];
    if (token) {
      // ถ้ามี token
      jwt.verify(token, secret, {}, (err, userData) => {
        if (err) throw err;
        // แยก userId และ username จากข้อมูลผู้ใช้ใน token
        const { userId, username } = userData;
        // กำหนดค่า userId และ username ให้กับ connection นี้
        connection.userId = userId;
        connection.username = username;
      });
    }
  }
}


connection.on("message", async (message) => {
  const messageData = JSON.parse(message.toString()); // แปลงข้อมูลจาก JSON เป็น object
  const { recipient, sender, text, file } = messageData; // ดึงข้อมูล recipient, sender, text, และ file จากข้อความ

  let filename = null;
  if (file) {
    // ถ้ามีไฟล์ในข้อความ
    const parts = file.name.split("."); // แยกชื่อและนามสกุลของไฟล์
    const ext = parts[parts.length - 1]; // นามสกุลของไฟล์
    filename = Date.now() + "." + ext; // สร้างชื่อไฟล์ใหม่โดยใช้ timestamp เพื่อป้องกันการชื่อซ้ำ
    const path = __dirname + "/uploads/" + filename; // ตำแหน่งที่จะบันทึกไฟล์
    // เขียนข้อมูลไฟล์ลงในไฟล์ที่เป็น base64
    fs.writeFile(path, file.data.split(",")[1], "base64", () => {
      console.log("file saved: " + path); // แสดงข้อความเมื่อไฟล์ถูกบันทึก
    });
  }

  if (recipient && (text || file)) {
    // ถ้ามีผู้รับและมีข้อความหรือไฟล์
    const messageDoc = await Message.create({
      sender: connection.useId, // กำหนดผู้ส่งเป็น userId ของผู้เชื่อมต่อ
      recipient,
      text,
      file: file ? filename : null, // กำหนดชื่อไฟล์ถ้ามีไฟล์ ไม่เช่นนั้นให้เป็น null
    });

    // ส่งข้อความไปยังผู้รับที่เป็นออนไลน์
    [...wss.clients]
      .filter((c) => c.useId === recipient) // กรองลูกค้าที่มี userId เท่ากับผู้รับ
      .forEach((c) =>
        c.send(
          JSON.stringify({
            sender: connection.useId, // ผู้ส่ง
            recipient, // ผู้รับ
            text, // ข้อความ
            file: file ? filename : null, // ชื่อไฟล์
            _id: messageDoc._id, // รหัสข้อความ
          })
        )
      );
  }
});

notifyAboutOnlinePeople(); // เรียกฟังก์ชันเพื่อแจ้งเพื่อนๆว่ามีสมาชิกตัดกา

});