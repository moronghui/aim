var express = require('express');
var common = require('./api/common');
var db = require('./api/model/db.js');/*封装操作数据库文件*/
var app = express();

//insertOne接口
app.get('/api/insertOne', function (req, res) {
  
  db.insertOne('token',{"token":'123454656','name':'aaaa'},function(err,result){
  	if (err) {
  		console.log(err);
  		return;
      res.send('插入失败');
  	}
  	if (result.result.ok) {
      res.send('插入成功');
    }else{
      res.send('插入失败');
    }
  });
  
});

//findAll接口
app.get('/api/find',function(req,res){
  db.find('token',{},function(err,result){
    if (err) {
      console.log(err);
      return;
      res.send('查询失败');
    }
    res.send(JSON.stringify(result));
  },{'token':-1});
});

//updateOne接口
app.get('/api/updateOne',function(req,res){
  db.updateOne('token',{'token':'123'},{'name':'aim'},function(err,result){
    if (err) {
      console.log(err);
      return;
      res.send('更新失败');
    }
    if (result.result.ok) {
      res.send('更新成功');
    }else{
      res.send('更新失败');
    }
  });
})

//deleteOne接口
app.get('/api/deleteOne',function(req,res){
  db.deleteOne('token',{'token':'270d4936dfef085aaeeb8ee1a3f1e153'},function(err,result){
    if (err) {
      console.log(err);
      return;
      res.send('删除失败');
    }
    if (result.result.ok) {
      res.send('删除成功');
    }else{
      res.send('删除失败');
    }
  })
})

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});