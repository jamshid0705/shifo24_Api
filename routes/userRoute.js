const express=require('express')
const route = express.Router();
const authController=require('../controllers/authController')

route.post('/signup',authController.signup)
// route.post('/login',authController.login)

module.exports=route