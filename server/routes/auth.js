const express = require('express');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const Otp = require('../models/Otp');

const router = express.Router();

const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, 
  max: 3,
  message: { error: 'Too many OTP requests, please try again after 10 minutes' },
  keyGenerator: (req, res) => req.body.email || req.ip // Enforce limit per email
});

router.post('/request-otp', otpLimiter, async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: name || email.split('@')[0],
        email: email,
        role: 'student'
      });
      console.log(`New user auto-registered: ${user.name} (${email})`);
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    await Otp.create({ email, otp: otpCode });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS  
      }
    });

    const mailOptions = {
      from: '"Campus Desk" <no-reply@campusdesk.com>',
      to: email,
      subject: 'Your Campus Desk Login OTP',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px; margin: auto; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #4f46e5;">Campus Desk Login</h2>
          <p>Hello ${user.name},</p>
          <p>Here is your one-time password (OTP) to securely log in:</p>
          <h1 style="background: #f8fafc; padding: 10px; text-align: center; letter-spacing: 5px; border-radius: 4px; color: #0f172a;">${otpCode}</h1>
          <p style="color: #64748b; font-size: 12px;">This code will expire in 5 minutes. Do not share it with anyone.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    
    console.log(`\n✉️  Real OTP email successfully sent to: ${email}\n`);

    res.status(200).json({ message: 'OTP sent to your email.' });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ error: 'Failed to process request or send email.' });
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const validOtp = await Otp.findOne({ email, otp });
    
    if (!validOtp) return res.status(401).json({ error: 'Invalid or expired OTP' }); 
    
    const user = await User.findOne({ email });
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );
    
    await Otp.deleteOne({ _id: validOtp._id });
    
    res.status(200).json({ token, user: { id: user._id, name: user.name, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;