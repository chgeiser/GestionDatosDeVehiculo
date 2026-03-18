import axios from "axios";
import { createContext, useState } from "react";
import { Navigate } from "react-router-dom";

//1.- crear el conexto
const UserContext = createContext();

//2.- compartir el contexto 
const UserContextProvider = ({children}) => {

    const [token, setToken] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [user, setUser] = useState();


    const pedirUsuario = async (token)=>{
        const response = await axios.get('http://localhost:5000/api/auth/me', {
        headers: {Authorization: `Bearer ${token}`}});
        setUser(response.data)
    }

    const login = async (email, password)=>{
        const response = await axios.post("http://localhost:5000/api/auth/login", {email, password})
        setEmail(response.data.email);
        setToken(response.data.token);
        pedirUsuario(response.data.token);
    }

    const logout =()=>{
        setToken(false);
        setEmail(false);
    }


    const register =async (email, password)=>{
        const response = await axios.post("http://localhost:5000/api/auth/register", {email, password})
        setEmail(response.data.email);
        setToken(response.data.token);
    }


    
   
   return(
<UserContext.Provider value={{token, pedirUsuario, register, email, setToken, user, password, setPassword, setUser, logout, login}}>
    {children}
</UserContext.Provider>
   )
}
export {UserContext, UserContextProvider} 