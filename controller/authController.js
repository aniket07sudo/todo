const User = require('../models/userModel');
const Notes = require('../models/notesModel');
const jwt = require('jsonwebtoken');
const appError = require('../utils/appError');
const { promisify } = require('util');
const multer = require('multer');
const sharp = require('sharp');



const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}

const cookieOption = {
    expires:new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
    secure:false
}

createSendToken = (user,statusCode,res) => {
    const token = signToken(user._id);
    res.cookie('jwt', token, cookieOption);
    if (user) {
        res.status(statusCode).json({
            status: 'success',
            token,
            user
        })
    }

}

exports.getUserByToken = async (req, res, next) => {
    
    try {

    
        const token = req.headers.authorization.split(" ")[1];
        const decoded = await promisify(jwt.verify)(
            token, process.env.JWT_SECRET
        );
        const currentUser = await User.findById(decoded.id).populate('notes');
        if (currentUser) {
            res.json({
                status: 'success',
                currentUser
            })
        } else {
            res.json({
                status: 'error',
                message: 'Invalid Token'
            })
        }
    } catch (err) {
        console.log(err);
    }
}

exports.isLoggedIn = async (req,res,next) => {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = await promisify(jwt.verify)(
        token, process.env.JWT_SECRET
    );
    const currentUser = await User.findById(decoded.id);
    req.user = currentUser;
    if (currentUser) {
        return next();
    } else {
        return next(new appError('Not Logged in',400));
    }
}

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
    console.log(file);
    if(file.mimetype.startsWith('image')) {
        cb(null,true);
    } else {
        cb(new appError('Not an image! Please upload only images',400),false);
    }
};

const upload = multer({
    storage:multerStorage,
    fileFilter: multerFilter,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    dest:'uploads/'
})

exports.uploadUserPhoto = upload.single('noteImage');
exports.resizePhoto = (req, res, next) => {
    if (!req.file) return next();
    console.log(req.file);
    req.file.filename = `user-${req.user._id}-${Date.now()}.jpeg`;
    sharp(req.file.buffer).resize(1000,500).toFormat('jpeg').jpeg({quality:90}).toFile(`public/${req.file.filename}`);
    next();
}


exports.addNotes = async (req, res, next) => {
    try {
        let url;
        // const filteredBody = filterObj(req.body, 'name', 'password');
        if (req.file) {
            req.body.photo = req.file.filename;
            req.body.url = `${req.headers.host}/${req.file?.filename}`;
        url = `http://${req.headers.host}/${req.file?.filename}`;

        } 
        // const updatedUser = await User.findByIdAndUpdate(req.user.id, req.body, { new: true, runValidators: true });
        // const note = await Notes.findById(req.body.noteId);
        var Note;
       
        if (req.body.noteId) {
             Note = await Notes.findByIdAndUpdate(req.body.noteId, {
                title: req.body.title,
                text: req.body.text,
                fontSize: req.body.fontSize,
                image: url,
                userId:req.user.id
             });

        } else {
            Note = await Notes.create({
            title: req.body.title,
            text: req.body.text,
            fontSize: req.body.fontSize,
            image: url,
            userId:req.user.id
            })
        }
      

        res.status(200).json({
            status: 'success',
            Note
            // addedNote
        })
    } catch (err) {
        console.log(err);
    }
}

exports

exports.signup = async (req, res, next) => {
    try {
        const newUser = await User.create(req.body);
        
        createSendToken(newUser, 200, res);

    } catch (err) {
        console.log(err);
        if (err.code == 11000) {
            res.status(409).json({
                status:'error',
                message:'User Already Exists'
            })
        } 
        
    }
}

exports.login = async (req,res,next) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email }).select('+password').populate('notes');
        if (!user || !(await user.correctPassword(password, user.password))) {
            return next(new appError('Incorrect Email or Password', 401));
        }
        createSendToken(user, 200, res);
        next();
        
    } catch (err) {
        console.log(err);
    }
}

exports.deleteNote = async (req,res,next) => {
    try {
        const Note = await Notes.findByIdAndDelete(req.body.id);

        res.json({
            status: 'success',
            Note
        })
    } catch (err) {
        console.log(err);
    }
}