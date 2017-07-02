/**
 * Created by zgs on 2017/5/3.
 */
var mongoose=require('mongoose');

// 博客分类的表结构
module.exports= new mongoose.Schema({
    // 分类名称
    name: String
});