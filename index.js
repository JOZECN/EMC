/**
 * Created by zgs on 2017/4/29.
 */
// 加载express
var express=require('express');
//创建app应用，相当于=>Node.js Http.createServer();
var app=express();

var path = require('path');

// 加载数据库模块
var mongoose=require('mongoose');

// 加载body-parser，用以处理post提交过来的数据
var bodyParser=require('body-parser');

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

//引入cookie模块
var Cookies=require('cookies');

//请求User模型
var User=require('./models/User');

//app.get('/',function(req,res,next){
//    res.send('<h1>欢迎光临EMC！</h1>');
//});

// 设置静态文件托管
app.use('/public',express.static(__dirname+'/public'));

// 定义模板引擎，使用swig.renderFile方法解析后缀为html的文件
var swig=require('swig');
app.engine('html',swig.renderFile);
// 设置模板存放目录
app.set('views','./views');
// 注册模板引擎
app.set('view engine','html');
//开发过程中，为了减少麻烦，需要取消模板缓存
//发布时要删除这一段
swig.setDefaults({cache:false});


//app.get('/',function (req,res,next) {
    /*
     * 读取指定目录下的指定文件，解析并返回给客户端
     * 第一个参数：模板文件，相对于views目录,views/index.html
     * */
//    res.render('index');
//})

//设置cookie
app.use(function(req,res,next){
    req.cookies=new Cookies(req,res);

    // 解析cookie信息把它由字符串转化为对象
    if(req.cookies.get('userInfo')){
        try {
            req.userInfo=JSON.parse(req.cookies.get('userInfo'));

            // 获取当前用户登录的类型，是否管理员(管理员的账户最好不要记录在cookie中)
            User.findById(req.userInfo._id).then(function(userInfo){
                req.userInfo.isAdmin=Boolean(userInfo.isAdmin);

                next();
            });
        }catch(e){
            next();
        }
    }else {
        next();
    }
});

app.use('/admin',require('./routers/admin'));
app.use('/api',require('./routers/api'));
app.use('/',require('./routers/main'));

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27018/blog',function(err){
    if(err){
        console.log('数据库连接错误！');
    }else{
        console.log('数据库连接成功！');
        //监听http请求
        app.listen(9001);
    }
});

//监听http请求
//app.listen(9001);