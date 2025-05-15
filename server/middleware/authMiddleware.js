import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const protectRoute = asyncHandler(async (req, res, next) => {
  let token = req.cookies?.token;

  if (token) {
    try {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

      const resp = await User.findById(decodedToken.userId).select("email");

      if (!resp) {
        return res
          .status(401)
          .json({ status: false, message: "User not found. Try login again." });
      }

      req.user = {
        email: resp.email,
        userId: decodedToken.userId,
      };

      next();
    } catch (error) {
      console.error(error);
      return res
        .status(401)
        .json({ status: false, message: "Not authorized. Try login again." });
    }
  } else {
    return res
      .status(401)
      .json({ status: false, message: "Not authorized. Try login again." });
  }
});

export { protectRoute };
