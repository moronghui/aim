var express = require('express');
var bodyParser = require('body-parser');
var common = require('./api/common');
var util = require('./api/util/util.js');/*工具函数文件*/
var sign = require('./api/sign/sign.js');/*签到*/
var list = require('./api/list/list.js');/*待办事项清单*/

var app = express();
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

//登录接口
app.get('/api/login', function (req, res) {
	var code = req.query.code;
  	common.login(code,res);
});

// 接受以api/开头的请求的中间件，判断每个请求api的token的合法性
app.use('/api/',function (req, res, next) {
	var token = req.body.token;
	common.checkToken(token,function(rs){
	  	if (rs.code == '2') {/*无效token*/
	  		util.result('102','invalid token',null,res);
	  	}else if (rs.code == '3') {/*过期的token*/
	  		util.result('103','token已过期',null,res);
	  	}else if (rs.code == '4') {/*读取数据出错*/
	  		util.result('104','读取数据出错',null,res);
	  	}else{
	  		next();
	  	}
  	});
});

//用户今日是否已经签到
app.post('/api/sign/isSignedToday',function(req,res){
	var token = req.body.token; 
	sign.isSignedToday(token,res);
})

//签到接口
app.post('/api/sign/sign',function(req,res){
	var token = req.body.token;
	sign.sign(token,res);
});

//获取统计数据
app.post('/api/sign/getSignData',function(req,res){
	var token = req.body.token;
	sign.getSignData(token,res);
});

//获取签到记录接口
app.post('/api/sign/getSignRecord',function(req,res){
	var token = req.body.token;
	var month = req.body.month;
	sign.getSignRecord(token,month,res);
});

//添加一条待办事项
app.post('/api/list/addList',function(req,res){
	var token = req.body.token;
	var content = req.body.content;
	list.addList(token,content,res);
})

//获取今日待办事项列表
app.post('/api/list/getList',function(req,res){
	var token = req.body.token;
	list.getList(token,res);
})

//完成一条待办事项
app.post('/api/list/doneList',function(req,res){
	var token = req.body.token;
	var id = req.body.id;
	list.doneList(token,id,res);
})

//删除一条待办事项
app.post('/api/list/deleteOneList',function(req,res){
	var token = req.body.token;
	var id = req.body.id;
	list.deleteOneList(token,id,res);
})

//获取待办事项总体统计数据(已完成和未完成)
app.post('/api/list/getListTotal',function(req,res){
	var token = req.body.token;
	list.getListTotal(token,res);
})

var server = app.listen(80, function () {
  	var host = server.address().address;
  	var port = server.address().port;
  	console.log('Example app listening at http://%s:%s', host, port);
});