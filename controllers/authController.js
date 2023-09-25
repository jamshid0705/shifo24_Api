const catchAsync=require('../utility/catchAsync')
const AppError=require('../utility/appError')
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


///////////// sign in ///////////////
exports.login=catchAsync(async(req,res,next)=>{
  const {email,password}=req.body
  // 1 email va password bor yo'qligini ni tekshirish
  if(!email || !password){
    return next(new AppError('Email yoki password yoq !',400))
  }
  // 2 passwordni tekshirish 
  const user=await User.findOne({email}).select('+password')
  if(!(user) || !(await bcrypt.compare(password,user.password))){
    return next(new AppError('Email yoki password xato !',401))
  }
  // 3 new token jo'natish
  sendToken(user,200,res,req)

})

///////////////////// protect middleware //////////////////
exports.protect=catchAsync(async(req,res,next)=>{
  // 1 token bor yo'qligini tekshirish
  let token
  if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
    token = req.headers.authorization.split(' ')[1]
  }else if(req.cookies.jwt){
    token=req.cookies.jwt
  }
  if(!token || token==='null'){
    return next(new AppError('Token y\`oq! Iltimos tekshirib ko\`ring !',401))
  }
  
  // 2 token ni tekshirish
  const verifyToken=await jwt.verify(token,process.env.JSON_SECRET)
  // 3 tokendan id ni olib o'sha id lik userni topish
  const newUser=await User.findById(verifyToken.id)
  if(!newUser){
    return next(new AppError('Bunday user mavjud emas. Iltimos tokenni tekshiring !',401))
  }
  // 4 password yangilangan bo'lsa 
  if(newUser.passwordChangedDate.getTime()/1000>token.iat){
    return next(new AppError('Sizning tokenningiz yaroqsiz !',401))
  }

  req.user=newUser
  next()
})

//////////////// update password ////////////////
exports.updatePassword=catchAsync(async(req,res,next)=>{
  // 1 userni topish
  const user=await User.findById(req.user._id).select('+password')
  console.log(user)
  // 2 password ni tekshirish bcrypt bilan
  if(!(await bcrypt.compare(req.body.passwordCorrunt,user.password))){
    return next(new AppError('Siz xato password kiritdingiz !',401))
  }
  // 3 update password
  user.password=req.body.password
  user.passwordConfirm=req.body.passwordConfirm
  await user.save()
  // 4 jwt send
  sendToken(user,200,res,req)

})