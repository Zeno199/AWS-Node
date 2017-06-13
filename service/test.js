var mysql     = require('mysql');
var AWS 	  = require('aws-sdk');
var	config = require ('db_configure');
var	request   = require('request');


// Connections can be pooled to ease sharing a single connection, or managing multiple connections.
function getPooledConnection(callback) {
	pool.getConnection(callback);
}

//Executes query with parameters
function queryWithParameters(queryString, parameters, callback) {
	getPooledConnection(function(err, connection) {

		if (err) {
            return callback(err);
        }

		console.log('Runninq Query: ', queryString);
		console.log('parameters: ', parameters);

		// Use the connection
		var query = connection.query(queryString, parameters, function(err, result){

			//And done with the connection.. Put connection back in pool
			connection.release();

			callback(err, result);
		});
	});
}

//Executes the query
function query(queryString, callback) {
	getPooledConnection(function(err, connection) {

		if (err) {
            return callback(err);
        }

		// Use the connection
		var query = connection.query(queryString, null, function(err, result){

			//And done with the connection.. Put connection back in pool
			connection.release();

			callback(err, result);
		});
	});
}

//Custom query to request data or information from a database table or combination of tables.
exports.excuteCustomQuery = function(queryString, callback){
	query(queryString,callback);
}

//Insert new record in a table
exports.saveRecordRDS = function (dataToSave, table, callback){
	var queryString = 'INSERT INTO '+ table +' SET ?';
	queryWithParameters(queryString, dataToSave, callback);
}

//Uses the COUNT() function to determine if any record matches the specified condition.
exports.existRecord = function(condition, table, callback){
	console.log('here');

	var queryString = 'SELECT COUNT(*) FROM '+ table +' WHERE ?';
	queryWithParameters(queryString, condition, function(err, result) {
		// result is [ { 'COUNT(*)': 0 } ], we want to get the 0
		//http://stackoverflow.com/questions/20881213/converting-json-object-into-javascript-array
		var arr = Object.keys(result[0]).map(function(k) { return result[0][k] });
		result = arr == 0 ? false : true;
		console.log(result);
		callback(err, result);
	});
}

//Update existing records in a table. Condition is required to avoid possible unwanted queries.
exports.updateRecord = function (dataToSave, condition, table, callback){
	var queryString = 'UPDATE '+ table +' SET ' + dataToSave + ' WHERE ?';
	queryWithParameters(queryString, condition, callback);
}

//Combine rows from two tables, based on a common field between them. Note that the Query object is {column:c, table:t, condition:co}
exports.nestedQueries = function (outerQuery, innerQuery, callback){
	var queryString = 'SELECT ' + outerQuery.column + ' FROM '+ outerQuery.table + ' '+outerQuery.condition + ' (SELECT ' + innerQuery.column +' FROM ' + innerQuery.table + ' '+ innerQuery.condition + ')';
	queryWithParameters(queryString, null, callback);
}

//Delete all rows in a table that fulfill a specified condition without deleting the table.
exports.deleteRecord = function(condition, table, callback){

	var queryString = 'DELETE FROM ' + table + ' WHERE ?';
	queryWithParameters(queryString, condition, callback);
}

//Combine rows from three tables, based on a common field between them. Note that the Query object is {column:c, table:t, condition:co}
exports.tripleNestedQueries = function (nestedQuery0, nestedQuery1, nestedQuery2, callback){
	var queryString = 'SELECT ' + nestedQuery0.column + ' FROM '+ nestedQuery0.table + ' '+nestedQuery0.condition
					+ ' (SELECT ' + nestedQuery1.column +' FROM ' + nestedQuery1.table + ' '+ nestedQuery1.condition
					+ ' (SELECT ' + nestedQuery2.column +' FROM ' + nestedQuery2.table + ' '+ nestedQuery2.condition + '))';
	queryWithParameters(queryString, null, callback);
}

//Selects the given column's records that fulfill a specified criterion. The column is optional.
exports.getRecordRDS = function(table, condition, callback, column){
	column  = column === undefined ? '*' : column;
	var queryString = 'SELECT '+ column +' FROM '+ table +' WHERE ?';
	queryWithParameters(queryString, condition, callback);
}

//Selects the given column's records from a table. The column is optional.
exports.select = function(table, callback, column){
	column  = column === undefined ? '*' : column;
	var queryString = 'SELECT '+ column +' FROM '+ table;
	query(queryString, callback);
}
