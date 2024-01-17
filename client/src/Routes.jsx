import RegisterAndLoginFrom from './componentd/RegisterAndLoginFrom'
import Chat  from './componentd/Chat'
import { UserContext } from './context/UserContext'
import React from 'react'


const Routes=() =>{
  const {username} = useContext(UserContext)
  if (username) {
    return <Chat />
  }
    return<RegisterAndLoginFrom/>
    
}

export default Routes