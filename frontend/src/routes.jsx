import { Routes , Route } from "react-router";
import Signin from "./features/auth/UI/Signin";
import Signup from "./features/auth/UI/Signup";


const AppRoute= ()=>{
    <Routes>
        <Route path="/" element={<h1> welcome to home page </h1>}/>
        <Route path="/signin" element={<Signin/>} />
        <Route path="/singup" element={<Signup/>} />
    </Routes>
}


export default AppRoute