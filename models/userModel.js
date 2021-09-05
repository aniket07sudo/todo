const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
    },
    password: {
        type: String,
        required: [true, 'Please Provide a Password'],
        select:false
    }
}, {
    toJSON: { virtuals: true },
    toObject:{virtuals:true}
});

userSchema.virtual('notes',  {
    ref: 'Note',
    localField:'_id',
    foreignField: 'userId',
    options:{sort:{'updatedAt':-1,'createdAt':-1},multi:true}
})

// userSchema.virtual('notes').get(function () {

//     return 10;
// })

userSchema.pre('save', async function (next) {
    this.password = await bcrypt.hash(this.password, 12);
    next();
})




  userSchema.methods.correctPassword = async function(candidatePassword,userPassword) {
      return await bcrypt.compare(candidatePassword,userPassword);
}


  
const User = mongoose.model('User', userSchema);

module.exports = User;