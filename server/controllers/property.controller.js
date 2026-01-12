const { isValidObjectId } = require("mongoose");
const User = require("../models/user.model");
const Property = require("../models/property.model");

const uploadProperty = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      status,
      price,
      currency,
      country,
      images,
      video,
      document,
      coordinates,
      documentType,
    } = req.body;

    const agentId = req.user._id;
    if (!isValidObjectId(agentId)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const agent = await User.findById(agentId);
    if (!agent) {
      return res.status(404).json({ message: "Agent Details not found" });
    }

    const property = await Property.create({
      title,
      description,
      category,
      status,
      price,
      currency,
      country,
      images,
      video,
      agentId,
      agentName: `${agent.lastName} ${agent.firstName}`,
      agentContact: agent.mobileNumber,
      companyName: agent.companyName,
      agentProfilePicture: agent.profilePicture,
      document,
      documentType,
      coordinates: {
        latitude: coordinates.lat,
        longitude: coordinates.lng,
      },
    });

    return res
      .status(201)
      .json({ message: "Property upload successful", property });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "An error occurred while adding property",
    });
  }
};

const getProperties = async (req, res) => {
  try {
    const id = req.user._id;

    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * 10;

    const agentProperties = await Property.find({ agentId: id }).sort({
      createdAt: -1,
    });
    let agentRentProperties = await Property.find({
      agentId: id,
      status: "Rent",
    });
    let agentLeaseProperties = await Property.find({
      agentId: id,
      status: "Lease",
    });
    let agentSaleProperties = await Property.find({
      agentId: id,
      status: "Sale",
    });

    const totalPropertiesCount = await Property.countDocuments();

    const properties = await Property.find()
      .sort({ isOnAdvertisement: -1, _id: 1 })
      .skip(skip)
      .limit(10);
    let rentProperties = await Property.find({ status: "Rent" }).limit(10);
    let leaseProperties = await Property.find({ status: "Lease" }).limit(10);
    let saleProperties = await Property.find({ status: "Sale" }).limit(10);
    let sponsoredProperties = await Property.find({
      isOnAdvertisement: true,
    }).limit(10);

    let lands = await Property.find({ category: "Land" }).limit(10);
    let houses = await Property.find({ category: "Houses" }).limit(10);
    let shopSpaces = await Property.find({ category: "Shop Spaces" }).limit(10);
    let officeBuildings = await Property.find({
      category: "Office Building",
    }).limit(10);
    let industrialBuildings = await Property.find({
      category: "Industrial Building",
    }).limit(10);

    const shuffleArray = (array) => array.sort(() => Math.random() - 0.5);

    sponsoredProperties = shuffleArray(sponsoredProperties);
    rentProperties = shuffleArray(rentProperties);
    leaseProperties = shuffleArray(leaseProperties);
    saleProperties = shuffleArray(saleProperties);
    lands = shuffleArray(lands);
    houses = shuffleArray(houses);
    shopSpaces = shuffleArray(shopSpaces);
    officeBuildings = shuffleArray(officeBuildings);
    industrialBuildings = shuffleArray(industrialBuildings);

    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const newListings = await Property.find({
      createdAt: { $gte: oneMonthAgo },
    }).limit(10);

    // --- Analytics Logic ---
    const months = 6;
    const now = new Date();
    const analyticsLabels = [];
    const revenueData = new Array(months).fill(0);
    const engagementData = new Array(months).fill(0);

    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = d.toLocaleString("default", { month: "short" });
      analyticsLabels.push(monthName);
    }

    let totalRevenue = 0;

    agentProperties.forEach((prop) => {
      const date = new Date(prop.createdAt); // Using createdAt as proxy for transaction for now, ideally strictly use UpdatedAt if status changed to Taken
      const monthDiff =
        (now.getFullYear() - date.getFullYear()) * 12 +
        (now.getMonth() - date.getMonth());

      if (prop.isTaken) {
        totalRevenue += prop.price;
        if (monthDiff < months && monthDiff >= 0) {
          revenueData[months - 1 - monthDiff] += prop.price;
        }
      }

      if (monthDiff < months && monthDiff >= 0) {
        engagementData[months - 1 - monthDiff] += prop.views + prop.videoViews;
      }
    });
    // --- End Analytics Logic ---

    const totalPages = Math.ceil(totalPropertiesCount / 10);

    return res.status(200).json({
      agentProperties,
      agentRentProperties,
      agentLeaseProperties,
      agentSaleProperties,
      properties,
      rentProperties,
      leaseProperties,
      saleProperties,
      sponsoredProperties,
      lands,
      houses,
      shopSpaces,
      officeBuildings,
      industrialBuildings,
      newListings,
      numberOfProperties: totalPropertiesCount,
      currentPage: page,
      totalPages,
      analytics: {
        labels: analyticsLabels,
        revenue: revenueData,
        engagement: engagementData,
        totalRevenue,
      },
    });
  } catch (error) {
    console.error("Error in getProperties:", error);
    return res.status(500).json({ message: "An error occurred" });
  }
};

const getProperty = async (req, res) => {
  try {
    const propertyId = req.params.id;

    const isValidId = isValidObjectId(propertyId);

    if (!isValidId) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    let property = await Property.findById(propertyId);

    // hide documents for client (buyer) role unless property.isDocumentPublic is true
    if (req.user && req.user.role === "buyer") {
      await Property.findByIdAndUpdate(
        propertyId,
        { $inc: { views: 1 } },
        { new: true }
      ).lean();

      if (property) {
        // remove documents and documentTypes from response
        const propObj = property.toObject();
        delete propObj.documents;
        delete propObj.documentTypes;
        property = propObj;
      }
    }

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Attach some agent metrics and verification flag so frontend can show badges
    try {
      const agentId = property.agentId;
      if (agentId) {
        const agent = await User.findById(agentId).select("isVerified").lean();
        const completedCount = await Property.countDocuments({
          agentId,
          isTaken: true,
        });

        // ensure property is a plain object
        const propObj =
          typeof property.toObject === "function"
            ? property.toObject()
            : { ...property };
        propObj.agentIsVerified = !!(agent && agent.isVerified);
        propObj.agentCompletedSalesCount = Number(completedCount || 0);
        property = propObj;
      }
    } catch (e) {
      // don't fail the whole request if metrics fail; just continue
      console.warn("getProperty: agent metrics attach failed", e?.message || e);
    }

    return res.status(200).json({ property });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "An error occurred" });
  }
};

const updateProperty = async (req, res) => {
  try {
    const propertyId = req.params.id;
    const {
      title,
      description,
      category,
      status,
      price,
      currency,
      location,
      images,
      video,
      document,
    } = req.body;

    const isValidId = isValidObjectId(propertyId);

    if (!isValidId) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    if (
      !title ||
      !description ||
      !category ||
      !status ||
      !price ||
      !currency ||
      !location ||
      images.length === 0 ||
      !video ||
      !document
    ) {
      const property = await Property.findByIdAndUpdate(
        propertyId,
        {
          $push: { savedBy: req.user._id },
        },
        { new: true }
      );

      return res
        .status(200)
        .json({ message: "Property saved successfully", property });
    }

    const property = await Property.findByIdAndUpdate(
      propertyId,
      {
        title,
        description,
        category,
        status,
        price,
        currency,
        location,
        images,
        video,
        document,
      },
      { new: true }
    );

    return res
      .status(200)
      .json({ message: "Property updated successfully", property });
  } catch (error) {
    return res.status(500).json({ message: "An error occurred" });
  }
};

const toggleSaveProperty = async (req, res) => {
  try {
    const propertyId = req.params.id;
    const userId = req.user && req.user._id;
    if (!isValidObjectId(propertyId))
      return res.status(400).json({ success: false, message: "Invalid ID" });
    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });

    // Check if user already saved
    const prop = await Property.findById(propertyId).select("savedBy").lean();
    if (!prop)
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });

    const alreadySaved = (prop.savedBy || []).some(
      (id) => id.toString() === userId.toString()
    );

    let updated;
    if (!alreadySaved) {
      // add user to savedBy and increment savedCount
      updated = await Property.findByIdAndUpdate(
        propertyId,
        { $addToSet: { savedBy: userId }, $inc: { savedCount: 1 } },
        { new: true }
      );
      return res.status(200).json({
        success: true,
        message: "Property saved",
        property: updated,
        saved: true,
      });
    } else {
      // remove user and decrement savedCount (min 0)
      updated = await Property.findByIdAndUpdate(
        propertyId,
        { $pull: { savedBy: userId }, $inc: { savedCount: -1 } },
        { new: true }
      );

      // If savedCount became negative (rare), correct it
      if (updated.savedCount < 0) {
        updated.savedCount = 0;
        await updated.save();
      }

      return res.status(200).json({
        success: true,
        message: "Property unsaved",
        property: updated,
        saved: false,
      });
    }
  } catch (err) {
    console.error("toggleSaveProperty error:", err);
    return res.status(500).json({
      success: false,
      message: "Error toggling saved state",
      error: err.message,
    });
  }
};

const incrementVideoView = async (req, res) => {
  try {
    const propertyId = req.params.id;
    if (!isValidObjectId(propertyId))
      return res.status(400).json({ success: false, message: "Invalid ID" });

    const updated = await Property.findByIdAndUpdate(
      propertyId,
      { $inc: { videoViews: 1 } },
      { new: true }
    ).lean();
    if (!updated)
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });

    return res.status(200).json({
      success: true,
      message: "Video view recorded",
      property: updated,
    });
  } catch (err) {
    console.error("incrementVideoView error:", err);
    return res.status(500).json({
      success: false,
      message: "Error recording video view",
      error: err.message,
    });
  }
};

const searchProperty = async (req, res) => {
  try {
    // support queries: q (general query), location, category, status, minPrice, maxPrice
    const { q, location, category, status, minPrice, maxPrice } = req.query;

    const query = {};

    if (q) {
      // search across title and description
      query.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }

    if (location) {
      // location may match country or coordinates-related text fields
      query.$or = query.$or || [];
      query.$or.push({ country: { $regex: location, $options: "i" } });
      query.$or.push({
        "coordinates.latitude": { $regex: location, $options: "i" },
      });
    }

    if (category) {
      query.category = { $regex: category, $options: "i" };
    }

    if (status) {
      query.status = status;
    }

    const minPriceNumber = parseFloat(minPrice);
    const maxPriceNumber = parseFloat(maxPrice);
    if (!isNaN(minPriceNumber) || !isNaN(maxPriceNumber)) {
      query.price = {};
      if (!isNaN(minPriceNumber)) query.price.$gte = minPriceNumber;
      if (!isNaN(maxPriceNumber)) query.price.$lte = maxPriceNumber;
    }

    const properties = await Property.find(query);

    // strip documents for buyers
    const sanitized = properties.map((p) => {
      const po = p.toObject();
      if (req.user && req.user.role === "buyer" && !po.isDocumentPublic) {
        delete po.documents;
        delete po.documentTypes;
      }
      return po;
    });

    return res
      .status(200)
      .json({ count: sanitized.length, properties: sanitized });
  } catch (error) {
    res.status(500).json({ message: "An error occurred" });
  }
};

const getAgentMetrics = async (req, res) => {
  try {
    const agentId = req.user._id;

    const properties = await Property.find({ agentId }).select(
      "title savedBy views videoViews"
    );

    return res.status(200).json({ properties });
  } catch (error) {
    return res.status(500).json({ message: "An error occurred" });
  }
};

const getRecommendations = async (req, res) => {
  try {
    const user = req.user;
    let properties = [];

    if (user && user.preferences && user.preferences.length > 0) {
      // match category, title or description
      const prefRegexes = user.preferences.map((p) => ({
        $regex: p,
        $options: "i",
      }));
      properties = await Property.find({
        $or: [
          { category: { $in: user.preferences } },
          { title: { $in: user.preferences } },
          { description: { $in: user.preferences } },
        ],
      }).limit(50);
    } else {
      // fallback to trending properties sorted by likes + views
      properties = await Property.find()
        .sort({ likes: -1, videoViews: -1 })
        .limit(50);
    }

    // sanitize documents for buyers
    const sanitized = properties.map((p) => {
      const po = p.toObject();
      if (req.user && req.user.role === "buyer" && !po.isDocumentPublic) {
        delete po.documents;
        delete po.documentTypes;
      }
      return po;
    });

    return res.status(200).json({ properties: sanitized });
  } catch (error) {
    return res.status(500).json({ message: "An error occurred" });
  }
};

const deleteProperty = async (req, res) => {
  try {
    const propertyId = req.params.id;

    const isValidId = isValidObjectId(propertyId);

    if (!isValidId) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const property = await Property.findByIdAndDelete(propertyId);

    return res
      .status(200)
      .json({ message: "Property deleted successfully", property });
  } catch (error) {
    res.status(500).json({ message: "An error occurred" });
  }
};

module.exports = {
  uploadProperty,
  getProperties,
  getProperty,
  updateProperty,
  toggleSaveProperty,
  incrementVideoView,
  searchProperty,
  deleteProperty,
  getAgentMetrics,
  getRecommendations,
};
