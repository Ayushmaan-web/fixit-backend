const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const Provider = require("../models/Provider");
const { protect, authorize } = require("../middleware/auth");

const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

router.post("/", protect, authorize("customer"), async (req, res) => {
  try {
    const { providerId, serviceCategory, problemDescription, address, scheduledDate, scheduledTime, paymentMethod, lat, lng } = req.body;
    const provider = await Provider.findById(providerId);
    if (!provider) return res.status(404).json({ success: false, message: "Provider not found." });
    if (!provider.isAvailable) return res.status(400).json({ success: false, message: "Provider not available." });

    const basePrice = provider.pricePerService;
    const platformFee = 50;
    const gst = Math.round((basePrice + platformFee) * 0.18);
    const totalAmount = basePrice + platformFee + gst;
    const otp = generateOTP();

    const booking = await Booking.create({
      customer: req.user._id, provider: providerId,
      serviceCategory, problemDescription, address,
      location: { type: "Point", coordinates: [parseFloat(lng) || 0, parseFloat(lat) || 0] },
      scheduledDate: new Date(scheduledDate), scheduledTime,
      paymentMethod: paymentMethod || "upi",
      basePrice, platformFee, gst, totalAmount,
      priceBreakdown: [
        { label: "Base Service Charge", amount: basePrice },
        { label: "Platform Fee", amount: platformFee },
        { label: "GST (18%)", amount: gst },
      ],
      otp, status: "pending",
    });

    res.status(201).json({ success: true, message: "Booking created!", booking: { ...booking.toObject(), otp } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/my", protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ customer: req.user._id })
      .populate("provider", "name serviceCategory rating pricePerService")
      .sort({ createdAt: -1 });
    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/worker", protect, authorize("worker"), async (req, res) => {
  try {
    const provider = await Provider.findOne({ user: req.user._id });
    if (!provider) return res.status(404).json({ success: false, message: "Provider not found." });
    const bookings = await Booking.find({ provider: provider._id })
      .populate("customer", "name phone address")
      .sort({ createdAt: -1 });
    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put("/:id/accept", protect, authorize("worker"), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found." });
    booking.status = "accepted";
    await booking.save();
    res.json({ success: true, message: "Booking accepted!", booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put("/:id/cancel", protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found." });

    const { reason } = req.body;
    const cancelledBy = req.user.role === "worker" ? "worker" : "customer";
    let penalty = 0;

    if (cancelledBy === "worker") {
      penalty = 100;
      const provider = await Provider.findById(booking.provider);
      if (provider) {
        provider.cancelledJobs += 1;
        provider.cancellationPenalty += penalty;
        provider.rankScore = Math.max(0, provider.rankScore - 10);
        provider.isPriority = provider.rankScore >= 80;
        await provider.save();
      }
    }

    booking.status = "cancelled";
    booking.cancelledBy = cancelledBy;
    booking.cancellationReason = reason;
    booking.cancellationTime = new Date();
    booking.penaltyApplied = penalty;
    await booking.save();

    res.json({ success: true, message: "Booking cancelled.", penaltyApplied: penalty, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put("/:id/verify-otp", protect, authorize("worker"), async (req, res) => {
  try {
    const { otp } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found." });
    if (booking.otp !== otp) return res.status(400).json({ success: false, message: "Invalid OTP." });
    booking.status = "in_progress";
    booking.otpVerified = true;
    booking.actualArrivalTime = new Date();
    await booking.save();
    res.json({ success: true, message: "OTP verified! Service started.", booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put("/:id/complete", protect, authorize("worker"), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found." });
    booking.status = "completed";
    booking.completedAt = new Date();
    booking.paymentStatus = "paid";
    await booking.save();

    const provider = await Provider.findById(booking.provider);
    if (provider) {
      provider.completedJobs += 1;
      provider.totalEarnings += booking.totalAmount * 0.85;
      provider.monthlyEarnings += booking.totalAmount * 0.85;
      provider.rankScore = Math.min(100, provider.rankScore + 2);
      provider.isPriority = provider.rankScore >= 80;
      await provider.save();
    }
    res.json({ success: true, message: "Service completed!", booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/:id/sos", protect, authorize("customer"), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found." });
    booking.sosTriggered = true;
    booking.sosTime = new Date();
    await booking.save();
    console.log(`🚨 SOS TRIGGERED for booking ${req.params.id}`);
    res.json({ success: true, message: "SOS Alert sent!" });
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
routes/bookings.js
