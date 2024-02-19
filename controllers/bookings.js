const path = require('path');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const nodemailer = require('nodemailer')


function sendConfirmationEmail(name, email, bookingId) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL,
      pass: process.env.PASSWORD
    }
  });

  const mailOptions = {
    from: process.env.GMAIL,
    to: email,
    subject: 'Booking Confirmation',
    text: `Dear ${name},\n\nYour booking has been confirmed. Your booking ID is: ${bookingId}. Please show this ID to the hotel upon arrival.`,
    html: `<p>Dear ${name},</p><p>Your booking has been confirmed. Your booking ID is: <strong>${bookingId}</strong>. Please show this ID to the hotel upon arrival.</p>`
  };


  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
}


exports.createBooking = asyncHandler(async (req, res, next) => {
 
    const { roomId, guestName, guestEmail, checkInDate, checkOutDate } = req.body;
    req.body.room = req.params.roomId;

        const room = await Room.findById(req.params.roomId);
    if (!room) {
      return next(
      new ErrorResponse('Room not available', 404 )
      )
    }

    if (room.available === false) {
      return next(
      new ErrorResponse('Room is already booked', 404 )
      )
    }
    const booking = new Booking(req.body);  

     const savedBooking = await booking.save();

     const bookingId = savedBooking._id; 
           room.available = false;
      await room.save();
  
      sendConfirmationEmail(guestName, guestEmail, bookingId);

    res.status(201).json({ message: 'Booking created successfully', booking });
});


exports.getAllBookings = asyncHandler(async (req, res, next) => {
  if (req.params.roomId) {
    const bookings = await Booking.find({
      room: req.params.roomId,
    });

    return res.status(200).json({
      success: true,
      data: bookings,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});


exports.getBookingById = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id).populate({
    path: 'room',
    select: 'name description',
  });

  if (!booking) {
    return next(
      new ErrorResponse(
        `Booking not found with id of ${req.params.id}`,
        404
      )
    );
  }

  res.status(200).json({
    success: true,
    data: booking,
  });
});

exports.updateBookingById = asyncHandler(
  async (req, res, next) => {
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return next(
        new ErrorResponse(
          `Booking with id of ${req.params.id} not found`,
          404
        )
      );
    }

    booking = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({ success: true, data: booking });
  }
);


exports.deleteBookingById = asyncHandler(
  async (req, res, next) => {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return next(
        new ErrorResponse(
          `Booking not found with id of ${req.params.id}`,
          404
        )
      );
    }


    booking.remove();

    res.status(200).json({
      success: true,
      data: {},
    });
  }
);
