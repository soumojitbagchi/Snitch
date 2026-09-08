import { signin,signup,Oauth } from "../api/auth.api";
import { setUser,values, setDone,setErrors,setLoading,setServerError,setShowPassword,setValues } from "../../redux/auth.slice";
import { useDispatch } from "react-redux";

export const useAuth =()=>{
    const dispatch = useDispatch()
    const handelSignup = async ({setValues, setDone,setErrors,setLoading,setServerError,setShowPassword}) =>{
        const data = await signup({email:values.email,password:values.password})
        dispatch(setUser(data.user))
        return data
    }
    const handelSignin = async ({setValues }) =>{
        const data = await signup({email:values.email,contact:values.contact,fullname:values.fullname,role:values.role,password:values.password})
        dispatch(setUser(data.user))
        return data
    }

}