import {
  initiatePayment,
  checkPaymentStatus,
  refundPayment,
} from "../service/payment.service.js";

import bookingModel from "../modals/booking.modal.js";

export const initiatePaymentController = async (req, res) => {
  try {
    const response = await initiatePayment(req.body);
    console.log(response)
    res.status(200).send(response);
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: 500,
      message: "An error occurred while initiating payment"
    })
  }
};

export const checkPaymentStatusController = async (req, res) => {
  try {
    console.log(req.body.response);
    const decodedResponse = atob(req.body.response);
    const data = JSON.parse(decodedResponse);
    console.log(data);

       // Find the booking by orderId
       const bookingData = await bookingModel.findOne({ orderId : data.data.merchantTransactionId });

       if (!bookingData) {
         return res.status(404).send({ message: "Booking not found" });
       }
   
       // Update the booking based on payment status
       const paymentDone = data.code === "PAYMENT_SUCCESS";
       const paymentStatus = data.code;
       const updatedBooking = await bookingModel.findOneAndUpdate(
         { orderId : data.data.merchantTransactionId },
         {
           paymentDone,
           paymentStatus,
         },
         { new: true }
       );

       console.log(`Payment ${paymentDone ? 'successful' : 'failed'} for order ID: ${data.data.merchantTransactionId}`);

       // Respond to Cashfree
       return res.status(200).send({status:paymentDone, message: "Payment processed successfully.", data: updatedBooking });


  }catch(error){
    console.log(error);
    return res.status(500).send({
      status: false,
      message: "An error occurred"
    })
  }
}

export const refundPaymentController = async (req, res) => {
  try {
    const response = await refundPayment(req.body);
    res.status(200).send(response);
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: 500,
      message: "An error occurred while refunding payment"
    })
  }
};

export const paymentCashfreeStatus = async(req,res) =>{
  try{


    const { data } = req.body; // Destructure the data object from the request body
    const paymentStatus = data.payment.payment_status; // Extract payment status
    const orderId = data.order.order_id; // Extract order ID

       // Find the booking by orderId
       const bookingData = await bookingModel.findOne({ orderId : orderId });

       if (!bookingData) {
         return res.status(404).send({ message: "Booking not found" });
       }
   
       // Update the booking based on payment status
       const paymentDone = paymentStatus === "SUCCESS";
       const updatedBooking = await bookingModel.findOneAndUpdate(
         { orderId },
         {
           paymentDone,
           paymentStatus,
         },
         { new: true }
       );

       console.log(`Payment ${paymentDone ? 'successful' : 'failed'} for order ID: ${orderId}`);

       // Respond to Cashfree
       return res.status(200).send({status:paymentDone, message: "Payment processed successfully.", data: updatedBooking });


  }catch(error){
    console.log(error);
    return res.status(500).send({
      status: false,
      message: "An error occurred"
    })
  }
}