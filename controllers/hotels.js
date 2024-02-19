const path = require('path');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Hotel = require('../models/Hotel');


exports.getHotels = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});


exports.getHotel = asyncHandler(async (req, res, next) => {
  const hotel = await Hotel.findById(req.params.id);

  if (!hotel) {
    return next(
      new ErrorResponse(
        `Hotel not found with id of ${req.params.id}`,
        404
      )
    );
  }

  res.status(200).json({
    success: true,
    data: hotel,
  });
});


exports.createHotel = asyncHandler(
  async (req, res, next) => {

    const hotel = await Hotel.create(req.body);

    res.status(201).json({
      success: true,
      data: hotel,
    });
  }
);



exports.searchHotels = async (req, res) => {
  try {
    const { keyword } = req.query;
    console.log('Keyword:', keyword);

    if (typeof keyword !== 'string') {
      throw new Error('Keyword must be a string');
    }

    const hotels = await Hotel.find({
      $or: [
        { name: { $regex: keyword, $options: 'i' } }, 
        { city: { $regex: keyword, $options: 'i' } }, 
      ]
    });
    // console.log('MongoDB Query:', hotels.getFilter());
    res.json(hotels);
  } catch (error) {
    console.error('Error searching hotels:', error); 
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateHotel = asyncHandler(
  async (req, res, next) => {
    let hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return next(
        new ErrorResponse(
          `Hotel with id of ${req.params.id} not found`,
          404
        )
      );
    }

    hotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({ success: true, data: hotel });
  }
);


exports.deleteHotel = asyncHandler(
  async (req, res, next) => {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return next(
        new ErrorResponse(
          `Hotel not found with id of ${req.params.id}`,
          404
        )
      );
    }


    hotel.remove();

    res.status(200).json({
      success: true,
      data: {},
    });
  }
);


// @desc      Upload photo for hotel
// @route     PUT  /api/v1/hotels/:id/photo
// @access    Private
exports.hotelPhotoUpload = asyncHandler(
  async (req, res, next) => {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return next(
        new ErrorResponse(
          `Hotel not found with id of ${req.params.id}`,
          404
        )
      );
    }



    if (!req.files) {
      return next(
        new ErrorResponse('Please upload a file', 400)
      );
    }

    const file = req.files.file;

    // // Make sure the file is an image
    if (!file.mimetype.startsWith('image')) {
      return next(
        new ErrorResponse(
          'Please upload an image file',
          400
        )
      );
    }

    // Check file size
    if (file.size > process.env.MAX_FILE_UPLOAD) {
      return next(
        new ErrorResponse(
          `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
          400
        )
      );
    }

    // Create custom filename
    file.name = `photo_${hotel._id}${
      path.parse(file.name).ext
    }`;

    file.mv(
      `${process.env.FILE_UPLOAD_PATH}/${file.name}`,
      async (err) => {
        if (err) {
          console.error(err);
          return next(
            new ErrorResponse(
              'Problem with file upload',
              500
            )
          );
        }

        await Hotel.findByIdAndUpdate(req.params.id, {
          photo: file.name,
        });

        res.status(200).json({
          success: true,
          data: file.name,
        });
      }
    );
  }
);
