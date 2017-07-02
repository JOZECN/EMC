/**
 * Created by zgs on 2017/4/30.
 */
var express=require('express');

// 创建一个路由对象，此对象将会监听admin文件下的url
var router=express.Router();

var responseData=null;
router.use(function(req,res,next){
    responseData={
        code:0,
        message:''
    };
    next();
});

//用户管理首页
var User=require('../models/User');
renderAdminTable(User,'user',10);

var Category=require('../models/Categories');
renderAdminTable(Category,'category',5);

var Content=require('../models/Content');
renderAdminTable(Content,'content',10,['category','user']);

var Question=require('../models/Question');
renderAdminTable(Question,'question',10,'user');

var setSlide=require('../models/Content');
renderAdminTable(setSlide,'setSlide',999,['category','user']);

// 这是一个功能函数
function renderAdminTable(obj,type,limit,_query){
    router.get('/'+type+'/', function (req,res,next) {
        var page=req.query.page||1;
        var count=0;

        obj.count().then(function(_count){
            count=_count;
            var pages=Math.ceil(count/limit);
            page=Math.min(page,pages);
            page=Math.max(page,1);

            var skip=(page-1)*limit;
            var userId=req.userInfo._id;

            /*
             * sort方法排序，根据id，
             * */
            if(req.userInfo.isAdmin) {
                var newObj = _query ? obj.find().sort({_id: -1}).limit(limit).skip(skip).populate(_query) : obj.find().sort({_id: -1}).limit(limit).skip(skip);
            }else {
                if (type == 'user' || type == 'category') {
                    var newObj = _query ? obj.find().sort({_id: -1}).limit(limit).skip(skip).populate(_query) : obj.find().sort({_id: -1}).limit(limit).skip(skip);
                }
                else if(type == 'setSlide'){
                    var newObj = _query ? obj.find({"$or":[{"slideRank":"1"},{"slideRank":"2"},{"slideRank":"3"},{"slideRank":"4"},{"slideRank":"5"}]}).sort({_id: -1}).limit(limit).skip(skip).populate(_query) : obj.find({"$or":[{"slideRank":"1"},{"slideRank":"2"},{"slideRank":"3"},{"slideRank":"4"},{"slideRank":"5"}]}).sort({_id: -1}).limit(limit).skip(skip);
                }
                else {
                    var newObj = _query ? obj.find({user: Object(userId)}).sort({_id: -1}).limit(limit).skip(skip).populate(_query) : obj.find({user: Object(userId)}).sort({_id: -1}).limit(limit).skip(skip);
                }
            }
            newObj.then(function(data){
                //console.log(data);
                res.render('admin/'+type+'_index',{
                    type:type,
                    userInfo:req.userInfo,
                    data:data,
                    page:page,
                    pages:pages,
                    limit:limit,
                    count:count
                });
            });
        });//获取总页数
    });
}

router.use(function(req,res,next){
    if(req.userInfo==null){
        // 如果当前用户不是管理员
        res.send('当前游客身份请返回<a href="/">主页</a>登录！');
        return;
    }else{
        next();
    }
});

router.get('/',function(req,res,next){
    res.render('admin/index',{
        userInfo:req.userInfo
    });
});

router.get('/userInfo',function(req,res,next){
    var userId=req.userInfo._id;
    var data={};
    User.find({_id:userId}).then(function(user){
        data.user=user[0];
        data.userInfo=req.userInfo;
        //console.log(data);
        res.render('admin/userInfo',data);
    })
});

router.post('/userInfo/edit',function(req,res,next){
    var id=req.userInfo._id||'';
    var username=req.body.username;
    var userEmail=req.body.userEmail||'';
    var userImg=req.body.userImg;
    var userAliPayImg=req.body.userAliPayImg;
    var userWeChatPayImg=req.body.userWeChatPayImg;

    if(username==''){
        responseData.code=1;
        responseData.message='用户名不得为空！';
        res.json(responseData);
        return;
    }

    if(responseData.code!=1){
        User.findOne({
            _id: id
        }).then(function (content) {
            if (!content) {
                res.render('admin/error', {
                    userInfo: req.body.userInfo,
                    message: '用户id事先被删除了！'
                });
                return Promise.reject();
            } else {
                return User.update({
                    _id: id
                }, {
                    username: username,
                    userEmail: userEmail,
                    userImg: userImg,
                    userAliPayImg: userAliPayImg,
                    userWeChatPayImg: userWeChatPayImg
                });
            }
        }).then(function () {
            responseData.code=2;
            responseData.message='信息修改成功! ';
            res.json(responseData);
            return;
        });
    }
});

router.get('/changePassword',function(req,res,next){
    res.render('admin/change_password',{
        userInfo:req.userInfo
    });
});

router.get('/category/',function(req,res,next){
    res.render('admin/category_index',{
        userInfo:req.userInfo
    });
});

// 添加分类
router.get('/category/add',function(req,res,next){
    res.render('admin/category_add',{
        userInfo:req.userInfo
    });
});

// 添加分类及保存方法：post
router.post('/category/add',function(req,res,next){
    //console.log(req.body);
    //处理前端数据
    var name=req.body.name||'';
    if(name===''){
        /*res.render('admin/error',{
            userInfo:req.userInfo
        });*/
        res.render('admin/error',{
            userInfo:req.userInfo,
            message:'提交的内容不得为空！',
            operation:{
                url:'javascript:window.history.back()',
                operation:'返回上一步'
            }
        });
    }
    // 查询数据是否为空
    Category.findOne({
        name:name
    }).then(function(rs){
        if(rs){//数据库已经有分类
            res.render('admin/error',{
                userInfo:req.userInfo,
                message:'数据库已经有该分类了',
                operation:{
                    url:'javascript:window.history.back()',
                    operation:'返回上一步'
                }
            });
            return Promise.reject();
        }else{//否则表示数据库不存在该记录，可以保存。
            return  new Category({
                name:name
            }).save();
        }
    }).then(function(newCategory){
        res.render('admin/success',{
            userInfo:req.userInfo,
            message:'分类保存成功！',
            operation:{
                url:'javascript:window.history.back()',
                operation:'返回上一步'
            }
        })
    });
});

// 分类修改
router.get('/category/edit',function(req,res,next){

    // 获取修改的分类信息，并以表单的形式呈现，注意不能用body，_id是个对象，不是字符串
    var id=req.query.id||'';

    // 获取要修改的分类信息
    Category.findOne({
        _id:id
    }).then(function(category){
        if(!category){
            res.render('admin/error',{
                userInfo:req.userInfo,
                message:'分类信息不存在！'
            });
            return Promise.reject();
        }else{
            res.render('admin/edit',{
                userInfo:req.userInfo,
                category:category
            });
        }
    });
});

//分类保存
router.post('/category/edit/',function(req,res,next){
    //console.log(req.query.id);
    var id=req.query.id||'';
    var name=req.body.name||name;
    Category.findOne({
        _id:id
    }).then(function(category){

        if(!category){
            res.render('admin/error',{
                userInfo:req.body.userInfo,
                message:'分类信息不存在！'
            });
            return Promise.reject();
        }else{
            // 如果用户不做任何修改就提交
            if(name==category.name){
                res.render('admin/success',{
                    userInfo:req.body.userInfo,
                    message:'修改成功！',
                    operation:{
                        url:'/admin/category',
                        operation:'返回分类管理'
                    }
                });
                return Promise.reject();
            }else{
                // 再查询id：不等于当前id
                return Category.findOne({
                    _id: {$ne: id},
                    name:name
                });
            }
        }
    }).then(function(same){
        if(same){
            res.render('admin/error',{
                userInfo:req.body.userInfo,
                message:'已经存在同名数据！'
            });
            return Promise.reject();
        }else{
            return Category.update({
                _id:id
            },{
                name:name
            });
        }
    }).then(function(resb){
        res.render('admin/success',{
            userInfo:req.body.userInfo,
            message:'修改成功！',
            operation:{
                url:'/admin/category',
                operation:'返回分类管理'
            }
        });
    });
});

router.post('/category/delete',function(req,res,next){
    var id=req.body.id||'';
    //console.log(id);
    Category.remove({
        _id:id
    }).then(function(){
        responseData.code=1;
        responseData.message='分类删除成功! ';
        res.json(responseData);
        return;
    });
});

// 内容管理
router.get('/content',function(req,res,next){
    res.render('admin/content_index',{
        userInfo:req.userInfo
    });
});

// 添加文章
router.get('/content/add',function(req,res,next){
    Category.find().then(function(categories){
        //console.log(categories)
        res.render('admin/content_add',{
            userInfo:req.userInfo,
            categories:categories
        });
    })
});

router.post('/content/add',function(req,res,next){
    var title=req.body.title;
    var description=req.body.description;
    var content=req.body.content;

    if(title==''){
        responseData.code=1;
        responseData.message='标题不得为空！';
        res.json(responseData);
        return;
    }
    if(description==''){
        responseData.code=2;
        responseData.message='摘要不得为空！';
        res.json(responseData);
        return;
    }
    if(content==''){
        responseData.code=3;
        responseData.message='内容不得为空！';
        res.json(responseData);
        return;
    }

    if(responseData.code!=1&&responseData.code!=2&&responseData.code!=3){
        new Content({
            category:req.body.categories,
            title:req.body.title,
            description:req.body.description,
            content:req.body.content,
            date:new Date().toDateString(),
            user:req.userInfo._id,
            views:0,
            featuredImg: req.body.featuredImg
        }).save().then(function(){
            /*res.render('admin/success',{
                userInfo:req.userInfo,
                message:'文章发布成功！'
            });*/
            responseData.code=4;
            responseData.message='文章发表成功';
            res.json(responseData);
            return;
        });
    }
});

// 修改
router.get('/content/edit',function(req,res,next){
    var id=req.query.id||'';

    Content.findOne({
        _id:id
    }).then(function(content){
        if(!content){
            res.render('admin/error',{
                userInfo:req.userInfo,
                message:'该文章id已被删除了。'
            });
            return Promise.reject();
        }else{
            Category.find().then(function(categories){
                //console.log(content);
                res.render('admin/content_edit',{
                    userInfo:req.userInfo,
                    categories:categories,
                    data:content
                });
            });
        }
    });
});

// 保存文章修改
router.post('/content/edit',function(req,res,next){
    var id=req.body.id||'';
    //console.log(id);
    var title=req.body.title;
    var description=req.body.description;
    var content=req.body.content;

    if(title==''){
        responseData.code=1;
        responseData.message='标题不得为空！';
        res.json(responseData);
        return;
    }
    if(description==''){
        responseData.code=2;
        responseData.message='摘要不得为空！';
        res.json(responseData);
        return;
    }
    if(content==''){
        responseData.code=3;
        responseData.message='内容不得为空！';
        res.json(responseData);
        return;
    }

    if(responseData.code!=1&&responseData.code!=2&&responseData.code!=3){
        Content.findOne({
            _id: id
        }).then(function (content) {
            if (!content) {
                res.render('admin/error', {
                    userInfo: req.body.userInfo,
                    message: '文章id事先被删除了！'
                });
                return Promise.reject();
            } else {
                return Content.update({
                    _id: id
                }, {
                    category: req.body.categories,
                    title: req.body.title,
                    description: req.body.description,
                    content: req.body.content,
                    user: req.userInfo._id,
                    views: Number(content.views),
                    featuredImg: req.body.featuredImg
                });
            }
        }).then(function () {
            responseData.code=4;
            responseData.message='文章修改成功! ';
            res.json(responseData);
            return;
        });
    }
});

router.post('/content/delete',function(req,res,next){
    var id=req.body.id||'';
    //console.log(id);
    Content.remove({
        _id:id
    }).then(function(){
        responseData.code=1;
        responseData.message='文章删除成功! ';
        res.json(responseData);
        return;
    });
});

// 问答管理
router.get('/question',function(req,res,next){
    res.render('admin/question_index',{
        userInfo:req.userInfo
    });
});

// 提出问题
router.get('/question/add',function(req,res,next){
    res.render('admin/question_add',{
        userInfo:req.userInfo
    })
});

router.post('/question/add',function(req,res,next){
    var title=req.body.title;
    var content=req.body.content;

    if(title==''){
        responseData.code=1;
        responseData.message='标题不得为空！';
        res.json(responseData);
        return;
    }
    if(content==''){
        responseData.code=2;
        responseData.message='内容不得为空！';
        res.json(responseData);
        return;
    }

    if(responseData.code!=1&&responseData.code!=2){
        new Question({
            title:req.body.title,
            content:req.body.content,
            date:new Date().toDateString(),
            user:req.userInfo._id,
            likes:0,
            solved:false
        }).save().then(function(){
            responseData.code=3;
            responseData.message='问答发表成功';
            res.json(responseData);
            return;
        });
    }
});

// 问题修改
router.get('/question/edit',function(req,res,next){
    var id=req.query.id||'';

    Question.findOne({
        _id:id
    }).then(function(question){
        if(!question){
            res.render('admin/error',{
                userInfo:req.userInfo,
                message:'该问题id已被删除了。'
            });
            return Promise.reject();
        }else{
            res.render('admin/question_edit',{
                userInfo:req.userInfo,
                data:question
            });
        }
    });
});

// 保存问题修改
router.post('/question/edit',function(req,res,next){
    var id=req.body.id||'';
    var title=req.body.title;
    var content=req.body.content;

    if(title==''){
        responseData.code=1;
        responseData.message='标题不得为空！';
        res.json(responseData);
        return;
    }
    if(content==''){
        responseData.code=2;
        responseData.message='内容不得为空！';
        res.json(responseData);
        return;
    }

    if(responseData.code!=1&&responseData.code!=2){
        Question.findOne({
            _id: id
        }).then(function (question) {
            if (!question) {
                res.render('admin/error', {
                    userInfo: req.body.userInfo,
                    message: '问答id事先被删除了！'
                });
                return Promise.reject();
            } else {
                return Question.update({
                    _id: id
                }, {
                    title: req.body.title,
                    content: req.body.content,
                    user: req.userInfo._id,
                    likes: Number(question.likes)
                });
            }
        }).then(function () {
            responseData.code=3;
            responseData.message='问答修改成功! ';
            res.json(responseData);
            return;
        });
    }
});

router.post('/question/delete',function(req,res,next){
    var id=req.body.id||'';
    //console.log(id);
    Question.remove({
        _id:id
    }).then(function(){
        responseData.code=1;
        responseData.message='问题删除成功! ';
        res.json(responseData);
        return;
    });
});

router.post('/question/solved',function(req,res,next){
    var id=req.body.id||'';
    //console.log(id);
    Question.update({
        _id:id
    }, {
        solved: true
    }).then(function(){
        responseData.code=1;
        responseData.message='问题状态更新成功! ';
        res.json(responseData);
        return;
    });
});

// 设置轮播图页面
router.get('/setSlide/',function(req,res,next){
    res.render('admin/setSlide_index',{
        userInfo:req.userInfo
    })
});

router.post('/setSlide/loadSlideSetting',function(req,res,next) {
    Content.find({
        "$or":[
          {"slideRank": "1"},
          {"slideRank": "2"},
          {"slideRank": "3"},
          {"slideRank": "4"},
          {"slideRank": "5"}
        ]
    }).sort({"slideRank": 1}).then(function(loadSlideSetting){
        responseData.loadSlideSetting=loadSlideSetting;
        res.json(responseData);
        return;
    });
});

router.post('/setSlide/setSlideComplete',function(req,res,next){
    //console.log(req.body);
    var rank=req.body.rank;
    var contentId=req.body.contentId;
    var slideImgUrl=req.body.slideImgUrl;

    setSlide.update({
        _id:contentId
    }, {
        slideRank: rank,
        slideImg: slideImgUrl
    }).then(function () {
        responseData.code=1;
        responseData.message='设置成功! ';
        res.json(responseData);
        return;
    })
});

//引入formidable模块
var formidable = require('formidable');
//富文本编辑器图片上传功能
router.post('/uploadImg', function(req, res, next) {
    //console.log(req);
    var form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.uploadDir = __dirname + '/../public/upload/image/content';
    form.parse(req, function (err, fields, files) {
        if (err) {
            throw err;
        }
        var image = files.file;
        //console.log(files);
        var path = image.path;
        path = path.replace('/\\/g', '/');
        var url = '/../public/upload/image/content' + path.substr(path.lastIndexOf('/'), path.length);
        var info = {
            "error": 0,
            "url": url
        };
        res.send(info);
    });
});

//分目录存储 图片上传
router.post('/uploadUserImg', function(req, res, next) {
    //console.log(req);
    var form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.uploadDir = __dirname + '/../public/upload/image/user';
    form.parse(req, function (err, fields, files) {
        if (err) {
            throw err;
        }
        var image = files.file;
        //console.log(files);
        var path = image.path;
        path = path.replace('/\\/g', '/');
        var url = '/../public/upload/image/user' + path.substr(path.lastIndexOf('/'), path.length);
        var info = {
            "error": 0,
            "url": url
        };
        res.send(info);
    });
});

module.exports=router;//把router的结果作为模块的输出返回出去！