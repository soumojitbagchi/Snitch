import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
    name:"auth",
    initialState:{
        values:{email:"",password:""},
        errors:{},
        serverError:"",
        loading:false,
        showPassword:false,
        done:false,
        user:"",
    },
    reducers:{
        setUser:(state,action)=>{
            state.user=action.payload
        },
        setValues:(state,action)=>{
            state.values=action.payload
        },
        setErrors:(state,action)=>{
            state.errors=action.payload
        },
        setServerError:(state,action)=>{
            state.serverError=action.payload
        },
        setShowPassword:(state,action)=>{
            state.showPassword=action.payload
        },
        setLoading:(state,action)=>{
            state.loading=action.payload
        },
        setDone:(state,action)=>{
            state.done=action.payload
        },
    }
})

export const {setUser,setValues,setErrors,values,setServerError,setShowPassword,setDone,setLoading}=authSlice.actions
export default authSlice.reducer