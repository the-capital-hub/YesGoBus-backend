import bookingModel from "../modals/booking.modal.js";
import supportModel from "../modals/customerSupport.modal.js";
import hotelModel from "../modals/hotels.modal.js";
//import userModel from "../model/user"
import itineraryPlansModel from "../modals/itineraryPlans.modal.js";
import axios from "axios";
import { initiatePayment } from "../service/payment.service.js";

export const make_booking = async (req, res) => {
  try {
    function generateBookingId() {
      const companyName = "YESGBS";
      const alphanumeric = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let idSuffix = "";
      for (let i = 0; i < 6; i++) {
        idSuffix += alphanumeric.charAt(
          Math.floor(Math.random() * alphanumeric.length)
        );
      }
      const bookingId = `${companyName}-${idSuffix}`;
      return bookingId;
    }

    const bookingId = generateBookingId();

    const {
      packageId,
      fromPlace,
      toPlace,
      departureDate,
      returnDate,
      witheFlight,
      totalGuests,
      totalRoom,
      guestsType,
      totalPackagePrice,
    } = req.body;
    const bookingData = await bookingModel.create({
      userId: req.user,
      packageId,
      fromPlace,
      toPlace,
      departureDate,
      returnDate,
      witheFlight,
      totalGuests,
      totalRoom,
      guestsType,
      totalPackagePrice,
      couponDiscount: 0,
      feesTexes: totalPackagePrice,
      totalBasicCost: totalPackagePrice,
      bookingId,
      status: [
        {
          bookingStatus: "Booked",
          statusTime: `${new Date().getDate()}/${new Date().getMonth()}/${new Date().getFullYear()}`,
        },
      ],
    });
    return res.status(201).send({
      status: true,
      data: { bookingData },
      message: "Booking done successfully",
    });
  } catch (err) {
    return res.status(500).send({
      status: false,
      data: { errorMessage: err.message },
      message: "server error 1",
    });
  }
};
export const add_itinerary_plans = async (req, res) => {
  try {
    const itineraryData = await itineraryPlansModel.create({
      hotelId: req.body.hotelId,
      plans: req.body.plans,
    });
    return res.status(201).send({
      status: true,
      data: { itineraryData },
      message: "Itinerary Plans added successfully",
    });
  } catch (err) {
    return res.status(500).send({
      status: false,
      data: { errorMessage: err.message },
      message: "server error 2",
    });
  }
};
export const get_Itinerary_plans = async (req, res) => {
  try {
    // Fetch the itinerary data based on the package ID
    const itineraryData = await itineraryPlansModel.findOne({
      packageId: req.body.packageId,
    }).populate('hotelId');

    // If no itinerary data is found, return a 404 response
    if (!itineraryData) {
      return res.status(404).send({
        status: false,
        message: "Itinerary not found",
      });
    }

    // Extract hotel data with safe optional chaining
    const hotelData = {
      hotelName: itineraryData.hotelId?.hotelName || "",
      rating: itineraryData.hotelId?.rating || "",
      address: itineraryData.hotelId?.address || "",
      image: itineraryData.hotelId?.image || "",
      fullAddress: itineraryData.hotelId?.fullAddress || "",
      destination: itineraryData.hotelId?.destination || "",
      checkIn: itineraryData.checkIn || "",
      checkOut: itineraryData.checkOut || "",
      room_name: itineraryData.room_name || "",
      additional_info:itineraryData.additional_info || "",
      end_of_day_info:itineraryData.end_of_day_info || "",
    };

    // Structure the response data
    return res.status(200).send({
      status: true,
      data: {
        hotel_data: {
          hotel: hotelData,
          itinerary: itineraryData.plans || [], // Ensure plans is an empty array if not present
        },
      },
      message: "Itinerary fetched successfully",
    });
  } catch (err) {
    console.error('Error fetching itinerary:', err.message); // Log the error for debugging
    return res.status(500).send({
      status: false,
      data: { errorMessage: err.message },
      message: "Server error 3",
    });
  }
};


export const edit_booking = async (req, res) => {
  try {
    let bookingData; // Use 'let' here to allow reassignment

    if (req.body.paymentStatus) {
      bookingData = await bookingModel.findOneAndUpdate(
        { bookingId: req.body.bookingId },
        { paymentStatus: req.body.paymentStatus },
        { new: true }
      );
      return res.status(200).send({
        status: true,
        data: { bookingData },
        message: "Booking updated successfully",
      });
    }

    bookingData = await bookingModel.findOneAndUpdate(
      { _id: req.body.bookingId },
      {
        totalPackagePrice: req.body.totalPackagePrice,
        contactDetail: {
          email: req.body.email,
          mobileNumber: req.body.mobileNumber,
          alternativeNumber: req.body.alternativeNumber,
        },
        gstDetails: {
          pincode: req.body.pincode,
          state: req.body.state,
          address: req.body.address,
        },
        guestDetails: JSON.parse(req.body.guestDetails),
        spancelRequest: req.body.spancelRequest,
      },
      { new: true }
    );

    // Create order
    const paymentResponse = await initiatePayment({
      amount: req.body.totalPackagePrice, // Ensure this is in the correct format
      redirectUrl: req.body.redirectUrl, // Specify your redirect URL
    });


  if (paymentResponse && paymentResponse.success === true) {
      // Update bookingData with the orderId
      bookingData = await bookingModel.findOneAndUpdate(
        { _id: req.body.bookingId },
        { orderId: paymentResponse.data.merchantTransactionId, 
        paymentStatus: 'PENDING' }, 
        { new: true }
      );
    


    // Return bookingData along with orderId and sessionId
    return res.status(200).send({
      status: true,
      data: {
        bookingData,
        bookingPaymentUrl: paymentResponse.data.instrumentResponse.redirectInfo.url,
      },
    });
  }
  else{
    throw new Error("Cannot initialise payment procedure, please retry");
  }
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: false,
      data: { errorMessage: err.message },
      message: "Server error",
    });
  }
};

export const customer_sport = async (req, res) => {
  try {
    const bookingData = await bookingModel.findOne({
      _id: req.body.bookingId,
    });
    if (!bookingData) {
      return res
        .status(200)
        .send({ status: false, data: {}, message: "Invalid booking id" });
    }
    const sportData = await supportModel.create({
      bookingId: req.body.bookingId,
      userId: req.user,
    });

    return res.status(201).send({ 
      status: true,
      data: { sportData },
      message: "Query has been raised our team will connect you soon",
    });
  } catch (err) {
    return res.status(500).send({
      status: false,
      data: { errorMessage: err.message },
      message: "server error 4",
    });
  }
};

export const get_customer_booking = async (req, res) => {
  try {
    const booking = await bookingModel.find({
      userId: req.user,
      paymentStatus: { $in: ["SUCCESS", "PAYMENT_SUCCESS"] }
    })
      .populate({
        path: "packageId",
      });

      const currentDate = new Date(); // Get the current date

    const bookingData = booking.map((item) => {

      const departureDate = new Date(item.departureDate.split("/").reverse().join("-"));
      const returnDate = new Date(item.returnDate.split("/").reverse().join("-"));

      // Determine the booking status
      let bookingStatus;
      if (departureDate > currentDate) {
        bookingStatus = "UPCOMING"; // Departure in the future
      } else if (returnDate >= currentDate) {
        bookingStatus = "ONGOING"; // Between departure and return
      } else {
        bookingStatus = "COMPLETED"; // Return date has passed
      }

       // Get the previous month name
    const previousMonth = new Date();
    previousMonth.setMonth(previousMonth.getMonth() - 1);
    const options = { month: 'long' };
    const previousMonthName = previousMonth.toLocaleDateString('en-US', options);

    // Create discount text
    const discountText = `This Price is lower than the average price of ${previousMonthName}.`;

      return {
        _id: item._id,
        name: item?.packageId?.name,
        destinationID: item?.packageId?.destinationID,
        destination: item?.packageId?.destination,
        image: item?.packageId?.image,
        duration: item?.packageId?.duration,
        witheFlitePrice: item?.packageId?.witheFlitePrice,
        withoutFlitePrice: item?.packageId?.withoutFlitePrice,
        totalDuration: item?.packageId?.totalDuration,
        hotelId: item?.packageId?.hotelId ? item?.packageId?.hotelId : "",
        bookingStatus: bookingStatus,
        statusTime: item.departureDate,
        bookingId: item?.bookingId,
        tripBenifit : item?.packageId?.tripBenifit,
        couponCode : item?.packageId?.couponCode,
        discountText : discountText,
      };
    });
    return res.status(200).send({
      status: true,
      data: { bookingData },
      message: "Booking Data fetch successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: false,
      data: { errorMessage: err.message },
      message: "server error 5",
    });
  }
};

export const get_booking = async (req, res) => {
  try {
    console.log(req.body.bookingId)
    const booking = await bookingModel.findOne({
      bookingId: req.body.bookingId,
    });
    return res.status(200).send({
      status: true,
      data: { booking },
      message: "Booking Data fetch successfully",
    });
  } catch (err) {
    return res.status(500).send({
      status: false,
      data: { errorMessage: err.message },
      message: "server error 6",
    });
  }
};

export const update_booking_payment = async(req,res)=>{
  try {
    console.log(req.body.bookingId)
    const booking = await bookingModel.findOneAndUpdate({bookingId:req.body.bookingId},{
      merchantTransactionId: req.body.merchantTransactionId,
    });
    return res.status(200).send({
      status: true,
      data: { booking },
      message: "Booking Data fetch successfully",
    });
  } catch (err) {
    return res.status(500).send({
      status: false,
      data: { errorMessage: err.message },
      message: "server error 7",
    });
  }
}
