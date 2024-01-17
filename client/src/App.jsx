import { useState } from 'react'
import { UserContextProvider } from './context/UserContext'
import Routes from './Routes'
import axios from 'axios'

function  App () {
  axios.defaults.baseURL = "http://localhost:4000";
  axios.defaults.withCredentials = true;
  return (
    <UserContextProvider>
    <Routes/> 
    </UserContextProvider>
  )
}

export default App
