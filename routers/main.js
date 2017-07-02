/**
 * Created by zgs on 2017/4/30.
 */
var express=require('express');

// 创建一个路由对象，此对象将会监听api文件夹下的url
var router=express.Router();
var Category=require('../models/Categories');
var Content=require('../models/Content');
var Question=require('../models/Question');
renderAdminTable(Question,'question',10,'user');

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

            /*
             * sort方法排序，根据id，
             * */
            var newObj = _query ? obj.find().sort({_id: -1}).limit(limit).skip(skip).populate(_query) : obj.find().sort({_id: -1}).limit(limit).skip(skip);

            newObj.then(function(data){
                //console.log(data);
                res.render('main/'+type,{
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

router.get('/login',function(req,res,next){
    res.render('main/login',{
        userInfo:req.userInfo
    });
});

router.get('/about',function(req,res,next){
    var contentId='5922ec873c64afec6f7554a9';
    var data={
        userInfo:req.userInfo,
        categories:[],
        content:null
    };

    Category.find().then(function(){
        data.categories='5911d729e1e38a38d72e24d0';
        return Content.findOne({_id:contentId}).populate(['category','user']);
    }).then(function(content){
        data.content=content;
        content.views++;//保存阅读数
        content.save();
        //console.log(data);
        res.render('main/about',data);
    });
});

router.get('/resources',function(req,res,next){
    res.render('main/resources',{
        userInfo:req.userInfo
    });
});

router.get('/question',function(req,res,next){
    res.render('main/question',{
        userInfo:req.userInfo
    });
});

router.get('/',function(req,res,next){
    var data={
        userInfo:req.userInfo,
        category:req.query.category||'',
        categories:[],
        count:0,
        page:Number(req.query.page||1),
        limit:9,
        pages:0
    };

    // 读取分类信息
    Category.find().then(function(categories){
        data.categories=categories;
        return Content.count();
    }).then(function(count){
        data.count=count;
        //计算总页数
        data.pages=Math.ceil(data.count/data.limit);
        // 取值不超过pages
        data.page=Math.min(data.page,data.pages);
        // 取值不小于1
        data.page=Math.max(data.page,1);
        // skip不需要分配到模板中，所以忽略。
        var skip=(data.page-1)*data.limit;

        return Content.find().limit(data.limit).skip(skip).sort({_id:-1}).populate(['category','user']);
    }).then(function(indexData) {
        data.data = indexData;
    }).then(function () {
        return Content.find({"$or":[{"slideRank":"1"},{"slideRank":"2"},{"slideRank":"3"},{"slideRank":"4"},{"slideRank":"5"}]}).limit(5).sort({slideRank:1}).populate(['category','user']);
    }).then(function (slideData) {
        data.slideData=slideData;
        //console.log(data.slideData);//这里有你想要的所有数据
        res.render('main/index',data);
    })
});

router.get('/article',function(req,res,next){
    var data={
        userInfo:req.userInfo,
        category:req.query.category||'',
        categories:[],
        count:0,
        page:Number(req.query.page||1),
        limit:9,
        pages:0
    };

    var where={};
    if(data.category){
        where.category=data.category
    }

    // 读取分类信息
    Category.find().then(function(categories){
        data.categories=categories;
        return Content.where(where).count();
    }).then(function(count){
        data.count=count;
        //计算总页数
        data.pages=Math.ceil(data.count/data.limit);
        // 取值不超过pages
        data.page=Math.min(data.page,data.pages);
        // 取值不小于1
        data.page=Math.max(data.page,1);
        // skip不需要分配到模板中，所以忽略。
        var skip=(data.page-1)*data.limit;

        return Content.where(where).find().limit(data.limit).skip(skip).sort({_id:-1}).populate(['category','user']);
    }).then(function(indexData) {
        data.data = indexData;
        res.render('main/article',data);
    })
});

router.get('/view/',function(req,res,next){
    var contentId=req.query.contentId||'';
    var data={
        userInfo:req.userInfo,
        categories:[],
        content:null
    };

    Category.find().then(function(categories){
        data.categories=categories;
        return Content.findOne({_id:contentId}).populate(['category','user']);
    }).then(function(content){
        data.content=content;
        content.views++;//保存阅读数
        content.save();
        //console.log(data);
        res.render('main/view',data);
    });
});

router.get('/question/view/',function(req,res,next){
    var questionId=req.query.questionId||'';
    var data={
        userInfo:req.userInfo,
        content:null
    };

    Question.find().then(function (question) {
        return Question.findOne({_id:questionId}).populate('user');
    }).then(function(question){
        data.content=question;
        //console.log(data);
        res.render('main/question_view',data);
    });
});

module.exports=router;//把router的结果作为模块的输出返回出去！