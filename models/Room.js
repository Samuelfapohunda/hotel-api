const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, 'Please add a Room name'],
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  available: {
    type: Boolean,
    default: true, 
    required: [true, 'Please add availability'],
  },
  minimumNightStay: {
    type: Number
  },
  maximumNightStay: {
    type: Number
  },
  cost: {
    type: Number,
    required: [true, 'Please add room cost'],
  },
  roomType: {
    type: [String],
    required: true,
    enum: ['Single', 'Double', 'Tripple', 'King Size'],
  },
  minimumOccupancy: {
    type: Number,
    min: 1,
    max: 5,
    required: [
      true,
      'Please add number occupants between 1 and 5',
    ],
  },
  checkInDate: {
    type: Date,
  },
  checkOutDate: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  hotel: {
    type: mongoose.Schema.ObjectId,
    ref: 'Hotel',
    required: true,
  }
},
{
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
}
);


// Reverse populate with virtuals
RoomSchema.virtual('bookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'room',
  justOne: false,
});

// Static method to get average of costs
RoomSchema.statics.getAverageCost = async function (
  hotelId
) {
  const obj = await this.aggregate([
    {
      $match: { hotel: hotelId },
    },
    {
      $group: {
        _id: '$hotel',
        averageCost: { $avg: '$cost' },
      },
    },
  ]);

  try {
    await this.model('Hotel').findByIdAndUpdate(hotelId, {
      averageCost: Math.ceil(obj[0].averageCost / 10) * 10,
    });
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageCost after save
RoomSchema.post('save', function () {
  this.constructor.getAverageCost(this.hotel);
});

// Call getAverageCost before remove
RoomSchema.pre('remove', function () {
  this.constructor.getAverageCost(this.hotel);
});

module.exports = mongoose.model('Room', RoomSchema);
