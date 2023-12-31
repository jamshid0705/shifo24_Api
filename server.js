const mongoose=require('mongoose')
const dotenv = require('dotenv');

process.on('uncaughtException',(err)=>{
  console.log('Uncaught Exception Error ...')
  console.log(err.name,err.message)
  process.exit()
})

dotenv.config({ path: './config.env' });
const app=require('./app')

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
// console.log(DB)
mongoose
  .connect(DB, {
    // useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
  })
  .then(() => {
    console.log('DB connected successfully!');
  })
  // .catch((err) => {
  //   console.log('Databasega bog\'lanishda xatolik!',err);
  // });

const PORT = process.env.PORT || 8000;

const server=app.listen(PORT, () => {
  console.log(`${PORT} port`);
});

process.on('unhandledRejection',err=>{
  console.log('Unhandled Rejection Error...')
  console.log(err.name)
  server.close(()=>{
    process.exit(1)
  })
});

