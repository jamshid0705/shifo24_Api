const AppError = require('../utility/appError')

const handlerDublicateFields=(error)=>{
  const message='Dublicate fields value: Please use anther value !'
  return new AppError(message,400)
}

const sendErrorDev=(err,req,res)=>{
  if(req.originalUrl.startsWith('/api')){
    return res.status(err.statusCode).json({
      status:err.status,
      error:err,
      message: err.message,
      stack:err.stack
    })
  }
  else{
    console.log('ERROR',err)
    return res.status(err.statusCode).render('error',{
      title:'Something is wrong !',
      msg:err.message
    })
  }
}

const sendErrorPro=(err,req,res)=>{
  
  if(err){
    console.log('ERROR',err)
    return res.status(err.statusCode).render('error',{
      title:'Something is wrong!',
      msg:err.message
    }) 
  }
  return res.status(err.statusCode).json({
    status:err.status,
    message: err.message
  })
  
}

const ValidatorError=(err)=>{
  const errors=Object.values(err.errors).map(val=>val.message)
  const message=`Invalid input data:${errors.join('. ')} `
  return new AppError(message,400)
}

const handlerJWT=(err)=>new AppError('Invalid token. Please log in again !',401)

const handlerJWTExpired=(err)=>new AppError('JWT expired. Please log in again !',401)

module.exports=(err,req,res,next)=>{
  err.statusCode=err.statusCode || 500
  err.status=err.status || 'error'

  if(process.env.NODE_ENV==='development'){
    sendErrorDev(err,req,res)
     console.log(err)
  } else if(process.env.NODE_ENV==='production'){
    let error={...err}
    
    if(error.code===11000){
      error=handlerDublicateFields(error)
    }
    if(error.name==='ValidationError') {
       console.log('99999999999')
      error=ValidatorError(error)
    }
    if(error.name==="JsonWebTokenError"){
      error=handlerJWT(error)
    }
    if(error.name==='TokenExpiredError'){
      error=handlerJWTExpired(error)
    }

    sendErrorPro(error,req,res)
  }
  
  next()
}