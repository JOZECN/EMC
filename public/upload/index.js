var express=require('express');
var app=express();
var path = require('path');
var mongoose=require('mongoose');
var bodyParser=require('body-parser');

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

var Cookies=require('cookies');

var User=require('./models/User');

app.use('/public',express.static(__dirname+'/public'));

var swig=require('swig');
app.engine('html',swig.renderFile);
app.set('views','./views');
app.set('view engine','html');
swig.setDefaults({cache:false});

app.use(function(req,res,next){
  req.cookies=new Cookies(req,res);
  if(req.cookies.get('userInfo')){
    try {
      req.userInfo=JSON.parse(req.cookies.get('userInfo'));
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
mongoose.connect('mongodb://127.0.0.1:27018/blog',function(err){
  if(err){
    console.log('数据库连接错误！');
  }else{
    console.log('数据库连接成功！');
    app.listen(3000);
  }
});