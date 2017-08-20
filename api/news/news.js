var db = require('../model/db.js');/*封装操作数据库文件*/
var util = require('../util/util.js');/*工具函数文件*/
var common = require('../common/index.js');/*工具函数文件*/

exports.getNewsTitle = getNewsTitle;
exports.getNewsDetail = getNewsDetail;

/**
 * 获取新闻列表概要
 * @return {[type]} [description]
 */
function getNewsTitle(size,res){

	db.find('title',{},function(err,result){
		if (err) {
			util.result('104','读取数据出错',null,res);
			return;
		}
		var lists = [];
		for (let i = 0; i < result.length; i++) {
			lists.push({
				"date":result[i].date,
				"id":result[i].id,
				"title":result[i].title,
				"href":result[i].href
			});
		}
		util.result('200','获取数据成功',{lists},res);
	},{date:-1},size)
}

/**
 * 获取新闻详情
 * @return {[type]} [description]
 */
function getNewsDetail(id,res){
	db.find('detail',{
		"id":id
	},function(err,result){
		if (err) {
			util.result('104','读取数据出错',null,res);
			return;
		}
		var detail = {};
		if (result.length > 0) {
			detail.title=result[0].title;
			detail.source=result[0].source;
			detail.id=result[0].id;
			detail.content=result[0].content;
		}
		util.result('200','获取数据成功',{detail},res);
	},{date:-1})
}