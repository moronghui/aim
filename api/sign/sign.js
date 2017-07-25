var db = require('../model/db.js');/*封装操作数据库文件*/
var util = require('../util/util.js');/*工具函数文件*/
var common = require('../common/index.js');/*工具函数文件*/

exports.isSignedToday=isSignedToday
exports.sign=sign
exports.getSignData=getSignData
exports.getSignRecord=getSignRecord




/**
 * 根据月份获取签到记录 //2017-04
 * @param  {[type]} month [description]
 * @return {[type]}       [description]
 */
function getSignRecord(token,month,res){
	common.getOpenid(token,function(openid){
		if (openid == '') {
			util.result('104','读取数据出错',null,res);
			return;
		}
		//根据openid读出所有记录
		db.find('sign_record',{
			'openid':openid
		},function(err,result){
			if (err) {
				util.result('104','读取数据出错',null,res);
				return;
			}
			var arr = util.getMonthRecord(month,result);
			var data ={
				data:arr
			}
			util.result('200','获取成功',data,res);

		},sort=null)
	});
}


/**
 * 判断该用户今天是否已经签到
 * @param  {[type]}  token [description]
 * @return {Boolean}       [description]
 */
function isSignedToday(token,res){
	common.getOpenid(token,function(openid){
		if (openid == '') {
			util.result('104','读取数据出错',null,res);
			return;
		}
		var date = util.getDate();//2017-07-24
		db.find('sign_record',{
			'date':date,
			'openid':openid
		},function(err,result){
			if (err) {
				util.result('104','读取数据出错',null,res);
				return;
			}
			var flag = '0';
			if (result.length != 0) {
				flag = '1';
			}
			var data = {
				flag:flag
			}
			util.result('200','ok',data,res)
		},sort=null)
	});
}

/**
 * 用户签到
 * @param  {[type]} token [description]
 * @param  {[type]} res   [description]
 * @return {[type]}       [description]
 */
function sign(token,res){
	
	//更新签到记录统计表
	common.getOpenid(token,function(openid){
		if (openid == '') {
			util.result('104','读取数据出错',null,res);
			return;
		}
		//判断是否已经签到过了
		var date = util.getDate();//2017-07-24
		db.find('sign_record',{
			'openid':openid,
			'date':date
		},function(err,result){
			if (err) {
				util.result('202','插入数据库失败',null,res);
				return;
			}
			if (result.length == 1) {/**已签到*/
				util.result('105','已经签到过了',null,res);
			}else{
				var json = {
					'openid':openid,
					'date':date
				};
				//添加签到记录
				db.insertOne('sign_record',json,function(err,result){
					if (err) {
				  		util.result('202','插入数据库失败',null,res);
						return;
				  	}
				  	if (result.result.ok) {
				  		//添加记录成功，同步更加统计数据
				  		updateSign(openid,function(err,result){
				  			if (err) {/*同步失败，要删除插入的数据*/
				  				db.deleteOne('sign_record',{'openid':openid},function(err,result){});
				  				util.result('202','插入数据库失败',null,res);
				  				return ;
				  			}
				  			//获取统计数据返回
				  			signData(openid,function(err,obj){
				  				var data =null
				  				//console.log(err+':error');
				  				//console.log(obj);
				  				if (!err) {
				  					data = obj;
				  				}
								util.result('200','签到成功',data,res);
				  			})
				  		})
				    }else{
				      	util.result('202','插入数据库失败',null,res);
						return;
				    }
				})
			}
		})
	});
}

/**
 * 更新签到记录统计表
 * @param  {[type]}   openid   [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
function updateSign(openid,callback){
	db.find('sign_statis',{
		'openid':openid
	},function(err,result){
		if (err) {
			callback('error',null);
			return;
		}
		if (result.length == 0) {/*新用户*/
			db.insertOne('sign_statis',{
				'openid':openid,
				'total':1,
				'cont':1,
				'big_cont':1,
				'last':util.getDate()
			},function(err,result){
				if (err) {
					callback('error',null);
					return;
				}
				callback(null,'ok');
				return;
			})
		}else{
			var obj = result[0];
			var total = parseInt(obj.total)+1;
			var nextday = util.getNextday(obj.last);
			var date = util.getDate();
			console.log('nextday:'+nextday);
			console.log('date:'+date);
			var cont = parseInt(obj.cont);
			var big_cont = parseInt(obj.cont);
			if (date == nextday) {/*连续签到*/
				cont++;
				if (cont > big_cont) {
					big_cont = cont;
				}
			}else{
				cont = 1;
			}

			db.updateOne('sign_statis',{
				'openid':openid
			},{
				'total':total,
				'cont':cont,
				'big_cont':big_cont,
				'last':date
			},function(err,result){
				if (err) {
					callback('error',null);
					return;
				}
				if (result.result.ok) {
					callback(null,'ok');
				}else{
					callback('error',null);
					return;
				}
			});
		}

	},sort=null)
}

/**
 * 获取签到记录统计信息
 * @param  {[type]} openid [description]
 * @return {[type]}        [description]
 */
function signData(openid,callback){
	db.find('sign_statis',{
		'openid':openid
	},function(err,result){
		if (err) {
			callback('error',null);
			return;
		}
		var obj = {};
		if (result.length == 0) {
			obj.total=0;
			obj.cont=0;
			obj.big_cont=0;
			obj.last=null;
		}else{
			var obj = result[0];
		}
		callback(null,obj);
	},sort=null)
}

/**
 * 获取签到统计信息接口
 * @param  {[type]} token [description]
 * @param  {[type]} res   [description]
 * @return {[type]}       [description]
 */
function getSignData(token,res){
	common.getOpenid(token,function(openid){
		signData(openid,function(err,obj){
			if (err) {
				util.result('104','读取数据失败',null,res);
				return;
			}
			util.result('200','获取成功',obj,res);
		})
	})
}

