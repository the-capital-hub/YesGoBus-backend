import JWT from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    // Check if the token is present
    if (!token) {
      console.log("Authorization header is missing or invalid:", authHeader);
      return res.status(401).send({ settings: { success: "0", message: "Unauthorized request" } });
    }

    // Verify the token
    const user = JWT.verify(token, process.env.JWT_KEY);
    req.user = user.userId; // Attach user ID to the request object
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    console.error("Token verification failed:", err.message);
    return res.status(403).send({ settings: { success: "0", message: "Forbidden: Invalid token" } });
  }
};
