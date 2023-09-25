const express=require('express')
const app=express()
const morgan=require('morgan')
const cookieParser=require('cookie-parser')

const AppError=require('./utility/appError')
const globalErrorHandler=require('./controllers/errorController')
const userRoute=require('./routes/userRoute')

app.use(cookieParser())
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}
app.use('/api/v1/users',userRoute)

// url dagi error ni catch qilish un
app.all('*',(req,res,next)=>{
  next(new AppError(`Can not find this url ${req.originalUrl}`,404))
})
// globalni errorni catch qilish
app.use(globalErrorHandler)

module.exports=app