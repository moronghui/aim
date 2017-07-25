var request = require('request');/*http请求*/
var config = require('../config/config.js');/*配置文件*/
var db = require('../model/db.js');/*封装操作数据库文件*/
var util = require('../util/util.js');/*工具函数文件*/

/**
 * 根据code请求微信接口取得openid 和 session_key,并生成token
 * @param  string code 微信登录凭证
 * @return string token 请求接口凭证
 */
function login(code,res){
	/**
	 * 请求微信接口
	 * https://api.weixin.qq.com/sns/jscode2session?appid=APPID&secret=SECRET
	 * 		&js_code=JSCODE&grant_type=authorization_code
	 */
	var appSecret = config.AppSecret;
	var appid = config.AppID;
	var openid = '';
	var session_key='';
	var token = '';
	var expires = 0;//openid有效时间
	var valid = 0;//该token有效时间
	var url = 'https://api.weixin.qq.com/sns/jscode2session?appid='+appid
	+'&secret='+appSecret+'&js_code='+code+'&grant_type=authorization_code';
	request(url,function (error, response, body) {
	  	if (!error && response.statusCode == 200) {
	  		body = JSON.parse(body);//要先转为json对象，才能用点访问属性
	  		if (body.openid == null) {
	  			var code = '203';
	  			var msg = "code无效";
	  			var data = null;
	  			util.result(code,msg,data,res);
	  		}else{
		    	//console.log(body) // Show the HTML for the baidu homepage.
		    	openid = body.openid;
		    	session_key = body.openid;
		    	token = util.generateToken(openid,session_key);
		    	expires_in = parseInt(body.expires_in*1000) + parseInt(util.getTime());
		    	valid = expires_in;
		    	db.insertOne('token',{
		    		'token':token,
		    		'openid':openid,
		    		'session_key':session_key,
		    		'expires_in':expires_in,
		    		'valid':valid
		    	},function(err,result){	
		    		var code = 200;
		    		var msg = '';
		    		var data =null;	
		    		if (err) {
		    			code = '202';
		    			msg = '插入数据库失败';
		    		}else{
		    			msg = 'ok';
		    			data = {
		    				'token':token
		    			}
		    		}
		    		util.result(code,msg,data,res);
		    	});
	  		}
	  	}else{
	  		var code = '201';
	  		var msg = '请求微信接口失败';
	  		var data = null;
	  		util.result(code,msg,data,res);
	  	}

	  	//var rs = util.result(code,msg,data);/*错误的，操作数据库是异步的*/
	  	//res.send(JSON.stringify(rs));
	})
}

/**
 * 检测token是否有效、是否过期
 * {code:1,data:{}}
 * code:1 有效的
 * code:2 无效的
 * code:3 已过期的
 * code:4 读取数据出错
 * @return object 该token有关的信息
 */
function checkToken(token,callback){
	db.find('token',{
		'token':token
	},function(err,result){
		var rs = {};
		rs.data = null;
		if (err) {
			rs.code = '4';
		}else{
			if (result.length == 0) {
				rs.code = '2';
			}else{
				var obj = result[0];
				if (util.getTime() < obj.valid) {
					rs.code = '1';
					rs.data = obj;
				}else{
					rs.code = '3'
					db.deleteOne('token',{'token':token},function(err,result){});
				}
			}
		}
		callback(rs);
	},sort=null);
}

/**
 * 根据token获取用户openid
 * @param  {[type]}   token    [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
function getOpenid(token,callback){
	db.find('token',{
		'token':token
	},function(err,result){
		if (err) {
			callback('');
			return;
		}
		var openid = result[0].openid;
		callback(openid);
	},sort=null);
}


exports.login=login;
exports.checkToken = checkToken;
exports.getOpenid = getOpenid;