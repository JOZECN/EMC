/**
 * Created by zgs on 2017/4/30.
 */
var mongoose=require('mongoose');//引入模块

// 返回用户的表结构
module.exports= new mongoose.Schema({
    // 用户名
    username: String,
    // 密码
    password: String,

    // 是否管理员
    isAdmin: {
        type: Boolean,
        default: false
    },

    // 是否教师,除开教师和管理员,剩下就是学生
    isTeacher: {
        type: Boolean,
        default: false
    },

    userAliPayImg: {
        type: String,
        default: ''
    },

    userWeChatPayImg: {
        type: String,
        default: ''
    },

    userImg: {
        type: String,
        default: '../public/img/user/avatar.png'
    },

    userEmail: String,

    favorite: {
        type:Array,
        default:[]
    }

});