const express = require('express');
const dotenv = require('dotenv');
const app = express();
const cors = require('cors');
dotenv.config({ path: './config.env' });
const globalController = require('./controller/errorController');
const mongoose = require('mongoose');
const userRouter = require('./routes/userRoutes');

mongoose.connect('mongodb+srv://aniket:%40niket^1234@cluster0.irabd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority').then(res => {
    console.log("Database Connected");
}).catch(err => {
    console.log("Error :",err);
})

// mongoose.connect("mongodb://127.0.0.1:27017/todoo",{
//     useUnifiedTopology: true,
//     useNewUrlParser: true
// }).then(res => {
//     console.log("Database Connected");
// }).catch(err => {
//     console.log(err);
// })
app.use(cors());
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", userRouter);

app.use(globalController);
app.listen(process.env.PORT || 3000, () => {
    console.log("Server Running");
});

module.exports = app;