/**
 * Created by zgs on 2017/5/3.
 */
var mongoose=require('mongoose');

// 博客分类的表结构
var categoriesSchema=require('../schemas/categories');

mongoose.Promise = global.Promise;
module.exports=mongoose.model('Category',categoriesSchema);