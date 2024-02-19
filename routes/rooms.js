const express = require('express');
const {
  getRooms,
  getRoom,
  addRoom,
  updateRoom,
  deleteRoom,
  roomPhotoUpload,
  searchRooms,
  getHotelRooms
} = require('../controllers/rooms');

const Room = require('../models/Room');
 
// Include other resource routers
const bookingRouter = require('./bookings');

const router = express.Router({ mergeParams: true });

// Re-route into other resource routers
router.use('/:roomId/bookings', bookingRouter);

const advancedResults = require('../middleware/advancedResults');

router
  .route('/')
  .get(
    advancedResults(Room, {
      path: 'hotel',
      select: 'name description',
    }),
    getRooms
  )
  .post(addRoom);

router
  .route('/:id/photo')
  .post(
    roomPhotoUpload
  );
  router.get(
    '/hotel/:hotelId',
    advancedResults(Room),
    getHotelRooms
  );
  router
  .route('/search')
  .get(searchRooms);
router
  .route('/:id')
  .get(getRoom)
  .put(updateRoom)
  .delete(
    deleteRoom
  ); 

 

module.exports = router;
