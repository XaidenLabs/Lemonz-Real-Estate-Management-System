const Property = require("../models/property.model");

const ONE_MONTH = 1 * 30 * 24 * 60 * 60 * 1000;
const TWO_MONTHS = 2 * 30 * 24 * 60 * 60 * 1000;
const THREE_MONTHS = 3 * 30 * 24 * 60 * 60 * 1000;

const durations = {
  "1_MONTH": ONE_MONTH,
  "2_MONTHS": TWO_MONTHS,
  "3_MONTHS": THREE_MONTHS,
};

const startPayment = async (req, res) => {
  try {
    const duration = req.body.duration;
    const propertyId = req.params.id;
    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({
        status: "error",
        message: "Property not found",
      });
    }

    if (property.isOnAdvertisement) {
      return res.status(404).json({
        status: "error",
        message: "This property currently on a paid advertisement sponsorship",
      });
    }

    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + durations[duration]);

    property.isOnAdvertisement = true;
    property.advertisementStartDate = startDate;
    property.advertisementEndDate = endDate;

    await property.save();

    console.log("Advertisement sponsorship started successfully");

    return res.status(200).json({
      status: "success",
      message: "Advertisement sponsorship period started successfully",
      data: {
        advertisementStartDate: startDate,
        advertisementEndDate: endDate,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "error",
      message: error.message || "Failed to start advertisement sponsorship",
    });
  }
};

const checkAdvertisementStatus = async (req, res) => {
  try {
    const propertyId = req.params.id;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        status: "error",
        message: "Property not found",
      });
    }

    const now = new Date();
    let status = "inactive";
    let daysRemaining = 0;
    let endDate = null;

    if (property.isOnAdvertisement && property.advertisementEndDate > now) {
      status = "paid";
      endDate = property.advertisementEndDate;
      daysRemaining = Math.ceil(
        (property.advertisementEndDate - now) / (1000 * 60 * 60 * 24),
      );
    }

    return res.status(200).json({
      status: "success",
      data: {
        advertisementStatus: status,
        daysRemaining,
        endDate,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

module.exports = {
  startPayment,
  checkAdvertisementStatus,
};
