const express = require('express');
const {
  getHotels,
  getHotel,
  createHotel,
  updateHotel,
  deleteHotel,
  hotelPhotoUpload,
  searchHotels
} = require('../controllers/hotels');

const Hotel = require('../models/Hotel');

// Include other resource routers
const roomRouter = require('./rooms');

const router = express.Router();

const advancedResults = require('../middleware/advancedResults');


// Re-route into other resource routers
router.use('/:hotelId/rooms', roomRouter);


router
  .route('/')
  .get(advancedResults(Hotel, 'rooms'), getHotels)
  .post(
    createHotel
  );

router
  .route('/:id/photo')
  .put(
    hotelPhotoUpload
  );

router
.route('/search')
.get(searchHotels);

router
  .route('/:id')
  .get(getHotel)
  .put(
    updateHotel
  ) 
  .delete(
    deleteHotel
  );  

 

module.exports = router;
