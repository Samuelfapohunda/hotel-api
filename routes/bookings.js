const express = require('express');
const {
    getBookingById,
    getAllBookings,
    createBooking,
    updateBookingById,
    deleteBookingById,
  } = require('../controllers/bookings');
const advancedResults = require('../middleware/advancedResults');
const Booking = require('../models/Booking');  


const router = express.Router({ mergeParams: true });


router.route('/').get(advancedResults(Booking, {
    path: 'room',
    select: 'name description',
  }), getAllBookings).post(createBooking)

// Route to retrieve a single booking by ID
router.route('/:id').get(getBookingById);

// Route to update a booking by ID
router.route('/:id').put(updateBookingById);

router.route('/:id').delete(deleteBookingById);

module.exports = router;
