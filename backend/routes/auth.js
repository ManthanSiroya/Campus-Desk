const express = require('express');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const Otp = require('../models/Otp');
const router = express.Router();
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, 
  max: 3,
  message: { error: 'Too many OTP requests, please try again after 10 minutes' }, 
});
router.post('/request-otp', otpLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    await Otp.create({ email, otp: otpCode });
    console.log(`\n🔑 OTP for ${email}: ${otpCode}\n`);
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
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