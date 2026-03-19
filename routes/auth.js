const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect } = require("../middleware/auth");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

router.post("/register", async (req, res) => {
  try {
    const { name, phone, email, password, role } = req.body;
    if (!name || !phone || !password)
      return res.status(400).json({ success: false, message: "Name, phone & password required." });

    const existingUser = await User.findOne({ phone });
    if (existingUser)
      return res.status(400).json({ success: false, message: "Phone already registered." });

    const otp = generateOTP();
    const user = await User.create({
      name, phone, email, password,
      role: role || "customer",
      otp,
      otpExpire: Date.now() + 10 * 60 * 1000,
    });

    console.log(`📱 OTP for ${phone}: ${otp}`);
    res.status(201).json({ success: true, message: "OTP sent.", userId: user._id, otp });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { userId, otp } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    if (user.otp !== otp) return res.status(400).json({ success: false, message: "Invalid OTP." });
    if (user.otpExpire < Date.now()) return res.status(400).json({ success: false, message: "OTP expired." });

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    const token = generateToken(user._id);
    res.json({ success: true, message: "Verified!", token,
      user: { id: user._id, name: user.name, phone: user.phone, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password)
      return res.status(400).json({ success: false, message: "Phone and password required." });

    const user = await User.findOne({ phone });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success: false, message: "Invalid credentials." });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    console.log(`📱 Login OTP for ${phone}: ${otp}`);
    res.json({ success: true, message: "OTP sent.", userId: user._id, otp });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/me", protect, async (req, res) => {
  res.json({ success: true, user: req.user });
});

router.post("/resend-otp", async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    res.json({ success: true, message: "OTP resent.", otp });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
```

---

### GitHub pe karo:

**"Add file"** → **"Create new file"** → Name mein likho:
```
routes/auth.js
