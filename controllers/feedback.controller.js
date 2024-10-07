import feedbackModel from "../modals/feedback.modal.js";
import bookingModel from "../modals/booking.modal.js";

export const add_feedback = async (req, res) => {
  try {
    const date = new Date();
    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "long" });
    const year = date.getFullYear();

    const formattedDate = `${day} ${month} ${year}`;

    const booking = await bookingModel.findOne({ _id: req.body.bookingId });

    // Check if feedback already exists for the user and booking
    let feedback = await feedbackModel.findOne({
      userId: req.user,
      bookingId: req.body.bookingId,
    });

    if (feedback) {
      // Update existing feedback
      feedback.rating = req.body.rating;
      feedback.feedback = req.body.feedback;
      feedback.feedbackDate = formattedDate;
      feedback.totalGuest = booking?.guestDetails?.length;
      feedback.destination = booking?.toPlace;

      await feedback.save(); // Save the updated feedback
    } else {
      // Create new feedback
      feedback = await feedbackModel.create({
        userId: req.user,
        rating: req.body.rating,
        feedback: req.body.feedback,
        feedbackDate: formattedDate,
        totalGuest: booking?.guestDetails?.length,
        destination: booking?.toPlace,
        bookingId: req.body.bookingId, // Make sure to store bookingId
      });
    }

    return res.status(201).send({
      status: true,
      data: { feedback },
      message: "Feedback added successfully",
    });
  } catch (err) {
    return res.status(500).send({
      status: false,
      data: { errorMessage: err.message },
      message: "server error",
    });
  }
};

export const get_feedback = async (req, res) => {
  try {
    const feedback = await feedbackModel
      .find(
        {},
        {
          _id: 1,
          userId: 1,
          rating: 1,
          feedback: 1,
          feedbackDate: 1,
          totalGuest:1,
          destination:1
        }
      )
      .populate({
        path: "userId",
        select: "_id fullName",
      });
    return res.status(200).send({
      status: true,
      data: { feedback },
      message: "Feedback fetch successfully",
    });
  } catch (err) {
    return res.status(500).send({
      status: false,
      data: { errorMessage: err.message },
      message: "server error",
    });
  }
};
