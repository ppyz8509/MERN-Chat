import {createContext, useEffect, useState} from 'react'
import axios from 'axios'

export const UserContext = createContext();
export const UserContextProvider = ({children}) =>{
    const [username, setUsername] = useState(null);
    const [id, setId] = useState(null);


    const logout = () => {
        setUsername("");
        setId("");
      };


    useEffect(()=>{
        axios.get("profile").then(response =>{
            setId(response.data.userId);
            setUsername(response.data.username);
        });
    },[]);
    return(
        <UserContext.Provider value={{username, setUsername,id, setId,logout}}>
        {children}
        </UserContext.Provider>
    )
}