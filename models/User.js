/**
 * Created by zgs on 2017/4/30.
 */
var mongoose=require('mongoose');

// 用户的表结构
var usersSchema=require('../schemas/users');

mongoose.Promise = global.Promise;
module.exports=mongoose.model('User',usersSchema);

/*
// 创建一个表结构对象
var schema = new mongoose.Schema({ name: 'string', size: 'string' });
// 根据表结构对象创建一个模型类
var user = mongoose.model('user', schema);

var people = new user({ size: 'people' });
people.save(function (err) {
    if (err) {return handleError(err);}
    // saved!
})

// or

people.create({ size: 'people' }, function (err, people) {
    if (err) {return handleError(err);}
    // saved!
})
*/
