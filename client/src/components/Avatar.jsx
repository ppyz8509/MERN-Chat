import React from "react";

const Avatar = ({ username, userId, online }) => {
  // กำหนดสีพื้นหลังของ Avatar ตามลำดับของ userId ของผู้ใช้
  const colors = [
    "bg-teal-200",
    "bg-reg-200",
    "bg-green-200",
    "bg-purple-200",
    "bg-yellow-200",
    "bg-pink-200",
    "bg-rose-200",
    "bg-orange-200",
  ];

  // คำนวณหมายเลขพื้นฐาน 10 ของ userId และแปลงเป็นเลขฐานสอง
  const userIdBase10 = parseInt(userId.substring(10), 16);

  // คำนวณหา index ของสีในอาร์เรย์ colors
  const colorIndex = userIdBase10 % colors.length;

  // เลือกสีจากอาร์เรย์ colors ตาม index
  const color = colors[colorIndex];

  return (
    <div className={"w-8 h-8 relative rounded-full flex items-center " + color}>
      {/* แสดงตัวอักษรแรกของ username */}
      <div className="text-center w-full opacity-70">{username[0]}</div>
      {/* แสดงสถานะการออนไลน์ของผู้ใช้ */}
      {online && (
        <div className="absolute w-3 h-3 bg-green-400 bottom-0 right-0 rounded-full border border-white"></div>
      )}
      {!online && (
        <div className="absolute w-3 h-3 bg-gray-400 bottom-0 right-0 rounded-full border border-white"></div>
      )}
    </div>
  );
};

export default Avatar;
