// const fs = require('fs');
const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apifeatures');
const catchAsync =require('./../utils/catchAsync');
// const tours = JSON.parse(
//     fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
//   );

// exports.checkID = (req,res,next,val)=>{
//   console.log(`Tour id is: ${val}`);
//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid ID',
//     });
//   }
//     next();
// };

// exports.checkBody=(req,res,next)=>{
//   if(!req.body.name || !req.body.price){
//       return res.status(400).json({
//         status:'fail',
//         message:'Missing name or price'
//       });
//   }
//   next();
// }

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.fields = 'name,price,ratingAverage,summary,difficulty';
  req.query.sort = '-ratingAverage,price';
  next();
};

exports.getAllTours = async (req, res) => {
  try {
    // Build query
    // 1) Build Query
    // const queryObj = { ...req.query };
    // const excludeFields = ['page', 'sort', 'limit', 'fields'];
    // excludeFields.forEach((el) => delete queryObj[el]);

    // // 2) Advanced filtering
    // let queryStr = JSON.stringify(queryObj);
    // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    // console.log(JSON.parse(queryStr));
    // let query = Tour.find(JSON.parse(queryStr));

    // // 3) Sorting

    // if (req.query.sort) {
    //   const sortBy = req.query.sort.split(',').join(' ');
    //   query = query.sort(sortBy);
    // } else {
    //   query = query.sort('-createdAt');
    // }

    // //3) Field Limiting

    // if (req.query.fields) {
    //   const fields = req.query.fields.split(',').join(' ');
    //   query = query.select(fields);
    // } else {
    //   query = query.select('-__v');
    // }

    // const query = Tour.find()
    //     .where('duration')
    //     .equals(5)
    //     .where('difficulty')
    //     .equals('easy');

    // 4) Pagination

    // const page = req.query.page * 1 || 1;
    // const limit = req.query.limit * 1 || 100;
    // const skip = (page - 1) * limit;

    // query = query.skip(skip).limit(limit);

    // if (req.query.page) {
    //   const numTours = await Tour.countDocuments();
    //   if (skip >= numTours) throw new Error('This page does not exist');
    // }

    //Execute query
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limit()
      .paginate();
    const tours = await features.query;
    //query.sort().select().skip().limit()

    //Send response
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getTour = async (req, res) => {
  // console.log(req.params);
  // const id = req.params.id * 1;

  // const tour = tours.find((el) => el.id === id);

  try {
    const tour = await Tour.findById(req.params.id);
    //Tour.findOne({_id:req.params.id})
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};


exports.createTour = catchAsync(async (req, res,next) => {
  // console.log(req.body);
  // const newId = tours[tours.length - 1].id + 1;
  // const newTour = Object.assign({ id: newId }, req.body);
  // tours.push(newTour);
  // fs.writeFile(
  //   `${__dirname}/dev-data/data/tours-simple.json`,
  //   JSON.stringify(tours),
  //   (err) => {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  // } catch (err) {
  //   res.status(400).json({
  //     status: 'failed',
  //     message: 'Invalid ID Sent',
  //   });
  // }
});

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      message: 'Invalid ID Sent',
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      message: 'Invalid ID Sent',
    });
  }
};

exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: '$difficulty',
          num: { $sum: 1 },
          numRatings: { $sum: '$ratingQuantity' },
          avgRating: { $avg: '$ratingAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
    ]);
    res.status(201).json({
      status: 'success',
      data: {
        stats,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      message: 'Invalid ID Sent',
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1;
    console.log(year);
    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' },
        }
      },
      {
        $addFields: { month: '$_id' }
      },
      {
        $project: {
          _id: 0
        }
      },
      {
        $sort: {
          numTourStarts: -1
        }
      },
      { $limit: 6 },
    ]);
    res.status(201).json({
      status: 'success',
      data: {
        plan,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      message: 'Invalid ID Sent',
    });
  }
};
