require("dotenv").config();
const jwt = require("jsonwebtoken");

const auth = async (req, res, next) => {
  const token = req.header("authorization");
  if (!token) {
    return res.status(401).json({
      code: "BAD_REQUEST_ERROR",
      description: "No token found",
    });
  }

  try {
    jwt.verify(
      token,
      process.env.REACT_APP_ACCESS_TOKEN_SECRET,
      (err, user) => {
        if (err) {
          return res.status(403).json({
            code: "FORBIDDEN",
            description: "Forbidden access",
          });
        }
        req.user = user;
        next();
      }
    );
  } catch (error) {
    return res.status(500).json({
      code: "SERVER_ERROR",
      description: "something went wrong, Please try again",
    });
  }
};

module.exports = auth;
