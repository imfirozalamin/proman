import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import Notice from "../models/notis.js";
import User from "../models/userModel.js";
import { generateOTP, sendVerificationEmail } from "../config/emailConfig.js";

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// POST request - login user
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res
      .status(401)
      .json({ status: false, message: "Invalid email or password." });
  }

  if (!user?.isActive) {
    return res.status(401).json({
      status: false,
      message: "User account has been deactivated, contact the administrator",
    });
  }

  if (!user.isVerified) {
    return res.status(401).json({
      status: false,
      message: "Please verify your email address first"
    });
  }

  const isMatch = await user.matchPassword(password);

  if (user && isMatch) {
    const token = generateToken(user._id);
    user.password = undefined;

    res.status(200).json({
      ...user.toJSON(),
      token
    });
  } else {
    return res
      .status(401)
      .json({ status: false, message: "Invalid email or password" });
  }
});

// POST - Register a new user
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, isAdmin, role, title } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    return res
      .status(400)
      .json({ status: false, message: "Email address already exists" });
  }

  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

  const user = await User.create({
    name,
    email,
    password,
    isAdmin,
    role,
    title,
    otp,
    otpExpiry,
    isVerified: false
  });

  if (user) {
    const emailSent = await sendVerificationEmail(email, otp);
    
    if (!emailSent) {
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({ 
        status: false, 
        message: "Failed to send verification email. Please try again." 
      });
    }

    res.status(201).json({
      status: true,
      message: "Registration successful. Please check your email for OTP verification.",
      userId: user._id
    });
  } else {
    return res
      .status(400)
      .json({ status: false, message: "Invalid user data" });
  }
});

// POST - Verify OTP
const verifyOTP = asyncHandler(async (req, res) => {
  const { userId, otp } = req.body;

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ 
      status: false, 
      message: "User not found" 
    });
  }

  if (user.isVerified) {
    return res.status(400).json({ 
      status: false, 
      message: "Email already verified" 
    });
  }

  if (user.otp !== otp) {
    return res.status(400).json({ 
      status: false, 
      message: "Invalid OTP" 
    });
  }

  if (new Date() > user.otpExpiry) {
    return res.status(400).json({ 
      status: false, 
      message: "OTP has expired" 
    });
  }

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save();

  const token = generateToken(user._id);
  user.password = undefined;

  res.status(200).json({
    status: true,
    message: "Email verified successfully",
    ...user.toJSON(),
    token
  });
});

// POST - Resend OTP
const resendOTP = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ 
      status: false, 
      message: "User not found" 
    });
  }

  if (user.isVerified) {
    return res.status(400).json({ 
      status: false, 
      message: "Email already verified" 
    });
  }

  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  user.otp = otp;
  user.otpExpiry = otpExpiry;
  await user.save();

  const emailSent = await sendVerificationEmail(user.email, otp);

  if (!emailSent) {
    return res.status(500).json({ 
      status: false, 
      message: "Failed to send verification email. Please try again." 
    });
  }

  res.status(200).json({
    status: true,
    message: "OTP resent successfully. Please check your email."
  });
});

// POST -  Logout user
const logoutUser = asyncHandler(async (req, res) => {
  try {
    // No need to clear cookies since we're using localStorage
    // Just send a successful response
    res.status(200).json({ 
      status: true,
      message: "Logged out successfully" 
    });
  } catch (error) {
    res.status(500).json({ 
      status: false,
      message: "Error during logout" 
    });
  }
});

// @GET -   Get user profile
// const getUserProfile = asyncHandler(async (req, res) => {
//   const { userId } = req.user;

//   const user = await User.findById(userId);

//   user.password = undefined;

//   if (user) {
//     res.json({ ...user });
//   } else {
//     res.status(404);
//     throw new Error("User not found");
//   }
// });

const getTeamList = asyncHandler(async (req, res) => {
  const { search } = req.query;
  let query = {};

  if (search) {
    const searchQuery = {
      $or: [
        { title: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
        { role: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    };
    query = { ...query, ...searchQuery };
  }

  const user = await User.find(query).select("name title role email isActive");

  res.status(201).json(user);
});

// @GET  - get user notifications
const getNotificationsList = asyncHandler(async (req, res) => {
  const { userId } = req.user;

  const notice = await Notice.find({
    team: userId,
    isRead: { $nin: [userId] },
  })
    .populate("task", "title")
    .sort({ _id: -1 });

  res.status(200).json(notice);
});

// @GET  - get user task status
const getUserTaskStatus = asyncHandler(async (req, res) => {
  const tasks = await User.find()
    .populate("tasks", "title stage")
    .sort({ _id: -1 });

  res.status(200).json(tasks);
});

// @GET  - get user notifications
const markNotificationRead = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.user;
    const { isReadType, id } = req.query;

    if (isReadType === "all") {
      await Notice.updateMany(
        { team: userId, isRead: { $nin: [userId] } },
        { $push: { isRead: userId } },
        { new: true }
      );
    } else {
      await Notice.findOneAndUpdate(
        { _id: id, isRead: { $nin: [userId] } },
        { $push: { isRead: userId } },
        { new: true }
      );
    }
    res.status(201).json({ status: true, message: "Done" });
  } catch (error) {
    console.log(error);
  }
});

// PUT - Update user profile
const updateUserProfile = asyncHandler(async (req, res) => {
  const { userId, isAdmin } = req.user;
  const { _id } = req.body;

  const id =
    isAdmin && userId === _id
      ? userId
      : isAdmin && userId !== _id
      ? _id
      : userId;

  const user = await User.findById(id);

  if (user) {
    user.name = req.body.name || user.name;
    // user.email = req.body.email || user.email;
    user.title = req.body.title || user.title;
    user.role = req.body.role || user.role;

    const updatedUser = await user.save();

    user.password = undefined;

    res.status(201).json({
      status: true,
      message: "Profile Updated Successfully.",
      user: updatedUser,
    });
  } else {
    res.status(404).json({ status: false, message: "User not found" });
  }
});

// PUT - active/disactivate user profile
const activateUserProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);

  if (user) {
    user.isActive = req.body.isActive;

    await user.save();

    user.password = undefined;

    res.status(201).json({
      status: true,
      message: `User account has been ${
        user?.isActive ? "activated" : "disabled"
      }`,
    });
  } else {
    res.status(404).json({ status: false, message: "User not found" });
  }
});

const changeUserPassword = asyncHandler(async (req, res) => {
  const { userId } = req.user;

  // Remove this condition
  if (userId === "65ff94c7bb2de638d0c73f63") {
    return res.status(404).json({
      status: false,
      message: "This is a test user. You can not chnage password. Thank you!!!",
    });
  }

  const user = await User.findById(userId);

  if (user) {
    user.password = req.body.password;

    await user.save();

    user.password = undefined;

    res.status(201).json({
      status: true,
      message: `Password chnaged successfully.`,
    });
  } else {
    res.status(404).json({ status: false, message: "User not found" });
  }
});

// DELETE - delete user account
const deleteUserProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await User.findByIdAndDelete(id);

  res.status(200).json({ status: true, message: "User deleted successfully" });
});

export {
  activateUserProfile,
  changeUserPassword,
  deleteUserProfile,
  getNotificationsList,
  getTeamList,
  getUserTaskStatus,
  loginUser,
  logoutUser,
  markNotificationRead,
  registerUser,
  updateUserProfile,
  verifyOTP,
  resendOTP,
};
