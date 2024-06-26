const express = require('express');
const app = express();
const morgan = require ("morgan");
const rateLimit=require('express-rate-limit');
const tourRouter=require('./routes/tourRoutes');
const userRouter=require('./routes/userRoutes');
const AppError =require('./utils/appError');
const globalErrorHandler=require('./controllers/errorController');
// app.get('/',(req,res)=>{
//     res.status(200).json({message:'Hello from the server side',app:'Natours'});
// });
// app.post('/',(req,res)=>{
//     res.send('You can post to this URL')
// })

// Global MIDDELWARES
if(process.env.NODE_ENV==='development'){
app.use(morgan('dev'));
}
const limiter=rateLimit({
  max:100,
  windowsMs:60*60*1000,
  message:'Too many requests from this IP,please try again in an hour!'
});
app.use('/api',limiter);
app.use(express.json());
app.use(express.static(`${__dirname}/public`))
app.use((req,res,next)=>{
    console.log('Hello from the middelware');
    next();
});
app.use((req,res,next)=>{
    req.requestTime=new Date().toISOString();
    next();
})

// ROUTE HANDLERS






// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id', getTour);
// app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

//ROUTES





app.use('/api/v1/tours',tourRouter);
app.use('/api/v1/users',userRouter);

app.all('*',(req,res,next)=>{
  // res.status(404).json({
  //    status:'fail',
  //    message:`Can't find ${req.originalUrl} on this server!`
  // });
  // const err=new Error(`Can't find ${req.originalUrl} on this server!`);
  // err.statusCode=404;
  // err.status='fail';
  next(new AppError(`Can't find ${req.originalUrl} on this server!`,404));
});

app.use(globalErrorHandler);

  
  // START SERVER

module.exports = app;
