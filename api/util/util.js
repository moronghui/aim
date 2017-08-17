var crypto = require('crypto');/*加密函数文件*/
var sd = require('silly-datetime');/*格式化日期*/
var nextday = require('nextday');

exports.generateToken = generateToken;
exports.getTime = getTime;
exports.md5 = md5;
exports.result = result;
exports.getDate = getDate;
exports.getNextday=getNextday
exports.getMonthRecord=getMonthRecord

/**
 * 选择该月的签到记录
 * @param  {[type]} month //2017-07
 * @param  {[type]} arr   [description]
 * @return {[type]}       [description]
 */
function getMonthRecord(month,arr){
	if(!(/-/.test(month))){
		return []; 
	}
	var rs = [];
	var y = month.split('-')[0];
	var m = month.split('-')[1]; 
	for (var i = 0; i < arr.length; i++) {
		var strArr = arr[i].date.split('-');
		var str_y = parseInt(strArr[0]);//2017
		var str_m = parseInt(strArr[1]);//07
		if (str_y == y && str_m == m) {
			rs.push(parseInt(strArr[2]));
		}
	}
	return rs;
}


/**
 * 获取该日下一日 2017-07-21
 * @param  {[type]} date [description]
 * @return {[type]}      [description]
 */
function getNextday(date){
	return sd.format(nextday(date),'YYYY-MM-DD');
}

/**
 * 定义接口返回值格式
 * {'code':200,'msg':'ok','data':{'token':'123'}}
 * @return {[type]} [description]
 */
function result(code,msg,data,res){
	var obj ={};
	obj.code = code;
	obj.msg = msg;
	obj.data = data;
	res.send(JSON.stringify(obj));
}

/**
 * 根据openid和session_key生成token
 * @param  {[type]} openid      [description]
 * @param  {[type]} session_key [description]
 * @return {[type]}             [description]
 */
function generateToken(openid,session_key){
	//md5加密
	return md5(openid+getTime());
}

/**
 * 获取当前时间戳
 * @return {[type]} [description]
 */
function getTime(){
	return Date.now();
}

/**
 * 获取当前日期 YYYY-MM-DD
 * @return {[type]} [description]
 */
function getDate(){
	return sd.format(new Date(), 'YYYY-MM-DD');
}

/**
 * md5加密
 * @param  {[type]} content [description]
 * @return {[type]}         [description]
 */
function md5(content){
	var md5 = crypto.createHash('md5');  
	md5.update(content);  
	return md5.digest('hex');
}
