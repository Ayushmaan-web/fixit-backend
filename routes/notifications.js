const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");

const notificationsDB = {};

const createNotif = (userId, data) => {
  if (!notificationsDB[userId]) notificationsDB[userId] = [];
  notificationsDB[userId].unshift({
    id: Date.now(), ...data, read: false, createdAt: new Date()
  });
};

router.get("/", protect, async (req, res) => {
  const notifs = notificationsDB[req.user._id] || [
    {
      id: 1,
      title: "Welcome to FixIt! 🎉",
      message: "Find trusted home service experts near you.",
      type: "info",
      read: false,
      createdAt: new Date(),
    },
  ];
  res.json({ success: true, count: notifs.filter(n => !n.read).length, notifications: notifs });
});

router.put("/read-all", protect, async (req, res) => {
  if (notificationsDB[req.user._id]) {
    notificationsDB[req.user._id] = notificationsDB[req.user._id].map(n => ({ ...n, read: true }));
  }
  res.json({ success: true, message: "All notifications marked as read." });
});

router.post("/send", protect, async (req, res) => {
  const { userId, title, message, type } = req.body;
  createNotif(userId, { title, message, type: type || "info" });
  res.json({ success: true, message: "Notification sent." });
});

module.exports = router;
module.exports.createNotif = createNotif;
```

---

### GitHub pe karo:

**"Add file"** → **"Create new file"** → Name mein likho:
```
routes/notifications.js
```
Code paste karo → **"Commit changes"** ✅

---

### 🎉 Saari files complete ho gayi!
```
✅ config/db.js
✅ middleware/auth.js
✅ models/User.js
✅ models/Provider.js
✅ models/Booking.js
✅ models/Review.js
✅ routes/auth.js
✅ routes/providers.js
✅ routes/bookings.js
✅ routes/reviews.js
✅ routes/notifications.js
✅ server.js
✅ package.json
✅ .env.example
