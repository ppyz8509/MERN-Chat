import { useState, useContext } from "react";
import axios from "axios";
import { UserContext } from "../context/UserContext";

const RegisterAndLoginFrom = () => {
    const [username, setUsername] = useState(""); // เก็บค่าชื่อผู้ใช้ที่ผู้ใช้ป้อนเข้ามา
    const [password, setPassword] = useState(""); // เก็บค่ารหัสผ่านที่ผู้ใช้ป้อนเข้ามา
    const [isLoginOrRegister, setIsLoginOrRegister] = useState("login"); // เก็บสถานะว่าผู้ใช้กำลังทำการเข้าสู่ระบบหรือลงทะเบียน
    const [errorMessage, setErrorMessage] = useState(""); // เก็บข้อความข้อผิดพลาดที่อาจเกิดขึ้น

    const { setUsername: setLoggedInUsername, setId } = useContext(UserContext); // ดึงฟังก์ชันเซ็ตชื่อผู้ใช้และ ID จาก Context

    // ฟังก์ชันที่เรียกเมื่อผู้ใช้กดปุ่ม submit ในฟอร์ม
    const handleSubmit = async (e) => {
        e.preventDefault(); // หยุดการกระทำเริ่มต้นของฟอร์มเมื่อมีการส่ง
        try {
            const url = isLoginOrRegister === "register" ? "register" : "login"; // กำหนด URL ของเส้นทาง API ตามสถานะ
            const { data } = await axios.post(url, { username, password }); // ส่งค่าชื่อผู้ใช้และรหัสผ่านไปยังเส้นทาง API
            setLoggedInUsername(username); // เซ็ตชื่อผู้ใช้ใน Context
            setId(data.id); // เซ็ต ID ใน Context จากข้อมูลที่ได้รับกลับจาก API
        } catch (error) {
            setErrorMessage("Invalid credentials. Please try again."); // เกิดข้อผิดพลาดหากไม่สามารถลงทะเบียนหรือเข้าสู่ระบบได้
        }
    };


    return (
        <div className="flex items-center justify-center h-screen bg-blue-50" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1553949345-eb786bb3f7ba?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1950&q=80)", backdropFilter: "blur(5px)" }}>
            <form onSubmit={handleSubmit} className="w-96 mx-auto bg-white p-8 rounded-md shadow-md" style={{ opacity: 0.9 }}>
                <h2 className="text-2xl font-semibold mb-4" >
                    {isLoginOrRegister === "register" ? "Register" : "Login"}
                </h2>

                {errorMessage && (
                    <p className="text-red-500 mb-4 text-center">{errorMessage}</p>
                )}

                <input
                    type="text"
                    value={username}
                    className="block w-full rounded-sm p-3 mb-3 border"
                    placeholder="Username"
                    onChange={(e) => setUsername(e.target.value)}
                />

                <input
                    type="password"
                    value={password}
                    className="block w-full rounded-sm p-3 mb-3 border"
                    placeholder="Password"
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button className="bg-blue-500 text-white block w-full rounded-sm p-3 hover:bg-blue-700">
                    {isLoginOrRegister === "register" ? "Register" : "Login"}
                </button>

                <div className="text-center mt-4">
                    {isLoginOrRegister === "register" && (
                        <div>
                            Already a member?{" "}
                            <button
                                className="ml-1 text-blue-500"
                                onClick={() => {
                                    setIsLoginOrRegister("login");
                                    setErrorMessage("");
                                }}
                            >
                                Login
                            </button>
                        </div>
                    )}
                    {isLoginOrRegister === "login" && (
                        <div>
                            Don't have an account?{" "}
                            <button
                                className="ml-1 text-blue-500"
                                onClick={() => {
                                    setIsLoginOrRegister("register");
                                    setErrorMessage("");
                                }}
                            >
                                Register
                            </button>
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
};

export default RegisterAndLoginFrom;