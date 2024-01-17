import { useState, useContext } from "react";
import axios from "axios";
import { UserContext } from "../context/UserContext";
import { FaUser, FaUsers } from "react-icons/fa";  // นำเข้าไอค่อนจาก FontAwesome

const Chat = () => {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const { username } = useContext(UserContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setMessages((prevMessages) => [...prevMessages, { username, message }]);
            setMessage("");
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    return (
        <div className="flex h-screen bg-blue-50">
            {/* โปรไฟล์ทางซ้ายมือ */}
            <div className="w-1/4 bg-white border-r p-4">
                <h2 className="text-2xl font-semibold mb-4">Friends</h2>
                {/* รายชื่อเพื่อน */}
                <ul>
                    {/* นำเข้าข้อมูลเพื่อนจาก API หรือ context ได้ตามต้องการ */}
                    <li className="mb-2 flex items-center">
                        <FaUser className="mr-2 text-blue-500" /> Friend 1
                    </li>
                    <li className="mb-2 flex items-center">
                        <FaUser className="mr-2 text-blue-500" /> Friend 2
                    </li>
                    <li className="mb-2 flex items-center">
                        <FaUser className="mr-2 text-blue-500" /> Friend 3
                    </li>
                  
                </ul>
            </div>

            {/* แชท */}
            <div className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto p-4">
                    {/* แสดงข้อความ */}
                    {messages.map((msg, index) => (
                        <div key={index} className="mb-2">
                            <span className="font-semibold">{msg.username}:</span> {msg.message}
                        </div>
                    ))}
                </div>

                {/* แบบฟอร์มสำหรับส่งข้อความ */}
                <form onSubmit={handleSubmit} className="p-4 border-t flex items-center">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="w-full rounded-l-full p-2 border"
                    />
                    <button type="submit" className="bg-blue-500 text-white rounded-r-full p-2 ml-2">
                        ส่ง
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Chat;
