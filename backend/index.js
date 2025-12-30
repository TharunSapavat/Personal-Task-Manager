const express=require('express');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const mongoose=require('mongoose');
const cors=require('cors');
const cookieParser=require('cookie-parser');


const app=express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors());
app.use(cookieParser());
const dotenv=require('dotenv');
dotenv.config();

const PORT=process.env.PORT||4000;
const DB_URL=process.env.DB_URL;
const JWTKEY=process.env.JWT_KEY;

mongoose.connect(DB_URL)
.then(()=>{
    console.log("Connected to DB");
    app.listen(PORT,()=>{
        console.log(`Server is running on port ${PORT}`);
    })
})
.catch(err=>{
    console.log("Error connecting to DB",err);
});


app.get('/',(req,res)=>{
    res.status(200).send("Personal Task Manager Backend is running");
})

