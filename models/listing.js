const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./reviews");
const { required } = require("joi");

const listingSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
    },
    image: {
        url: String,
        filename: String,
    }, 
    price: {
        type: Number,
        required: true,
        min: 0
    },
    location: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        required: true
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        },
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    categories: [{
        type: String,
        enum: ['New', 'Trending', 'Arctic', 'Mountain top', 'Pool', 'A-frames', 'Top cities', 'Historic', 'Rooms', 'Amazing views'],
    }],
    geometry: {
        type: {
            type: String,
            enum: ["Point"], //
            required: true,
        },
        coordinates: {
            type: [Number],
            required: true,
        }
    }
});

listingSchema.post("findOneAndDelete", async(listing) => {
    if(listing) {
        await Review.deleteMany({_id: {$in: listing.reviews}});
    }
});

module.exports = mongoose.model("Listing", listingSchema);