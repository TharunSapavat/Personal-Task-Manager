const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const User=require('../models/UserModel');

const register=async (req,res)=>{
     try{
        const {name,email,password}=req.body;
        if(!name || !email || !password){
            return res.status(400).json({message:'All fields are required'});
        }
        const existingUser=await User.findOne({email:email});
        if(existingUser){
            return res.status(400).json({message:'User already exists'});
        }
        const hashedPassword=await bcrypt.hash(password,10);

        const newUser = await User.create({
            name:name,
            email:email,
            passwordHash:hashedPassword,
        });

        const token=jwt.sign({userId:newUser._id},process.env.JWT_KEY,{expiresIn:'7d'});

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email
            }
        });

     }
     catch(err){
        console.error('Registration error:', err);
        res.status(500).json({message:"Server Error", error: err.message});
     }
}
const login=async(req,res)=>{
    try{
        const {email,password}=req.body;
        if(!email || !password){
            return res.status(400).json({message:'All fields are required'});
        }
        const user=await User.findOne({email}).select('+passwordHash');
        if(!user){
            return res.status(400).json({message:'Invalid credentials'});
        }
        const isPasswordValid=await bcrypt.compare(password,user.passwordHash);
        if(!isPasswordValid){
            return res.status(400).json({message:'Invalid credentials'});
        }
        const token=jwt.sign({userId:user._id},process.env.JWT_KEY,{expiresIn:'7d'});

        // Check if this is first login (award Fresh Start achievement)
        if (!user.achievements || user.achievements.length === 0) {
            user.achievements = [{
                badgeId: 'fresh_start',
                unlockedAt: new Date(),
                notified: false
            }];
            user.achievementPoints = 5;
            user.profileLevel = 'bronze';
            await user.save();
        }

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    }
    catch(err){
        console.error('Login error:', err);
        res.status(500).json({message:"Server Error", error: err.message});
    }
}

const changePassword = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters long'
            });
        }

        // Get user with password
        const user = await User.findById(userId).select('+passwordHash');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.passwordHash = hashedPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (err) {
        console.error('Change password error:', err);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: err.message
        });
    }
};


module.exports={register,login,changePassword};