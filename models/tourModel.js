const mongoose=require('mongoose');
const slugify=require('slugify');
const validator=require('validator');

const tourSchema = new mongoose.Schema({
    name:{
     type:String,
     required: [true,'A tour must have a name'],
     unique:true,
     maxlength:[40,'A tour must have less or equal than 40 characters'],
     minlength:[10,'A tour must have greater or equal than 10 characters'],
    //  validate:[validator.isAlpha,'Tour name should only contain characters']
    }, 
    slug:String,
    secretTour:{
        type:Boolean,
        default:false
    },
    duration:{
        type:Number,
        required:[true,'A tour must have duration']
    },
    maxGroupSize:{
        type:Number,
        required:[true,'A tour must have a group size']
    },
    difficulty:{
        type:String,
        required:[true,'A tour must have difficulty'],
        enum:{
            values: ['easy','medium','difficult'],
            message:'Difficulty is either :easy,medium,difficult'
        }
    },
    ratingAverage:{
        type:Number,
        default:4.5,
        min:[1,'Rating must be above 1.0'],
        max:[5,'Rating must be below 5.0']
    },
    ratingQuantity: {
     type:Number,
     default:0
    }, 
    price:{
     type:Number,
     required:[true,'A tour must have a price']
    },
    priceDiscount:{
        type:Number,
        validate:{
            validator:function(val){
                return val<this.price;
              },
              message:'Discount price should be below regular price'
        }
    },
    summary:{
        type:String,
        trim:true,
        required:[true,'A tour must have a summary']
    },
    description:{
type:String,
trim:true
    },
imageCover:{
    type:String,
    required:[true,'A tour must have image Cover']
},
images:[String],
createdAt:{
    type:Date,
    default:Date.now(),
    select:false
},
startDates:[Date]
//2-3-2023,11:32
},
{
toJSON:{virtuals:true},
toObject:{virtuals:true}
});

tourSchema.virtual('durationWeeks').get(function(){
    return this.duration/7;
});
//Document Middelware: runs before .save() and .create()
tourSchema.pre('save',function(next){
    this.slug=slugify(this.name,{lower:true});
    next();
});
//Query Middelware
tourSchema.pre(/^find/,function(next){
    this.find({secretTour:{$ne:true}});
    this.start=Date.now();
    next();
});
tourSchema.post(/^find/,function(docs,next){
     console.log(`Query took ${Date.now()-this.start} millisecounds`);
     //console.log(docs);
     next();
});
//Aggregation Middelware
tourSchema.pre('aggregate',function(next){
      this.pipeline().unshift({$match:{secretTour:{$ne:true}}});
      //console.log(this.pipeline());
      next();
});

const Tour = mongoose.model('Tour',tourSchema);

module.exports=Tour;