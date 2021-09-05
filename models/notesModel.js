const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const notesSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    fontSize: {
        type: String
    },
    image: {
        type: String
    },
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required:true
    }
}, { timestamps: true });

// notesSchema.set('toObject', { virtuals: true });
// notesSchema.set('toJSON', { virtuals: true });

const Notes = mongoose.model('Note', notesSchema);

module.exports = Notes;