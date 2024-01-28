// นำเข้าคำสั่งที่ต้องการจาก React
import { createContext, useEffect, useState } from 'react'
import axios from 'axios'

// สร้าง Context สำหรับข้อมูลผู้ใช้
export const UserContext = createContext();

// สร้างคอมโพเนนต์ UserContextProvider ซึ่งจะเป็นผู้ให้บริการคอนเท็กซ์
export const UserContextProvider = ({ children }) => {
    // กำหนดตัวแปร state สำหรับเก็บชื่อผู้ใช้และ ID โดยเริ่มต้นเป็น null
    const [username, setUsername] = useState(null);
    const [id, setId] = useState(null);
    
    // ใช้ useEffect เพื่อดึงข้อมูลโปรไฟล์เมื่อคอมโพเนนต์โหลด
    useEffect(() => {
        // ทำ HTTP GET request ไปยังเส้นทาง "/profile"
        axios.get("profile").then(response => {
            // เมื่อได้ข้อมูลกลับมา อัปเดต username และ id
            setId(response.data.userId);
            setUsername(response.data.username);
        });
    }, []);

    // คืนค่าคอมโพเนนต์ UserContext.Provider โดยส่งค่า value ที่ประกอบด้วย username, setUsername, id, และ setId ให้กับ children
    return (
        <UserContext.Provider value={{ username, setUsername, id, setId }}>
            {children}
        </UserContext.Provider>
    )
}
