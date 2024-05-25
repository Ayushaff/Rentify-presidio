const router = require("express").Router()

const Booking = require("../models/Booking")
const User = require("../models/User")
const Listing = require("../models/Listing");
const multer = require("multer");
/* Configuration Multer for File Upload */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/"); // Store uploaded files in the 'uploads' folder
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Use the original file name
  },
});
const upload = multer({ storage });

/* GET TRIP LIST */
router.get("/:userId/trips", async (req, res) => {
  try {
    const { userId } = req.params
    const trips = await Booking.find({ customerId: userId }).populate("customerId hostId listingId")
    res.status(202).json(trips)
  } catch (err) {
    console.log(err)
    res.status(404).json({ message: "Can not find trips!", error: err.message })
  }
})

/* ADD LISTING TO WISHLIST */
router.patch("/:userId/:listingId", async (req, res) => {
  try {
    const { userId, listingId } = req.params
    console.log(userId, listingId)
    const user = await User.findById(userId)
    const listing = await Listing.findById(listingId).populate("creator")

    const favoriteListing = user.wishList.find((item) => item._id?.toString() === listingId)

    if (favoriteListing) {
      user.wishList = user.wishList.filter((item) => item._id.toString() !== listingId)
      await user.save()
      res.status(200).json({ message: "Listing is removed from wish list", wishList: user.wishList})
    } else {
      user.wishList.push(listing)
      await user.save()
      res.status(200).json({ message: "Listing is added to wish list", wishList: user.wishList})
    }
  } catch (err) {
    console.log(err)
    res.status(404).json({ error: err.message })
  }
})

/* GET PROPERTY LIST */
router.get("/:userId/properties", async (req, res) => {
  try {
    const { userId } = req.params
    const properties = await Listing.find({ creator: userId }).populate("creator")
    res.status(202).json(properties)
  } catch (err) {
    console.log(err)
    res.status(404).json({ message: "Can not find properties!", error: err.message })
  }
})

/* GET RESERVATION LIST */
router.get("/:userId/reservations", async (req, res) => {
  try {
    const { userId } = req.params
    const reservations = await Booking.find({ hostId: userId }).populate("customerId hostId listingId")
    res.status(202).json(reservations)
  } catch (err) {
    console.log(err)
    res.status(404).json({ message: "Can not find reservations!", error: err.message })
  }
})


/* UPDATE LISTING */
router.put("/update/:listingId", upload.array("listingPhotos"), async (req, res) => {
  try {
    const { listingId } = req.params;

    // Find the listing by ID
    let listing = await Listing.findById(listingId);

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    // Check if the user is the creator of the listing
    if (listing.creator.toString() !== req.body.creator) {
      return res.status(401).json({ message: "Unauthorized to update this listing" });
    }

    // Update listing details
    const updatedListing = {
      ...listing.toObject(),
      ...req.body,
    };

    // Update listing photos if new ones are provided
    if (req.files) {
      updatedListing.listingPhotoPaths = req.files.map((file) => file.path);
    }

    // Save the updated listing
    listing = await Listing.findByIdAndUpdate(listingId, updatedListing, { new: true });

    res.status(200).json(listing);
  } catch (err) {
    res.status(500).json({ message: "Failed to update listing", error: err.message });
  }
});

/* DELETE LISTING */
router.delete("/delete/:listingId", async (req, res) => {
  try {
    const { listingId } = req.params;

    // Find the listing by ID
    const listing = await Listing.findById(listingId);

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    // Check if the user is the creator of the listing
    if (listing.creator.toString() !== req.body.creator) {
      return res.status(401).json({ message: "Unauthorized to delete this listing" });
    }

    // Delete the listing
    await Listing.findByIdAndDelete(listingId);

    res.status(200).json({ message: "Listing deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete listing", error: err.message });
  }
});


module.exports = router
