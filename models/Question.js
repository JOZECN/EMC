/**
 * Created by zgs on 2017/5/12.
 */
var mongoose=require('mongoose');

// 博客问答区的表结构
var categoriesSchema=require('../schemas/questions');

mongoose.Promise = global.Promise;
module.exports=mongoose.model('Question',categoriesSchema);