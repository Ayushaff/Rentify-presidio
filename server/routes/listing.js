const router = require("express").Router();
const multer = require("multer");

const Listing = require("../models/Listing");
const User = require("../models/User")

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

/* CREATE LISTING */
router.post("/create", upload.array("listingPhotos"), async (req, res) => {
  try {
    /* Take the information from the form */
    const {
      creator,
      category,
      type,
      streetAddress,
      aptSuite,
      city,
      province,
      country,
      guestCount,
      bedroomCount,
      bedCount,
      bathroomCount,
      amenities,
      title,
      description,
      highlight,
      highlightDesc,
      price,
    } = req.body;

    const listingPhotos = req.files

    if (!listingPhotos) {
      return res.status(400).send("No file uploaded.")
    }

    const listingPhotoPaths = listingPhotos.map((file) => file.path)

    const newListing = new Listing({
      creator,
      category,
      type,
      streetAddress,
      aptSuite,
      city,
      province,
      country,
      guestCount,
      bedroomCount,
      bedCount,
      bathroomCount,
      amenities,
      listingPhotoPaths,
      title,
      description,
      highlight,
      highlightDesc,
      price,
    })

    await newListing.save()

    res.status(200).json(newListing)
  } catch (err) {
    res.status(409).json({ message: "Fail to create Listing", error: err.message })
    console.log(err)
  }
});

/* GET lISTINGS BY CATEGORY */
router.get("/", async (req, res) => {
  const qCategory = req.query.category;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    let listings;
    const query = qCategory ? { category: qCategory } : {};

    listings = await Listing.find(query)
      .populate("creator")
      .skip((page - 1) * limit)
      .limit(limit);

    const totalListings = await Listing.countDocuments(query);
    const totalPages = Math.ceil(totalListings / limit);

    res.status(200).json({ listings, totalPages });
  } catch (err) {
    res.status(500).json({ message: "Fail to fetch listings", error: err.message });
    console.log(err);
  }
});

/* GET LISTINGS BY listed*/


router.get("/search/:search", async (req, res) => {
  const { search } = req.params;
  const page = parseInt(req.query.page) || 1; // Default to page 1 if not specified
  const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page

  try {
    let query = {};

    // Modify the query based on the search term
    if (search !== "all") {
      query = {
        $or: [
          { category: { $regex: search, $options: "i" } },
          { title: { $regex: search, $options: "i" } },
        ],
      };
    }

    // Get total count of listings matching the search criteria
    const totalListingsCount = await Listing.countDocuments(query);

    // Calculate total number of pages
    const totalPages = Math.ceil(totalListingsCount / limit);

    // Fetch paginated listings based on the query and pagination parameters
    const listings = await Listing.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("creator");

    // Return paginated listings and total number of pages in the response
    res.status(200).json({ listings, totalPages });
  } catch (err) {
    // Handle errors
    res.status(500).json({ message: "Failed to fetch listings", error: err.message });
    console.error("Error fetching listings:", err);
  }
});

/* LISTING DETAILS */
router.get("/:listingId", async (req, res) => {
  try {
    const { listingId } = req.params
    console.log("listingId in back", listingId)
    const listing = await Listing.findById(listingId).populate("creator")
    res.status(202).json(listing)
  } catch (err) {
    res.status(404).json({ message: "Listing can not found!", error: err.message })
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
    if (req.files && req.files.length > 0) {
      // Append new photo paths to the existing ones
      updatedListing.listingPhotoPaths.push(...req.files.map((file) => file.path));
    }

    // Save the updated listing
    listing = await Listing.findByIdAndUpdate(listingId, updatedListing, { new: true });

    res.status(200).json(listing);
  } catch (err) {
    res.status(500).json({ message: "Failed to update listing", error: err.message });
  }
});


/* DELETE LISTING */
router.delete("/:listingId", async (req, res) => {
  try {
    const { listingId } = req.params;
    const { creator } = req.body;
    console.log("creator", creator)

    // Find the listing by ID
    const listing = await Listing.findById(listingId);
   console.log("listing", listing)
   console.log("listingId", listingId)

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    // Check if the user is the creator of the listing
    if (listing.creator.toString() !== creator) {
      console.log("listing.creator", listing.creator)
      return res.status(401).json({ message: "Unauthorized to delete this listing" });
    }``

    // Delete the listing
    await Listing.findByIdAndDelete(listingId);

    res.status(200).json({ message: "Listing deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete listing", error: err.message });
  }
});

router.delete('/delete-photo/:listingId', async (req, res) => {
  const { listingId } = req.params;
  const { photoPath } = req.body;

  try {
    // Find the listing by ID
    const listing = await Listing.findById(listingId);

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Remove the photoPath from the listing's listingPhotoPaths array
    listing.listingPhotoPaths = listing.listingPhotoPaths.filter(path => path !== photoPath);

    // Save the updated listing
    await listing.save();

    res.status(200).json({ message: 'Photo deleted successfully' });
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router
