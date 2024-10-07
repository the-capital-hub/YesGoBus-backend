import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema(
	{
		userId: {
			type: Number,
			required: true,
			unique: true,
		},
		role: {
			type: String,
			default: "user",
			// required: true,
		},
		fullName: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
		},
		phoneNumber: {
			type: String,
			required: true,
		},
		address: {
			type: String,
			// required: true
		},
		gender: {
			type: String,
		},
		password: {
			type: String,
			//required: true
		},
		isAgent: {
			type: Boolean,
		},
	},
	{
		timestamps: true,
	}
);

const User = mongoose.model("User", userSchema);

export default User;
