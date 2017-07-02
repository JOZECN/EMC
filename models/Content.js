/**
 * Created by zgs on 2017/5/4.
 */
var mongoose=require('mongoose');
var contentsSchema=require('../schemas/contents');

module.exports=mongoose.model('Content',contentsSchema);