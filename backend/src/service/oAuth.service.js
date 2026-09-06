import express from "express"
import passport from 'passport'
import jwt from 'jsonwebtoken'
import {Strategy as GoogleStrategy }from 'passport-google-oauth20'
import app from '../app/app.js'
import {config }from '../config/config.js'



const oAuth = async ()=>{
    passport.use( new Strategy({
    clientID:config.GOOGLE_AUTH_CLIENT_ID,
    clientSecret:config.GOOGLE_AUTH_SECRET_KEY,
    callbackURL:'/auth/google/callback'
},(accessToken, refreshToken , profile , done)=>{
   return done(nulll,profile)
}))
}

export default oAuth 
