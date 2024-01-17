import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const UserContext = createContext();
export const UserContextProvider = ({ childen }) => {
  const [username, setUsername] = useState(null);
  const [id, setId] = useState(null);
  useEffect(() => {
    axios.get("/profile").then((response) => {
      setId(response.data.userId);
      setUsername(response.data.username);
    });
  }, []);
  return (
    <UserContext.Provider value={{ username, setUsername, id, setId }}>
      {childen}
    </UserContext.Provider>
  );
};
