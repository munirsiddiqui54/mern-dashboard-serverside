const mongoose=require('mongoose');

const productSchema=mongoose.Schema({
    name:String,
    price:Number,
    userId: String,
    category: String,
    company:String,
    description:String
})

module.exports=mongoose.model('products',productSchema);