const { isValidObjectId } = require("mongoose");
const User = require("../models/user.model");
const Review = require("../models/review.model");
const Property = require("../models/property.model");

const createReview = async (req, res) => {
  try {
    const { text, rating, propertyId } = req.body;
    const userId = req.user._id;

    if (!isValidObjectId(propertyId)) {
      return res.status(400).json({ message: "Invalid property Id" });
    }

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: "Invalid user Id" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const review = await Review.create({
      text,
      userProfilePicture: user.profilePicture,
      userName: `${user.lastName} ${user.firstName}`,
      propertyId,
      rating,
      replies: [],
    });

    if (!review) {
      return res.status(400).json({ message: "Could not post review" });
    }

    // update proprietor aggregates (avgRating, ratingsCount)
    try {
      const property = await Property.findById(propertyId).select("agentId");
      if (property && property.agentId) {
        const agentId = property.agentId;
        // compute new aggregates
        const reviewsForAgent = await Review.find({ propertyId });
        const ratings = reviewsForAgent.map((r) => r.rating || 0);
        const ratingsCount = ratings.length;
        const avgRating =
          ratingsCount > 0
            ? ratings.reduce((a, b) => a + b, 0) / ratingsCount
            : 0;

        await User.findByIdAndUpdate(agentId, { avgRating, ratingsCount });
      }
    } catch (err) {
      console.error("Error updating agent aggregates:", err.message || err);
    }

    return res.status(201).json({ message: "Review posted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "An error occurred" });
  }
};

const getReviews = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const reviews = await Review.find({ propertyId });

    if (!reviews) {
      return res.status(404).json({ message: "No reviews available" });
    }

    return res.status(200).json({ reviews });
  } catch (error) {
    return res.status(500).json({ message: "An error occurred" });
  }
};

module.exports = {
  createReview,
  getReviews,
};
