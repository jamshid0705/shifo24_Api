const mongoose=require('mongoose')
const validator=require('validator')
const bcrypt=require('bcryptjs')

const userSchema=new mongoose.Schema({
  name:{
    type:String,
    required:[true,"Please ! Your name !"]
  },
  email:{
    type:String,
    unique:true,
    required:[true,"Please ! Your email !"],
    lowercase:true,
    validate:[validator.isEmail,'Your email isn`t correct !']
  },
  photo:{
    type:String,
    default:'default.jpg'
  },
  role:{
    type:String,
    enum:['user','admin'],
    default:'user'
  },
  password:{
    type:String,
    required:[true,"Please! Your password!"],
    minlength:8,
    select:false
  },
  passwordConfirm:{
    type:String,
    required:[true,"Please! Your passwordConfirm!"],
    validate:{
      validator:function(el){
         return el===this.password
      },
      message:'Password is not the same !'
    }
  },
  passwordChangedDate:{
    type:Date,
    default:Date.now()
  },
  active:{
    type:Boolean,
    default:true,
    select:false
  }
})

// document middleware
userSchema.pre('save',async function(next){
  if(!this.isModified('password')) return next()

  this.password=await bcrypt.hash(this.password,12)
  this.passwordConfirm=undefined
  next()
})

const User=mongoose.model('user',userSchema)
module.exports=User