const express=require('express')
const app=express()
const morgan=require('morgan')
const cookieParser=require('cookie-parser')
const path=require('path')

const AppError=require('./utility/appError')
const globalErrorHandler=require('./controllers/errorController')
const userRoute=require('./routes/userRoute')

// serving static file
app.use(express.static(path.join(__dirname,'public')))
app.use(cookieParser())
// body parser
app.use(express.json({limit:'10kb'}));
app.use(express.urlencoded({extended:true,limit:'10kb'}))

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