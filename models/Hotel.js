const mongoose = require('mongoose');
const slugify = require('slugify');

const HotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      unique: true,
      trim: true,
      maxLength: [
        50,
        'Name can not be more than 50 characters',
      ],
    },
    address: {
      type: String,
      required: [true, 'Please add an address'],
    },
    numberOfRooms: {
      type: Number,
      required: true
       },
    slug: String,
    website: {
      type: String,
      match: [
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
        'Please use a valid URL with HTTP or HTTPS',
      ],
    },
    phone: {
      type: String,
      maxlength: [
        20,
        'Phone number can not be longer than 20 characters',
      ],
    },
    email: {
      type: String,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
 
    averageRating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [10, 'Rating must can not be more than 10'],
    },
    averageCost: Number,
    photo: {
      type: String,
      default: 'no-photo.jpg',
    },
      city: {
        type: String,
        required: true
      },
      country: {
        type: String,
        required: true
      }, 
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create hotel slug from the name
HotelSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// // Update slug name when hotel name is updated
HotelSchema.pre('findOneAndUpdate', function (next) {
  if (this.getUpdate().name) {
    this.set({
      slug: slugify(this.getUpdate().name, { lower: true }),
    });
  }
  next();
});


// Cascade delete rooms when a hotel is deleted
HotelSchema.pre('remove', async function (next) {
  console.log(`rooms being removed from hotel ${this._id}`);
  await this.model('Room').deleteMany({
    hotel: this._id,
  });
  next();
});

// Reverse populate with virtuals
HotelSchema.virtual('rooms', {
  ref: 'Room',
  localField: '_id',
  foreignField: 'hotel',
  justOne: false,
});

module.exports = mongoose.model('Hotel', HotelSchema);
