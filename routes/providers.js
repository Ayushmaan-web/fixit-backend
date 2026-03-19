const express = require("express");
const router = express.Router();
const Provider = require("../models/Provider");
const { protect, authorize } = require("../middleware/auth");

router.get("/", async (req, res) => {
  try {
    const { category, lat, lng, maxDistance = 10000, minRating, sort } = req.query;
    let query = { approvalStatus: "approved", isAvailable: true };

    if (category) query.serviceCategory = category;
    if (minRating) query.rating = { $gte: parseFloat(minRating) };

    let providers;
    if (lat && lng) {
      providers = await Provider.find({
        ...query,
        location: {
          $near: {
            $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
            $maxDistance: parseInt(maxDistance),
          },
        },
      }).populate("user", "name phone avatar");
    } else {
      providers = await Provider.find(query).populate("user", "name phone avatar");
    }

    if (sort === "rating")      providers.sort((a, b) => b.rating - a.rating);
    if (sort === "price_low")   providers.sort((a, b) => a.pricePerService - b.pricePerService);
    if (sort === "price_high")  providers.sort((a, b) => b.pricePerService - a.pricePerService);
    if (sort === "punctuality") providers.sort((a, b) => b.punctualityScore - a.punctualityScore);

    res.json({ success: true, count: providers.length, providers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id).populate("user", "name phone avatar");
    if (!provider) return res.status(404).json({ success: false, message: "Provider not found." });
    res.json({ success: true, provider });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/register", protect, authorize("worker"), async (req, res) => {
  try {
    const { serviceCategory, skills, experience, pricePerService, bio, address, lat, lng } = req.body;
    const existing = await Provider.findOne({ user: req.user._id });
    if (existing) return res.status(400).json({ success: false, message: "Profile already exists." });

    const provider = await Provider.create({
      user: req.user._id,
      name: req.user.name,
      phone: req.user.phone,
      serviceCategory, skills, experience, pricePerService, bio,
      location: {
        type: "Point",
        coordinates: [parseFloat(lng) || 0, parseFloat(lat) || 0],
        address,
      },
    });
    res.status(201).json({ success: true, message: "Profile submitted for approval.", provider });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put("/availability", protect, authorize("worker"), async (req, res) => {
  try {
    const provider = await Provider.findOne({ user: req.user._id });
    if (!provider) return res.status(404).json({ success: false, message: "Provider not found." });
    provider.isAvailable = !provider.isAvailable;
    provider.isOnline = provider.isAvailable;
    await provider.save();
    res.json({ success: true, isAvailable: provider.isAvailable });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/dashboard/stats", protect, authorize("worker"), async (req, res) => {
  try {
    const provider = await Provider.findOne({ user: req.user._id });
    if (!provider) return res.status(404).json({ success: false, message: "Provider not found." });
    res.json({ success: true, stats: {
      totalEarnings: provider.totalEarnings,
      monthlyEarnings: provider.monthlyEarnings,
      completedJobs: provider.completedJobs,
      rating: provider.rating,
      punctualityScore: provider.punctualityScore,
      walletBalance: provider.walletBalance,
    }});
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
routes/providers.js
