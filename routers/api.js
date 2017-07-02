/**
 * Created by zgs on 2017/4/30.
 */
var express=require('express');

// 创建一个路由对象，此对象将会监听api文件夹下的url
var router=express.Router();

var User=require('../models/User');
var Content=require('../models/Content');
var Question=require('../models/Question');

router.get('/user',function(req,res,next){
    res.send('api-user');
});

var responseData=null;

router.use(function(req,res,next){
    responseData={
        code:0,
        message:''
    };
    next();
});

router.post('/user/register',function(req,res,next){
    var username=req.body.username;
    var password=req.body.password;
    var repassword=req.body.repassword;

    //用户名是否为空
    if(username==''){
        responseData.code=1;
        responseData.message='用户名不得为空！';
        res.json(responseData);
        return;
    }

    if(password==''){
        responseData.code=2;
        responseData.message='密码不得为空！';
        res.json(responseData);
        return;
    }

    if(repassword!==password){
        responseData.code=3;
        responseData.message='两次密码不一致！';
        res.json(responseData);
        return;
    }

    // 用户名是否被注册？
    User.findOne({
        username:username
    }).then(function(userInfo){
        if(userInfo){
            responseData.code=4;
            responseData.message='该用户名已被注册！';
            res.json(responseData);
            return;
        }else{//保存用户名信息到数据库中
            var user=new User({
                username:username,
                password:password
            });
            return user.save();
        }
    }).then(function(newUserInfo){
        //console.log(newUserInfo);
        responseData.message='注册成功！';
        res.json(responseData);
    });
});

router.post('/user/registerCheck',function(req,res,next){
    var username=req.body.username;

    // 用户名是否被注册？
    User.findOne({
        username:username
    }).then(function(userInfo){
        if(userInfo){
            responseData.code=4;
            responseData.message='该用户名已被注册！';
            res.json(responseData);
            return;
        }else{
            responseData.code=5;
            responseData.message='<i class="icon-ok"></i>';
            res.json(responseData);
            return;
        }
    });
});

router.post('/user/login',function(req,res,next){
    //console.log(req.body);
    var username=req.body.LoginUsername;
    var password=req.body.LoginPassword;

    if(username==''||password==''){
        responseData.code=1;
        responseData.message='用户名和密码不得为空！';
        res.json(responseData);
        return;
    }

    // 查询用户名和对应密码是否存在，如果存在则登录成功
    User.findOne({
        username:username,
        password:password
    }).then(function(userInfo){
        if(!userInfo){
            responseData.code=2;
            responseData.message='用户名或密码错误！';
            res.json(responseData);
            return;
        }else{
            responseData.message='登录成功！';
            responseData.userInfo=userInfo.username;
            //responseData.userInfo=userInfo.isAdmin;

            //每当用户访问站点，将保存用户信息。
            req.cookies.set('userInfo',JSON.stringify({
                    _id:userInfo._id,
                    username:userInfo.username,
                    isAdmin:userInfo.isAdmin,
                    isTeacher:userInfo.isTeacher,
                    userImg:userInfo.userImg
                })
            );//把id和用户名作为一个对象存到一个名字为“userInfo”的对象里面。

            res.json(responseData);
            return;
        }
    });
});

// 退出方法
router.get('/user/logout',function(req,res){
    /*req.cookies.set('userInfo',JSON.stringify({
        _id:null,
        username:null
    }));*/
    res.clearCookie('userInfo',{path:'/'})
    res.json(responseData);
    return;
});

// 评论提交
router.post('/comment/post',function(req,res,next){
    // 文章的id是需要前端提交的。
    var contentId=req.body.contentId||'';
    var postData={
        username:req.userInfo.username,
        postTime: new Date().toDateString(),
        content: req.body.content
    };

    // 查询当前内容信息
    Content.findOne({
        _id:contentId
    }).then(function(content){
        content.comments.push(postData);
        return content.save()
    }).then(function(newContent){//最新的内容在newContent！
        responseData.message='评论成功！';
        responseData.data=newContent;
        res.json(responseData);
    })

});

// 获取指定文章的所有评论
router.get('/comment',function(req,res,next){
    var contentId=req.query.contentId||'';
    Content.findOne({
        _id:contentId
    }).then(function(content){
        responseData.data=content;
        res.json(responseData);
    })
});

// 回答提交
router.post('/answer/post',function(req,res,next){
    // 问答的id是需要前端提交的。
    var questionId=req.body.questionId||'';
    var postData={
        username:req.userInfo.username,
        postTime: new Date().toDateString(),
        content: req.body.content
    };

    // 查询当前内容信息
    Question.findOne({
        _id:questionId
    }).then(function(content){
        content.comments.push(postData);
        return content.save();
    }).then(function(newContent){//最新的内容在newContent！
        responseData.message='评论成功！';
        responseData.data=newContent;
        res.json(responseData);
    })

});

router.get('/answer',function(req,res,next){
    var questionId=req.query.questionId||'';
    Question.findOne({
        _id:questionId
    }).then(function(content){
        responseData.data=content;
        res.json(responseData);
    })
});

// 点赞
router.post('/answer/like',function(req,res,next){
    var questionId=req.body.questionId||'';
    Question.findOne({
        _id: questionId
    }).then(function (content) {
        content.likes++;
        return content.save();
    }).then(function(content){
        responseData.data=content;
        res.json(responseData);
    })
});

// 收藏
router.post('/answer/favorite',function(req,res,next){
    var postData={
        postTime: new Date().toDateString(),
        favoriteId: req.body.questionId||req.body.contentId
    };
    User.findOne({
        _id: req.userInfo._id
    }).then(function (user) {
        user.favorite.push(postData);
        return user.save();
    }).then(function(){
        responseData.message="Favorited";
        res.json(responseData);
    })
});

//timeline获取文章内容
router.get('/timeline/article',function (req,res,next) {
    Content.find().sort({views: 1}).limit(5).then(function (content) {
        //console.log(content);
        responseData.data=content;
        res.json(responseData);
    })
});

//timeline获取文章内容
router.get('/timeline/question',function (req,res,next) {
    Question.find().sort({likes: 1}).limit(5).then(function (question) {
        responseData.data=question;
        res.json(responseData);
    })
});

module.exports=router;//把router的结果作为模块的输出返回出去！