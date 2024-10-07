import destinationModel from "../modals/destination.modal.js";
import packageModel from "../modals/packages.modal.js";
import wishlistModel from "../modals/wishlist.modal.js";

export const add_destination = async (req, res) => {
  try {
    const response = await destinationModel.create({
      destination: req.body.destination,
      image: req.body.image,
      rating: req.body.rating,
      duration: req.body.duration,
      startingPrice: req.body.startingPrice,
    });
    return res.status(201).send({
      status: true,
      data: { response },
      message: "destination created successfully",
    });
  } catch (err) {
    return res.status(500).send({
      status: false,
      data: { errorMessage: err.message },
      message: "server error",
    });
  }
};

export const add_packages = async (req, res) => {
  try {
    const { name, price, duration, destinationID, totalDuration, image } =
      req.body;

    const destinationData = await destinationModel.findOne({
      _id: destinationID,
    });
    const packageData = await packageModel.create({
      name,
      image,
      duration,
      witheFlitePrice: price,
      withoutFlitePrice: price * 0.8,
      destination: destinationData.destination,
      destinationID,
      totalDuration,
    });
    return res.status(201).send({
      status: true,
      data: { packageData },
      message: "destination created successfully",
    });
  } catch (err) {
    return res.status(500).send({
      status: false,
      data: { errorMessage: err.message },
      message: "server error",
    });
  }
};
export const get_packages = async (req, res) => {
  try {
    const destination = await destinationModel.find(
      {},
      {
        _id: 1,
        destination: 1,
        duration: 1,
        startingPrice: 1,
        image: 1,
        rating: 1,
      }
    );
    return res.status(201).send({
      status: true,
      data: { destination: destination },
      message: "destination fetch successfully",
    });
  } catch (err) {
    return res.status(500).send({
      status: false,
      data: { errorMessage: err.message },
      message: "server error",
    });
  }
};

export const popular_destinations = async (req, res) => {
  try {

    const destination = await destinationModel.findOne({destination: new RegExp(`^${req.body.destination}$`, 'i'),});

    const tagline = destination.tagline;

           // Get the previous month name
           const previousMonth = new Date();
           previousMonth.setMonth(previousMonth.getMonth() - 1);
           const options = { month: 'long' };
           const previousMonthName = previousMonth.toLocaleDateString('en-US', options);
       
           // Create discount text
           const discountText = `This Price is lower than the average price of ${previousMonthName}.`;


    // Log the incoming destination to ensure it's received correctly
    console.log('Incoming Destination:', req.body.destination);

    // Use a case-insensitive query for destination
    const packages = await packageModel.find({
      destination: new RegExp(`^${req.body.destination}$`, 'i'),
    });

    // Log the packages found to check if the query is working as expected
    console.log('Packages Found:', packages);

    // If no packages are found, return a 404 response
    if (packages.length === 0) {
      return res.status(404).send({
        status: false,
        message: "No packages found for the given destination",
      });
    }

    // Fetch the user's wishlist
    const wishlist = await wishlistModel.find({ userId: req.user, isWishlisted:true });

    // Log the user's wishlist
    console.log('Wishlist:', wishlist);

    // Process packages and check if each one is in the user's wishlist
    const updatedData = packages.map((item) => {
      const { _doc } = item; // Destructure _doc
      const isWishlisted = wishlist.some((wish) => {
        return wish?.packageId?.toString() === _doc?._id?.toString();
      });

      // Combine _doc with other properties and add isWishlisted
      return { ..._doc, isWishlisted, discountText };
    });

    // Log the final data before sending the response
    console.log('Updated Data:', updatedData);

    // Send the successful response with the updated package data
    return res.status(200).send({
      status: true,
      data: { packages: updatedData, tagline:tagline },
      message: "Packages fetched successfully",
    });
  } catch (err) {
    // Log the error message for easier debugging
    console.error('Error:', err.message);

    // Return a server error response
    return res.status(500).send({
      status: false,
      data: { errorMessage: err.message },
      message: "Server error",
    });
  }
};

export const add_to_wishlist = async (req, res) => {
  try {
    const wishlistData = await wishlistModel.findOne({
      packageId: req.body.packageId,
      userId: req.user,
    });
    if (!wishlistData) {
      const wishlist = await wishlistModel.create({
        userId: req.user,
        packageId: req.body.packageId,
        isWishlisted: req.body.isWishlisted,
      });
      console.log(wishlist);
      return res.status(200).send({
        status: true,
        data: { wishlist },
        message: "Package added to wishlist successfully",
      });
    } else {
      const wishlist = await wishlistModel.findOneAndUpdate(
        { packageId: req.body.packageId, userId: req.user },
        { isWishlisted: req.body.isWishlisted },
        { new: true }
      );
      return res.status(200).send({
        status: true,
        data: { wishlist },
        message: "Package added to wishlist successfully",
      });
    }
  } catch (err) {
    return res.status(500).send({
      status: false,
      data: { errorMessage: err.message },
      message: "server error",
    });
  }
};

export const get_user_wishlist = async (req, res) => {
  try {
    const wishlist = await wishlistModel
      .find({ userId: req.user, isWishlisted: true })
      .populate({
        path: "packageId",
      });

     // Get the previous month name
     const previousMonth = new Date();
     previousMonth.setMonth(previousMonth.getMonth() - 1);
     const options = { month: 'long' };
     const previousMonthName = previousMonth.toLocaleDateString('en-US', options);
 
     // Create discount text
     const discountText = `This Price is lower than the average price of ${previousMonthName}.`;

      const modifiedData = wishlist.map((item) => {
        if (item.packageId) {
          return {
            _id: item.packageId._id,
            name: item.packageId.name,
            destinationID: item.packageId.destinationID,
            destination: item.packageId.destination,
            image: item.packageId.image,
            duration: item.packageId.duration,
            witheFlitePrice: item.packageId.witheFlitePrice,
            withoutFlitePrice: item.packageId.withoutFlitePrice,
            totalDuration: item.packageId.totalDuration,
            hotelId: item.packageId.hotelId ? item.packageId.hotelId : "",
            isWishlisted: item.isWishlisted,
            userId: item.userId,
            tripBenifit: item.packageId.tripBenifit,
            discountText :discountText,
            couponCode : item.packageId.couponCode
          };
        } else {
          // Handle case when packageId is missing
          return {
            _id: "",
            name: "",
            destinationID: "",
            destination: "",
            image: "",
            duration: "",
            witheFlitePrice: 0,
            withoutFlitePrice: 0,
            totalDuration: "",
            hotelId: "",
            isWishlisted: item.isWishlisted,
            userId: item.userId,
          };
        }
      });
      
    return res.status(200).send({
      status: true,
      data: { packages: modifiedData },
      message: "wishlist data fetch successfully",
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).send({
      status: false,
      data: { errorMessage: err.message },
      message: "server error",
    });
  }
};
