/**
 * Created by zgs on 2017/5/24.
 */
/**
 * Created by zgs on 2017/5/12.
 */
var mongoose=require('mongoose');

module.exports=new mongoose.Schema({
  // 标题
  title:String,

  // 问题内容
  content:{
    type:String,
    default:''
  },

  // 当前时间
  date:String,

  user: {
    //类型
    type:mongoose.Schema.Types.ObjectId,
    //引用
    ref:'User'
  },

  likes:{
    type:Number,
    default:0
  },

  solved:{
    type:Boolean,
    default:false
  },

  // 评论
  comments: {
    type:Array,
    default:[]
  }

});