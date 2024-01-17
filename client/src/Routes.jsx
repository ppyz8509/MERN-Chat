import RegisterAndLoginFrom from './components/RegisterAndLoginFrom'
import Chat  from './components/Chat'
import { UserContext } from './context/UserContext'
import { useContext } from 'react'
import React from 'react'


const Routes=() =>{
  const {username} = useContext(UserContext)
  if (username) {
    return <Chat />
  }
    return<RegisterAndLoginFrom/>
    
}

export default Routes