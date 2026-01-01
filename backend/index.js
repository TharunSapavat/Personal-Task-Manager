const express=require('express');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const mongoose=require('mongoose');
const cors=require('cors');
const cookieParser=require('cookie-parser');


const app=express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
const dotenv=require('dotenv');
dotenv.config();
app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://personal-task-manager-hwrhplrcn-tharunsapavats-projects.vercel.app',
        process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials:true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(cookieParser());


const PORT=process.env.PORT||4000;
const DB_URL=process.env.DB_URL;
const JWTKEY=process.env.JWT_KEY;

const authRoutes=require('./routes/auth');
const taskRoutes=require('./routes/taskRoutes');
const streakRoutes=require('./routes/streakRoutes');
const { startReminderScheduler } = require('./services/reminderScheduler');
const { startCustomReminderScheduler } = require('./services/customReminderScheduler');

mongoose.connect(DB_URL)
.then(()=>{
    console.log("Connected to DB");
    
    // Start email reminder scheduler
    startReminderScheduler();
    
    // Start custom task reminder scheduler
    startCustomReminderScheduler();

    
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

app.use('/api/auth',authRoutes);
app.use('/api/tasks',taskRoutes);
app.use('/api/streaks',streakRoutes);
