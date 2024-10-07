import mongoose from "mongoose";
const ObjectId = mongoose.Schema.Types.ObjectId;

const customerSupport = new mongoose.Schema(
  {
    userId: {
      type: ObjectId,
      required: true,
      ref: "User",
      trim: true,
    },
    bookingId: {
      type: ObjectId,
      required: true,
      ref:'Booking'
    },
  },
  { timestamps: true }
);

const Support = mongoose.model("Support", customerSupport);

export default Support