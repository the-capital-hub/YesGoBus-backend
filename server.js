import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import bodyParser from "body-parser";
import multer from "multer";
import http from "http";
//routes
import userRoutes from "./routes/user.routes.js";
import cabRoutes from "./routes/cab.routes.js";
import cabBookingRoutes from "./routes/cabbooking.routes.js";
import busBookingRoutes from "./routes/busBooking.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import driverRoutes from "./routes/driver.routes.js";
import kycRoutes from "./routes/verifykyc.routes.js";
import agentRoutes from "./routes/agents.routes.js";
import cabdriverRoute from "./routes/cabdriver.routes.js";
import packagesRoute from "./routes/packages.routes.js";
import bookingRoute from "./routes/booking.routes.js";
import hotelRoute from "./routes/hotel.routes.js";
import couponRouter from "./routes/coupon.routes.js";
import feedbackRoute from "./routes/feedback.routes.js";
import offerRoute from "./routes/offer.routes.js";
import queryRoute from "./routes/query.routes.js";
import adminRoute from "./routes/admin.routes.js";

//schedular
import {
	sendReminderJob,
	checkPaymentJob,
	sendMessageAfterJourneyJob,
} from "./utils/scheduler.js";

dotenv.config();
const app = express();
const PORT = 8000;

const corsOptions = {
	origin: [
		"https://yesgobuss.netlify.app",
		"https://yesgobus.com",
		"http://localhost:5173",
		"http://192.168.56.1:5173",
		"http://192.168.0.9:5173",
	],
	methods: "GET,POST,OPTIONS, PUT, PATCH, DELETE",
	allowedHeaders: "Content-Type,Authorization",
	credentials: true,
};

const connect = async () => {
	try {
		await mongoose.connect(process.env.MONGO_URI);
		console.log("connected to mongodb server");
	} catch (err) {
		console.log(err);
	}
};

//middleware
app.use(express.json({ limit: "100mb" }));
app.use(cookieParser());
// Setup CORS with your custom options
app.use(cors(corsOptions));
// Handle preflight requests globally for all routes
app.options("*", cors(corsOptions));
app.use(bodyParser.json({ limit: "100mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer().any());
//routes
app.get("/", (req, res) => {
	res.send("YesGoBus Backend");
});
app.use("/api/user", userRoutes);
app.use("/api/cab", cabRoutes);
app.use("/api/cabBooking", cabBookingRoutes);
app.use("/api/busBooking", busBookingRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/cabdriver", cabdriverRoute);
app.use("/api/driver", driverRoutes);
app.use("/api/kyc", kycRoutes);
app.use("/api/agent", agentRoutes);
app.use("/api/package", packagesRoute);
app.use("/api/booking", bookingRoute);
app.use("/api/hotel", hotelRoute);
app.use("/api/coupon", couponRouter);
app.use("/api/feedback", feedbackRoute);
app.use("/api/offers", offerRoute);
app.use("/api/query", queryRoute);
app.use("/api/admin", adminRoute);
const server = http.createServer(app);

// Set maximum headers count, maximum header size, and maximum body size
server.maxHeadersCount = 10000; // Maximum number of headers allowed in a request
server.maxHeaderSize = 1048576; // Maximum size of individual headers in bytes
server.maxBodySize = 52428800; // Maximum size of the request body in bytes

server.listen(PORT, (err) => {
	if (err) {
		console.error("Failed to start server:", err);
	} else {
		connect();
		console.log(`Server started on port ${PORT}`);
	}
});

// app.listen(PORT, () => {
//   connect();
//   console.log(`server started on port ${PORT}`);
// });
