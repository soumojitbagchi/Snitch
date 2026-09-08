import { Routes , Route } from "react-router";
import Signin from "./features/auth/UI/Signin";
import Signup from "./features/auth/UI/Signup";


const AppRoute= ()=>{
    <Routes>
        <Route path="/" element={}/>
        <Route path="/signin" element={<Signin/>} />
        <Route path="/singup" element={<Signup/>} />
    </Routes>
}


export default AppRoute