import mongoose from "mongoose";
const ObjectId = mongoose.Schema.Types.ObjectId;

const destinationSchema = new mongoose.Schema(
	{
		hotelId: {
			type: ObjectId,
			required: true,
			ref: "Hotels",
			trim: true,
		},
		plans: [Object],
		checkIn: {
			type: String,
		},
		destination: {
			type: String,
		},
		checkOut: {
			type: String,
		},
		packageId: {
			type: ObjectId,
			required: true,
			ref: "Packages",
			trim: true,
		},
		room_name: {
			type: String,
		},
		additional_info: [
			{
				type: String,
			},
		],
		end_of_day_info: {
			type: String,
		},
	},
	{ timestamps: true }
);

const ItineraryPlans = mongoose.model("ItineraryPlans", destinationSchema);

export default ItineraryPlans;
