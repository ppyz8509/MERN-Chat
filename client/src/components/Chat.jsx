import { useState, useEffect, useContext, useRef } from "react";
import { UserContext } from "../context/UserContext";
import axios from "axios";
import Logo from "./Logo";
import Contact from "./Contact";
import { FaUser } from "react-icons/fa";

const Chat = () => {
  const [ws, setWs] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState({});
  const [offlinePeople, setOfflinePeople] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [message, setMessage] = useState([]);
  const { username, id, setUsername, setId } = useContext(UserContext);

  useEffect(() => {
    connectToWs();
  }, [selectedUserId]);
  const connectToWs = () => {
    const ws = new WebSocket("ws://localhost:4000");
    setWs(ws);
    ws.addEventListener("message", handleMessage);
    ws.addEventListener("close", () => {
      setTimeout(
        () => {
          console.log("Disconnect. Trying to connect.");
          connectToWs();
        },
        //ตรงนี้คือ timeout ที่เวลาคือ ms 1000  นี้คือ  1 วิ
        1000
      );
    });
  };

  const handleMessage = (e) => {
    const messageData = JSON.parse(e.data);
    if ("online" in messageData) {
      showOnlinePeople(messageData.online);
    } else if ("text" in messageData) {
      if (messageData.sender === selectedUserId) {
        setMessage((prev) => [...prev, { ...messageData }]);
      }
    }
  };

  const showOnlinePeople = (peopleArray) => {
    const people = {};
    peopleArray.forEach(({ userId, username }) => {
      people[userId] = username;
    });
    setOnlinePeople(people);
  };

  useEffect(
    () => {
      axios.get("/people").then((res) => {
        const offlinePeopleArr = res.data
          .filter((p) => p._id != id)
          .filter((p) => !Object.keys(onlinePeople).includes(p._id));
        const offlinePeople = {};
        offlinePeopleArr.forEach((p) => {
          offlinePeople[p._id] = p;
        });
        setOfflinePeople(offlinePeople);
      });
    },
    //จะทำเมื่อตัวใน [] despendensylist นี่เปลี่ยนแปลง
    [onlinePeople]
  );
  const onlinePeopleExclOurUser = { ...onlinePeople };
  delete onlinePeopleExclOurUser[id];
 
  const logout = () => {
    axios.post("/logout").then(() => {
      setWs(null);
      setId(null);
      setUsername(null);
    });
  };
  

  
  return (
    <div className="flex h-screen bg-blue-50">
      <div className="bg-white w-1/4 flex flex-col">
        <div className="flex-grow">
       
          <Logo />
          {Object.keys(onlinePeopleExclOurUser).map
          ((userId) => (
            <Contact
             key={userId}
             username={onlinePeopleExclOurUser[userId]}
             id={userId}
             online={true}
             selected={userId === selectedUserId}
             onClick={() => {
              setSelectedUserId(userId)
             }}
          />
          ))}
         
         {Object.keys(onlinePeopleExclOurUser).map
          ((userId) => (
            <Contact
             key={userId}
             username={onlinePeopleExclOurUser[userId].username}
             id={userId}
             online={false}
             selected={userId === selectedUserId}
             onClick={() => {
              setSelectedUserId(userId)
             }}
          />
          ))}
        </div>
        <div className="p-2 text-center flex items-center justify-center">
        <span className="mr-2 text-sm text-gray-600 flex items-center">
          <FaUser className="mr-1" />
       {username}
        </span>
        <button
  onClick={logout}
  className="text-sm bg-blue-100 px-3 py-1 text-gray-500 border rounded-full"
>
  Logout
</button>

        </div>
      </div>
      <div className="flex flex-col bg-blue-50 w-3/4 p-4">
        <div className="flex-grow bg-gray-200">
          <div className="flex h-full items-center justify-center text-gray-500">
            &larr; Select a person from sidebar
          </div>
        </div>
        <form className="flex items-center p-4 bg-white">
          <input
            type="text"
            placeholder="Type your message"
            className="flex-grow border rounded-full p-3 focus:outline-none focus:border-blue-500"
          />

          <label className="bg-blue-200 p-2 text-gray-600 cursor-pointer rounded-full">
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
                d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
              />
            </svg>
            <input type="file" className="hidden" />
          </label>
          <button
            type="submit"
            className="bg-blue-500 p-2 text-white rounded-full"
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
