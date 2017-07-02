/**
 * Created by zgs on 2017/5/4.
 */
var mongoose=require('mongoose');

module.exports=new mongoose.Schema({
    // 关联字段 -分类的id
    category: {
        // 类型
        type:mongoose.Schema.Types.ObjectId,
        // 引用，实际上是说，存储时根据关联进行索引出分类目录下的值。而不是存进去的值。
        ref:'Category'
    },

    // 标题
    title: {
        type:String,
        default:''
    },

    // 简介
    description: {
        type:String,
        default:''
    },

    // 文章内容
    content: {
        type:String,
        default:''
    },

    // 当前时间
    date: String,

    featuredImg: {
        type:String,
        default:'../../public/img/1.jpg'
    },

    user: {
        //类型
        type:mongoose.Schema.Types.ObjectId,
        //引用
        ref:'User'
    },

    slideImg: {
        type:String,
        default:''
    },

    slideRank: {
        type:String,
        default:''
    },

    likes: {
        type:Number,
        default:0
    },

    views: {
        type:Number,
        default:0
    },

    // 评论
    comments: {
        type:Array,
        default:[]
    }

});