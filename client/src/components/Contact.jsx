import React from "react";
import Avatar from "./Avatar";

const Contact = ({ username, id, online, selected, onClick }) => {
  // เมื่อคลิกที่ Contact จะเรียกฟังก์ชัน onClick พร้อมส่ง id ของผู้ใช้
  return (
    <div
      onClick={() => onClick(id)} // เมื่อคลิกที่ Contact จะเรียก onClick พร้อมส่ง id ของผู้ใช้
      className={
        "border-b border-gray-100 flex items-center gap-2 cursor-pointer " + // กำหนด className ให้กับ div ด้วยการต่อ string
        (selected ? "bg-blue-50" : "") // ถ้า selected เป็น true จะเพิ่ม className "bg-blue-50" เข้าไป
      }
    >
      {/* เมื่อ selected เป็น true จะแสดง div เพื่อเน้นสีพื้นหลังด้านขวา */}
      {selected && <div className="w-1 bg-blue-500 h-12 rounded-r-md"></div>}
      <div className="flex gap-2 py-2 pl-4 items-center"> {/* กำหนด style ของ div */}
        <Avatar username={username} userId={id} online={online} /> {/* เรียกใช้ Avatar component */}
        <span className="text-gray-800">{username}</span> {/* แสดงชื่อผู้ใช้ */}
      </div>
    </div>
  );
};

export default Contact;
