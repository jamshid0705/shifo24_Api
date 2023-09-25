const catchAsync=require('../utility/catchAsync')
const jwt=require('jsonwebtoken')
const bcrypt=require('bcryptjs')
const crypto=require('crypto')
const User=require('../models/userModel')


const signToken=(id)=>{
  return jwt.sign({id},process.env.JSON_SECRET,{expiresIn:process.env.JSON_EXPIRES_IN})
}

// cookie ga token yuborish
const sendToken=(user,statusCode,res,req)=>{
  const token=signToken(user._id)

  const cookieOption={
    expires:new Date(Date.now()+process.env.JSON_COOKIE_EXPIRES_IN*60*60*1000),
    httpOnly:true
  }

  if(process.env.NODE_ENV==='production') cookieOption.secure=true

  res.cookie('jwt',token,cookieOption)
  user.password=undefined
    res.status(statusCode).json({
      status:'success',
      token:token,
      data:{
        user
      }
    })
}

///////////// sign up //////////////
exports.signup=catchAsync(async(req,res)=>{
  console.log(req.body)
  const user=await User.create(req.body)
  sendToken(user,200,res,req)
  
  res.status(200).json({
    status: 'success',
    token: signToken(user._id),
    data: user,
  });
  
})