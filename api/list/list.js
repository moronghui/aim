var db = require('../model/db.js');/*封装操作数据库文件*/
var util = require('../util/util.js');/*工具函数文件*/
var common = require('../common/index.js');/*工具函数文件*/

exports.addList = addList;
exports.getList = getList;
exports.doneList = doneList;
exports.deleteOneList = deleteOneList;
exports.getListTotal=getListTotal
exports.getListRecord=getListRecord

/**
 * 获取待办事项最近七天的统计数据
 * data{
 *    categories: ['7-17','7-18', '7-19', '7-20', '7-21', '昨天', '今天'],
 *    done: [10,15,12,8,11,10,13],
 *    undo: [10,15,12,8,11,10,13]
 * }
 */
function getListRecord(token,res){
	common.getOpenid(token,function(openid){
		if (openid == '') {
			util.result('104','读取数据出错',null,res);
			return;
		}
		var date = util.getDate();//2017-07-24
		db.find('list',{
			'openid':openid
		},function(err,result){
			if (err) {
				util.result('104','读取数据出错',null,res);
				return;
			}
			var categories = [];
			var done = [];
			var undo = [];

			if (result.length <= 7) {//只有小于七天数据，全部读出来
				for (let i = 0; i < result.length; i++) {
					categories.push(result[i].date.slice(5));
					let arr = getDayStatis(result,result[i].list);
					done.push(arr[0]);
					undo.push(arr[1]);
				}
			}else{
				if (result[result.length-1].date != date) {//今天还没有数据
					result = result.slice(-6);
				}else{
					result = result.slice(-7);
				}
				for (let i = 0; i < result.length; i++) {
					categories.push(result[i].date.slice(5));
					let arr = getDayStatis(result,result[i].list);
					done.push(arr[0]);
					undo.push(arr[1]);
				}
				if (result.length == 6) {
					categories.push(date.slice(5));
					done.push(0);
					undo.push(0);
				}
			}
			util.result('200','获取数据成功',{categories,done,undo},res);
		},{date:1})
	})

}

/**
 * 根据日期统计当天清单完成情况
 * @return {[type]} [description]
 */
function getDayStatis(result,list){
	var undoTotal = 0;
	var doneTotal = 0;
	for (var j = 0; j < list.length; j++) {
		if(list[j].done == '1') {
			doneTotal++;
		}
		if(list[j].done == '0') {
			undoTotal++;
		}
	}
	return [doneTotal,undoTotal];
}

/**
 * 获取待办事项总体统计数据(已完成和未完成)
 * @return {[type]} [description]
 */
function getListTotal(token,res){
	common.getOpenid(token,function(openid){
		if (openid == '') {
			util.result('104','读取数据出错',null,res);
			return;
		}
		db.find('list',{
			'openid':openid
		},function(err,result){
			if (err) {
				util.result('104','读取数据出错',null,res);
				return;
			}
			var undoTotal = 0;
			var doneTotal = 0;
			for (var i = 0; i < result.length; i++) {
				var list = result[i].list;
				for (var j = 0; j < list.length; j++) {
					if(list[j].done == '1') {
						doneTotal++;
					}
					if(list[j].done == '0') {
						undoTotal++;
					}
				}
			}
			var data={
				'undoTotal':undoTotal,
				'doneTotal':doneTotal
			}
			util.result('200','读取数据成功',data,res);
		},sort=null)
	})
}


/**
 * 删除一条待办事项
 * @param  {[type]} token [description]
 * @param  {[type]} id    [description]
 * @param  {[type]} res   [description]
 * @return {[type]}       [description]
 */
function deleteOneList(token,id,res){
	common.getOpenid(token,function(openid){
		if (openid == '') {
			util.result('104','读取数据出错',null,res);
			return;
		}
		var date = util.getDate();//2017-07-24

		db.find('list',{
			'openid':openid,
			'date':date
		},function(err,result){
			if (err) {
				util.result('104','读取数据出错',null,res);
				return;
			}
			if (result.length == 0) {
				util.result('205','待办事项为空',null,res);
			}else{
				var list = result[0].list;
				if (list.length == 0) {
					util.result('205','待办事项为空',null,res);
					return ; 
				}
				for (var i = 0; i < list.length; i++) {
					if (list[i].id == id) {
						list.splice(i,1);
						break;
					}
				}
				db.updateOne('list',{
					'openid':openid,
					'date':date
				},{
					'list':list
				},function(err,result){
					if (err) {
						util.result('206','更新数据失败',null,res);
						return ; 
					}
					util.result('200','删除成功',null,res);
				})

			}
		},sort=null)
	})
}

/**
 * 完成一条待办事项
 * @param  {[type]} token [description]
 * @param  {[type]} id    [description]
 * @param  {[type]} res   [description]
 * @return {[type]}       [description]
 */
function doneList(token,id,res){
	common.getOpenid(token,function(openid){
		if (openid == '') {
			util.result('104','读取数据出错',null,res);
			return;
		}
		var date = util.getDate();//2017-07-24

		db.find('list',{
			'openid':openid,
			'date':date
		},function(err,result){
			if (err) {
				util.result('104','读取数据出错',null,res);
				return;
			}
			if (result.length == 0) {
				util.result('205','待办事项为空',null,res);
			}else{
				var list = result[0].list;
				if (list.length == 0) {
					util.result('205','待办事项为空',null,res);
					return ; 
				}
				for (var i = 0; i < list.length; i++) {
					if (list[i].id == id) {
						list[i].done = '1';
						break;
					}
				}
				db.updateOne('list',{
					'openid':openid,
					'date':date
				},{
					'list':list
				},function(err,result){
					if (err) {
						util.result('206','更新数据失败',null,res);
						return ; 
					}
					util.result('200','更新成功',null,res);
				})

			}
		},sort=null)
	})
}

/**
 * 添加一条待办事项
 */
function addList(token,content,res){
	common.getOpenid(token,function(openid){
		if (openid == '') {
			util.result('104','读取数据出错',null,res);
			return;
		}
		var date = util.getDate();//2017-07-24
		db.find('list',{
			'openid':openid,
			'date':date
		},function(err,result){
			if (err) {
				util.result('104','读取数据出错',null,res);
				return;
			}
			if (result.length == 0) {/*该用户今日还没添加待办事项*/
				db.insertOne('list',{
					'openid':openid,
					'date':date,
					'count':2,
					'list':[{'id':1,'content':content,'done':'0'}]
				},function(err,result){
					if (err) {
						util.result('104','读取数据出错',null,res);
						return;
					}
					util.result('200','添加成功',null,res);
				})
			}else{/*在list中添加一项*/
				var obj = result[0];
				var list = obj.list;
				var count = parseInt(obj.count);
				list.push({'id':count,'content':content,'done':'0'});
				count++;
				db.updateOne('list',{
					'openid':openid,
					'date':date
				},{
					'list':list,
					'count':count
				},function(err,result){
					if (err) {
						util.result('202','插入数据库失败',null,res);
						return;
					}
					util.result('200','添加成功',null,res);
				})
			}
		},sort=null)
	})
}

/**
 * 获取今日待办事项列表
 * @return {[type]} [description]
 */
function getList(token,res){
	common.getOpenid(token,function(openid){
		if (openid == '') {
			util.result('104','读取数据出错',null,res);
			return;
		}
		var date = util.getDate();//2017-07-24
		db.find('list',{
			'openid':openid,
			'date':date
		},function(err,result){
			if (err) {
				util.result('104','读取数据出错',null,res);
				return;
			}
			let data = []
			if (result.length != 0) {
				data = result[0].list
			}
			util.result('200','获取数据成功',data,res);
		},sort=null)
	})
}