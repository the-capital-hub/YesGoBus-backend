import User from "../modals/user.modal.js";
import mongoose from "mongoose";
import bookingModel from "../modals/booking.modal.js";

export const getBookingHistoryByUser = async (userId) => {
	try {
		// Check if userId is a valid ObjectId
		if (!mongoose.Types.ObjectId.isValid(userId)) {
			return {
				status: 400,
				message: "Invalid user ID",
			};
		}

		// Use userId in the Mongoose query
		const user = await User.findOne({ _id: userId });
		if (!user) {
			return {
				status: 404,
				message: "User not found",
			};
		}

		const bookingHistory = await bookingModel.find({
			userId: userId,
			paymentStatus: "SUCCESS"
		  });
		  

		if (!bookingHistory || bookingHistory.length === 0) {
			return {
				status: 200,
				message: "No booking history found",
			};
		}

		return {
			status: 200,
			message: "Booking History retrieved successfully",
			data: bookingHistory,
		};
	} catch (err) {
		console.log(err);
		return {
			status: 500,
			message: "An error occurred while fetching booking history.",
		};
	}
};
