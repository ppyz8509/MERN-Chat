import { useState, useEffect, useContext } from "react";
import { UserContext } from "../context/UserContext";
import axios from "axios";
import Logo from "./Logo";
import Contact from "./Contact";
import { uniqBy } from "lodash";
// สร้าง Chat component ซึ่งเป็นส่วนหนึ่งของแอปพลิเคชันการสนทนา
const Chat = () => {
  // สร้าง state สำหรับเก็บ WebSocket connection
  const [ws, setWs] = useState(null);
  // สร้าง state สำหรับเก็บข้อมูลผู้ใช้ออนไลน์
  const [onlinePeople, setOnlinePeople] = useState({});
  // สร้าง state สำหรับเก็บข้อมูลผู้ใช้ออฟไลน์
  const [offlinePeople, setOfflinePeople] = useState({});
  // สร้าง state สำหรับเก็บไอดีของผู้ใช้ที่ถูกเลือก
  const [selectedUserId, setSelectedUserId] = useState(null);
  // สร้าง state สำหรับเก็บข้อความที่ถูกส่ง
  const [message, setMessage] = useState([]);
  // สร้าง state สำหรับเก็บข้อความใหม่ที่พิมพ์
  const [newMessageText, setNewMessageText] = useState({});

  // ดึงข้อมูลผู้ใช้และไอดีจาก Context
  const { username, id, setUsername, setId } = useContext(UserContext);

  // ฟังก์ชันเชื่อมต่อ WebSocket
  const connectToWs = () => {
    const ws = new WebSocket("ws://localhost:4000");
    setWs(ws);
    ws.addEventListener("message", handleMessage);
    ws.addEventListener("close", () => {
      // หากการเชื่อมต่อถูกปิดโดยไม่ได้ตั้งใจ ให้ลองเชื่อมต่อใหม่
      setTimeout(
        () => {
          console.log("Disconnect. Trying to connect.");
          connectToWs();
        },
        // ระยะเวลาที่รอก่อนเชื่อมต่อใหม่ (1 วินาที)
        1000
      );
    });
  };

  // ฟังก์ชันสำหรับการจัดการข้อมูลที่ได้รับผ่าน WebSocket
  const handleMessage = (e) => {
    const messageData = JSON.parse(e.data);
    if ("online" in messageData) {
      // ถ้าข้อมูลเป็นข้อมูลของผู้ใช้ออนไลน์
      showOnlinePeople(messageData.online);
    } else if ("text" in messageData) {
      // ถ้าข้อมูลเป็นข้อความที่ถูกส่ง
      if (messageData.sender === selectedUserId) {
        setMessage((prev) => [...prev, { ...messageData }]);
      }
    }
  };

  // ฟังก์ชันสำหรับแสดงข้อมูลผู้ใช้ออนไลน์
  const showOnlinePeople = (peopleArray) => {
    const people = {};
    peopleArray.forEach(({ userId, username }) => {
      people[userId] = username;
    });
    setOnlinePeople(people);
  };

  // Effect Hook เพื่อเรียกฟังก์ชันเชื่อมต่อ WebSocket เมื่อ selectedUserId เปลี่ยนแปลง
  useEffect(() => {
    connectToWs();
  }, [selectedUserId]);

  // Effect Hook เพื่อดึงข้อมูลผู้ใช้ออฟไลน์เมื่อ onlinePeople หรือ id เปลี่ยนแปลง
  useEffect(() => {
    axios.get("/people").then((res) => {
      const offlinePeopleArr = res.data
        .filter((p) => p._id !== id)
        .filter((p) => !Object.keys(onlinePeople).includes(p._id));

      const offlinePeople = {};
      offlinePeopleArr.forEach((p) => {
        offlinePeople[p._id] = p;
      });

      setOfflinePeople(offlinePeople);
    });
  }, [onlinePeople, id]);

  // ฟังก์ชันสำหรับออกจากระบบ
  const logout = () => {
    axios.post("/logout").then(() => {
      setWs(null);
      setId(null);
      setUsername(null);
    });
  };

  // ฟังก์ชันสำหรับการส่งข้อความ
  const sendMessage = (e, file = null) => {
    if (e) e.preventDefault();
    ws.send(
      JSON.stringify({
        recipient: selectedUserId,
        text: newMessageText,
        file,
      })
    );
    if (file) {
      axios.get("/messages/" + selectedUserId).then((res) => {
        setMessage(res.data);
      });
    } else {
      setNewMessageText("");
      setMessage((prev) => [
        ...prev,
        {
          text: newMessageText,
          sender: id,
          recipient: selectedUserId,
          _id: Date.now(),
        },
      ]);
    }
  };

  // Effect Hook เพื่อดึงข้อมูลข้อความเมื่อ selectedUserId เปลี่ยนแปลง
  useEffect(() => {
    if (selectedUserId) {
      axios.get("/messages/");
    }
  }, [selectedUserId]);

  // ลบข้อความที่ซ้ำกัน
  const messageWithoutDups = uniqBy(message, "_id");

  // ฟังก์ชันสำหรับการส่งไฟล์
  const sendFile = (e) => {
    const reader = new FileReader();
    reader.read
  };




  return (
    <div className="flex h-screen">
      <div className="bg-white w-1/3 flex flex-col">
        <div className="flex-grow">
          <Logo />
          {Object.keys(onlinePeopleExclOurUser).map((userId) => (
            <Contact
              key={userId}
              username={onlinePeopleExclOurUser[userId]}
              id={userId}
              online={true}
              selected={userId === selectedUserId}
              onClick={() => setSelectedUserId(userId)}
            />
          ))}
          {Object.keys(offlinePeople).map((userId) => (
            <Contact
              key={userId}
              username={offlinePeople[userId].username}
              id={userId}
              online={false}
              selected={userId === selectedUserId}
              onClick={() => setSelectedUserId(userId)}
            />
          ))}
        </div>
        <div className="p-2 text-center flex item-center justify-center ">
          <span className="mr-2 text-sm text-gray-600 flex item-center ">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
              />
            </svg>
            {username}
          </span>

          <button
            className="text-sm bg-blue-100 py-1 px-2 text-gray-500 border rounded-sm"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </div>
      <div className="flex flex-col bg-blue-50 w-2/3 p-2">
        <div className="flex-grow">
          {!selectedUserId && (
            <div className="flex h-full flex-grow items-center justify-center">
              <div className="text-gray-300">
                &larr;Select a person from sidebar
              </div>
            </div>
          )}

          {!!selectedUserId && (
            <div className="relative h-full">
              <div className="overflow-y-scroll absolute top-0 left-0 right-0 bottom-2">
                {messageWithoutDups.map((message) => (
                  <div
                    key={message._id}
                    className={
                      message.sender === id ? "text-right" : "text-left"
                    }
                  >
                    <div
                      className={
                        "text-left inline-block p-2 my-2 rounded-mb text-sm " +
                        (message.sender === id
                          ? "bg-blue-500 text-white"
                          : "bg-white text-gray-500")
                      }
                    >
                      {message.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <form className="flex gap-2" onSubmit={sendMessage}>
          <input
        type="text"
  value={newMessageText}
  onChange={(e) => setNewMessageText(e.target.value)} 
  placeholder="Type You Message"
  className="bg-white flex-grow border rounded-sm p-2"
/>
<label className="bg-black p-2 text-gray-400 cursor-pointer rounded-md border border-blue-200 w-auto h-auto hover:bg-white hover:text-black">
    <input type="file" className="hidden" onChange={sendFile} />
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24" 
      strokeWidth={1.5} 
      stroke="currentColor" 
      className="w-6 h-6">
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M7.5 7.5h-.75A2.25 2.25 0 0 0 4.5 9.75v7.5a2.25 2.25 0 0 0 2.25 2.25h7.5a2.25 2.25 0 0 0 2.25-2.25v-7.5a2.25 2.25 0 0 0-2.25-2.25h-.75m0-3-3-3m0 0-3 3m3-3v11.25m6-2.25h.75a2.25 2.25 0 0 1 2.25 2.25v7.5a2.25 2.25 0 0 1-2.25 2.25h-7.5a2.25 2.25 0 0 1-2.25-2.25v-.75" />
    </svg>
  </label>
          <button
            type="submit"
            className="bg-blue-500 p-2 text-white rounded-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
              />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;