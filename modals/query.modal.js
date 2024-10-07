import mongoose from "mongoose";

const { Schema } = mongoose;

const querySchema = new Schema({
    agentId: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    busBookingId: {
        type: Schema.Types.ObjectId,
        ref: 'BusBooking'  
    },
    bookingId: {
        type: Schema.Types.ObjectId,
        ref: 'Booking'  
    },
    userId:{
        type: Schema.Types.ObjectId,
        ref:'User'
    },
    status:{
        type: String,
        default: "pending"
    }
});

const Query = mongoose.model("Query", querySchema);
export default Query;
