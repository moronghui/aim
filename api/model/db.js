var MongoClient = require('mongodb').MongoClient;
var config = require('../config/config.js');/*配置文件*/


/**
 * 连接数据库
 * @param  {Function} callback 连接成功的回调函数
 * @return {[type]}            [description]
 */
function _connectDB(callback){
	var url = config.url;
	MongoClient.connect(url, function(err, db) {
		if (err) {
	  		callback(err,null);
	  		return ;
		}
		callback(err,db);
	});
}

/**
 * 插入一条数据
 * @param  {[type]}   collection [description]
 * @param  {[type]}   json       [description]
 * @param  {Function} callback   [description]
 * @return {[type]}              [description]
 */
exports.insertOne = function(collection,json,callback){
	_connectDB(function(err,db){
		if (err) {
			callback(err,null);
			return;
		}
		db.collection(collection).insertOne(json,function(err,result){
			callback(err,result);
			db.close();
		});
	});
}

/**
 * 查询数据json为{}表示查询全部数据
 * sort {'token':1}1表示升序，-1表示降序
 * @param  {[type]}   collection [description]
 * @param  {[type]}   json       [description]
 * @param  {Function} callback   [description]
 * @param  {[type]}   sort       [description]
 * @return {[type]}              [description]
 */
exports.find = function(collection,json,callback,sort=null){
	_connectDB(function(err,db){
		if (err) {
			callback(err,null);
			return;
		}
		var cursor = db.collection(collection).find(json).sort(sort);
		var result = [];
		cursor.each(function(err,doc){
			if (err) {
				callback(err,null);
				db.close();
				return;
			}
			if (doc != null) {
				result.push(doc);
			}else{
				callback(null,result);
				db.close();
			}
		})
	})
}

/**
 * 更新一条数据
 * @param  {[type]}   collection [description]
 * @param  {[type]}   where      [description]
 * @param  {[type]}   setobj     [description]
 * @param  {Function} callback   [description]
 * @return {[type]}              [description]
 */
exports.updateOne = function(collection,where,setobj,callback){
	_connectDB(function(err,db){
		if (err) {
			callback(err,null);
			return ; 
		}
		db.collection(collection).updateOne(where, {$set: setobj}, function(err, result) {
			callback(err,result);
			db.close();
		})
	})
}

/**
 * 删除一条记录
 * @param  {[type]}   collection [description]
 * @param  {[type]}   where      [description]
 * @param  {Function} callback   [description]
 * @return {[type]}              [description]
 */
exports.deleteOne=function(collection,where,callback){
	_connectDB(function(err,db){
		if (err) {
			callback(err,null);
			return ;
		}
		db.collection(collection).deleteOne(where,function(err,result){
			callback(err,result);
			db.close();
		})
	})
}
