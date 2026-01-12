const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { isValidObjectId } = require("mongoose");
const emailService = require("../services/email.service");
const User = require("../models/user.model");
const Otp = require("../models/otp.model");
const { IDVerificationService } = require("../services/id-validation.service");
const paylukService = require("../services/payluk.service");

const createAccessToken = async (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: 360000 });
};

const register = async (req, res) => {
  try {
    const {
      propertiesOfInterest,
      lastName,
      firstName,
      middleName,
      companyName,
      currentAddress,
      country,
      mobileNumber,
      email,
      password,
      role,
      emergencyContact,
      // bank details (optional for buyers, required for agents)
      bankAccountNumber,
      bankAccountName,
      bankName,
      bankCode,
    } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: "This email exists already" });
    }

    if (role && role.includes("agent")) {
      // If agent/proprietor, require at least one emergency contact and consent
      if (!emergencyContact) {
        return res
          .status(400)
          .json({ message: "Agents must provide an emergency contact" });
      }
      // optional: validate that each emergency contact at least has name and phone
      const invalid =
        !emergencyContact.name ||
        !emergencyContact.phone ||
        !emergencyContact.email;
      if (invalid) {
        return res.status(400).json({
          message: "Emergency contact must have name, phone and email",
        });
      }
      // require bank details for agents so payouts can be performed
      if (!bankAccountNumber || !bankAccountName || !bankName || !bankCode) {
        return res.status(400).json({
          message:
            "Agents must provide bank details (account number, account name, bank name and bank code)",
        });
      }
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const userPayload = {
      propertiesOfInterest,
      profilePicture: "",
      lastName,
      firstName,
      middleName,
      companyName,
      currentAddress,
      country,
      mobileNumber,
      email,
      password: hashedPassword,
      role,
      emergencyContact,
      bankAccountNumber,
      bankAccountName,
      bankName,
      bankCode,
    };

    const user = await User.create(userPayload);

    if (!user) {
      return res.status(400).json({ message: "Could not save user's details" });
    }

    const userId = user._id;
    const accessToken = await createAccessToken(userId);

    // --- Payluk Integration (Lazy/Async) ---
    // Try to create customer on Payluk. If it fails (key 403), we just log it.
    // The user is already created locally, which is what matters most.
    try {
      const paylukId = await paylukService.createCustomer({
        firstName,
        lastName,
        email,
        phone: mobileNumber,
      });

      if (paylukId) {
        user.paylukCustomerId = paylukId;
        await user.save();
      }
    } catch (paylukErr) {
      console.error(
        "Registration: Payluk creation skipped:",
        paylukErr.message
      );
    }
    // ---------------------------------------

    return res.status(201).json({
      message: "Registration successful",
      accessToken,
      role: user.role,
      id: userId,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "An error occurred" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const userId = user._id;
    const accessToken = await createAccessToken(userId);

    sendLoginNotificationEmail(user.email);

    // --- Payluk Self-Healing on Login ---
    // If user is old and missed creation, or creation failed before, try again now.
    if (!user.paylukCustomerId) {
      // Run async, don't block login response
      (async () => {
        try {
          const paylukId = await paylukService.createCustomer({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.mobileNumber,
            bankAccountNumber: user.bankAccountNumber,
            bankCode: user.bankCode,
            bankName: user.bankName,
          });
          if (paylukId) {
            await User.findByIdAndUpdate(userId, {
              paylukCustomerId: paylukId,
            });
            console.log(
              `[Login Info] Auto-created Payluk Customer for ${user.email}`
            );
          }
        } catch (err) {
          console.warn(
            "[Login Warning] Payluk self-healing failed:",
            err.message
          );
        }
      })();
    }
    // ------------------------------------

    return res.status(200).json({
      message: "Login successful",
      accessToken,
      role: user.role,
      id: userId,
    });
  } catch (error) {
    return res.status(500).json({ message: "An error occurred" });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpires = new Date(Date.now() + 2 * 60 * 60 * 1000);

    const emailBody = `
      <h1>Otp Request</h1>
      <p>The otp you requested is ${otp} and it expires in 2 hours</p>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: "Otp Request",
      html: emailBody,
    };

    await emailService.sendMail(mailOptions);

    await Otp.create({ email, otp, otpExpires });

    return res.status(200).json({ message: "Otp sent successfully" });
  } catch (error) {
    return res.status(500).json({ message: "An error occurred" });
  }
};

const sendLoginNotificationEmail = async (email) => {
  try {
    const emailBody = `
      <h1>New login detected</h1>
      <p>We noticed a login to your account.</p>
      <p>If this was you, no action is required. If not, please change your password immediately.</p>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: "New Login to Your Account",
      html: emailBody,
    };

    await emailService.sendMail(mailOptions);
  } catch (error) {
    console.error("Login notification email error:", error.message || error);
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const otpRecord = await Otp.findOne({ email }).sort({ createdAt: -1 });
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User does not exist" });
    }

    const currentTime = new Date();
    const otpExpires = otpRecord.otpExpires;

    if (otpRecord.otp === otp && currentTime <= otpExpires) {
      otpRecord.otp = null;
      otpRecord.otpExpires = null;

      await otpRecord.save();

      return res
        .status(200)
        .json({ message: "OTP has been verified successfully" });
    } else {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }
  } catch (error) {
    return res.status(500).json({ message: "An error occurred" });
  }
};

const resetPassword = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(password, salt);

  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    { password: hashedPassword },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json({ message: "Password was reset successfully", user: updatedUser });
};

const updateUser = async (req, res) => {
  try {
    const id = req.user._id;

    const user = await User.findByIdAndUpdate(id, req.body, { new: true });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Could not update your profile details" });
    }

    return res
      .status(200)
      .json({ message: "You've updated your profile details successfully" });
  } catch (error) {
    return res.status(500).json({ message: "An error occurred" });
  }
};

const getUser = async (req, res) => {
  try {
    const id = req.user._id;

    const isValidId = isValidObjectId(id);

    if (!isValidId) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { password, ...userWithoutPassword } = user.toObject();

    return res.status(200).json({ user: userWithoutPassword });
  } catch (error) {
    return res.status(500).json({ message: "An error occurred" });
  }
};

const idVerification = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No ID provided",
      });
    }

    const countryCode = req.body.countryCode?.toUpperCase();
    const documentType = req.body.documentType?.toUpperCase();

    if (!countryCode) {
      return res.status(400).json({
        success: false,
        message: "Select a country",
      });
    }

    const verificationService = new IDVerificationService();

    const result = await verificationService.verifyDocument(
      req.file.buffer,
      countryCode,
      documentType
    );

    await User.findByIdAndUpdate(
      req.user._id,
      { isIdVerified: true },
      { new: true }
    );

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error during ID verification",
    });
  }
};

const verifyUser = async (req, res) => {
  try {
    // only admins can verify
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const userId = req.params.id;

    const userToVerify = await User.findById(userId);
    if (!userToVerify)
      return res.status(404).json({ message: "User not found" });

    userToVerify.isVerified = true;
    userToVerify.verificationBadge = req.body.badge || "✔️ Verified";
    await userToVerify.save();

    return res.status(200).json({ message: "User verified successfully" });
  } catch (error) {
    return res.status(500).json({ message: "An error occurred" });
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  verifyOtp,
  resetPassword,
  updateUser,
  getUser,
  idVerification,
  verifyUser,
};
