const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    email:    { type: String, unique: true, sparse: true, lowercase: true },
    phone:    { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    role:     { type: String, enum: ["customer", "worker", "admin"], default: "customer" },
    address:  { type: String },
    location: {
      type:        { type: String, default: "Point" },
      coordinates: { type: [Number], default: [0, 0] },
    },
    avatar:             { type: String, default: "" },
    isVerified:         { type: Boolean, default: false },
    otp:                { type: String },
    otpExpire:          { type: Date },
    wallet:             { type: Number, default: 0 },
    isActive:           { type: Boolean, default: true },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("User", UserSchema);
```

---

### GitHub pe karo:

**"Add file"** → **"Create new file"** → Name mein likho:
```
models/User.js
