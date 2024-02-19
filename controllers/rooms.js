const path = require('path');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Room = require('../models/Room');
const Hotel = require('../models/Hotel');


exports.getRooms = asyncHandler(async (req, res, next) => {
  if (req.params.hotelId) {
    const rooms = await Room.find({
      hotel: req.params.hotelId,
    });

    return res.status(200).json({
      success: true,
      count: rooms.length,
      data: rooms,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});


exports.getRoom = asyncHandler(async (req, res, next) => {
  const room = await Room.findById(req.params.id).populate({
    path: 'hotel',
    select: 'name description',
  });

  if (!room) {
    return next(
      new ErrorResponse(
        `No room with the id of ${req.params.id}`
      ),
      404
    );
  }

  res.status(200).json({
    success: true,
    data: room,
  });
});


exports.getHotelRooms = asyncHandler(
  async (req, res) => {
    const hotelRooms = await Room.find({
      hotel: req.params.hotelId,
    }).populate({
      path: 'bookings',
      select: 'guestName guestEmail bookingDate',
    });

    return res.status(statusCode.success).json({
      success: true,
      count: hotelRooms.length,
      data: hotelRooms,
    });
  }
);

exports.addRoom = asyncHandler(async (req, res, next) => {
  req.body.hotel = req.params.hotelId;

  const hotel = await Hotel.findById(req.params.hotelId);
  if (!hotel) {
    return next(
      new ErrorResponse(
        `No hotel with the id of ${req.params.hotelId}`
      ),
      404
    );
  }


  const room = await Room.create(req.body);

  res.status(200).json({
    success: true,
    data: room,
  });
});


exports.updateRoom = asyncHandler(
  async (req, res, next) => {
    let room = await Room.findById(req.params.id);

    if (!room) {
      return next(
        new ErrorResponse(
          `No room with the id of ${req.params.id}`
        ),
        404
      );
    }


    room = await Room.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      data: room,
    });
  }
);


exports.deleteRoom = asyncHandler(
  async (req, res, next) => {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return next(
        new ErrorResponse(
          `No room with the id of ${req.params.id}`
        ),
        404
      );
    }


    await room.remove();

    res.status(200).json({
      success: true,
      data: {},
    });
  }
);

exports.searchRooms = async (req, res) => {
  try {
    const { minCost, maxCost } = req.query;

    // Define the filter object
    const filter = {};

    // Add cost range filter if provided
    if (minCost && maxCost) {
      filter.cost = { $gte: parseInt(minCost), $lte: parseInt(maxCost) };
    } else if (minCost) {
      filter.cost = { $gte: parseInt(minCost) };
    } else if (maxCost) {
      filter.cost = { $lte: parseInt(maxCost) };
    }

    // Perform the search query with the filters
    const rooms = await Room.find(filter);

    res.json(rooms);
  } catch (error) {
    console.error('Error searching rooms:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



exports.roomPhotoUpload = asyncHandler(
  async (req, res, next) => {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return next(
        new ErrorResponse(
          `Room not found with id of ${req.params.id}`,
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
    file.name = `photo_${room._id}${
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

        await Room.findByIdAndUpdate(req.params.id, {
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
