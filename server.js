
var express = require('express');
var app = express();
//var http = require('http');
//var sys = require('util'),
URL = require('url'),
qs = require('querystring')

var mongoClient = require('mongodb').MongoClient;

var MONGODB_URI = "mongodb://admin:123456@ds011278.mongolab.com:11278/heroku_hs6w48x7";

// This responds with "Hello World" on the homepage
app.get('/', function (req, res) {
	console.log("Got a GET request for the homepage");
	res.send('Hello GET');
})

app.get('/login', function(request, response){
	
	var url_params = URL.parse(request.url, true);
	var user_name = url_params.query.name;
	var user_password = url_params.query.password;
	console.log("User name = " + user_name + ", password is " + user_password);
	response.end("yes");
	
})

app.get('/signup', function(request, response){
	
	var url_params = URL.parse(request.url, true);
	var user_name = url_params.query.name;
	var user_password = url_params.query.password;
	console.log("User name = " + user_name + ", password is " + user_password);
	response.end("yes");
	
	mongoClient.connect(MONGODB_URI, function(err, db) {
		if (err) throw err;
		console.log("Connected to Database");
		insertUser(db, function(){db.close();}, user_name, user_password);
	});
	
})

var insertUser = function(db, callback, userName, userPass){
	db.collection('users').insertOne({
		"id" : userName,
		"pass" : userPass
	}), function(err, result){
		if(err){
			console.log("error insert:" + err);
		} else{
			console.log("Inserted a document into the restaurants collection.");
			callback();
		}
	}
}

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
  Math.sin(dLat/2) * Math.sin(dLat/2) +
  Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
  Math.sin(dLon/2) * Math.sin(dLon/2)
  ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
	return deg * (Math.PI/180)
}

app.get('/loc' , function(request , response){

	var url_params = URL.parse(request.url , true);
	var x = url_params.query.x;
	var y = url_params.query.y;
	var store_id = -1;

	mongoClient.connect(MONGODB_URI, function(err, db) {
		if (err) throw err;
		console.log("Connected to Database");	
		var cursor = db.collection('stores').find();
		cursor.each(function(err, doc) {
			if(err){
				console.log("error: " + err);
			} else{
				if (doc != null) {
					if(getDistanceFromLatLonInKm(doc.loc.x , doc.loc.y , x , y) <= 10){
						store_id = doc._id ;					
						return;
					}
				} else {
					console.log("no doc ");
				}
			}

		});


	console.log(store_id);

	response.contentType('application/json');
	});

	//response.send(JSON.stringify(getProductList(store_id)));

})

function getProductList(store_id){
	var result = [];
	mongoClient.connect(MONGODB_URI, function(err, db) {						
		if (err) throw err;
		console.log("Connected to Database");
		console.log(store_id);
		var cursor =db.collection('stocks').find( { "store_id": store_id } );
		cursor.each(function(err, doc){
			if(doc != null){
				if(doc.store_id == store_id || doc.stocks > 0)
					result.push(findProduct(doc.product_id));
			}
		});
	});
	console.log(result);
	return result ;

}

function findProduct( id ){
	mongoClient.connect(MONGODB_URI, function(err, db) {						
		if (err) throw err;
		console.log("Connected to Database");
		var cursor =db.collection('products').find( { "_id": id } );
		cursor.each(function(err, doc){
			if(doc != null){
				return "{ name : " + doc._id +"  price: " + doc.price +" imgUrl: " + doc.imgUrl +
				"weight: " + doc.weight+ "}"
			}
		});
	});
}

// This responds a GET request for the /list_user page.
app.get('/database', function (request, response) {
	
	mongoClient.connect(MONGODB_URI, function(err, db){
		
		if(err){
			console.log('Unable to connect to the mongoDB server. Error:', err);
		} else{
			//HURRAY!! We are connected. :)
console.log('Connection established to', MONGODB_URI);

var url_parts;
if(request.method == 'GET'){
	url_parts = URL.parse(request.url, true);
	response.writeHead( 200 );
	response.write( JSON.stringify( url_parts.query ) );
	response.end();


} else if (request.method == 'POST') {
	var body = '';
	request.on('data', function (data) {
		body += data;
	});
	request.on('end',function() {
		var POST =  qs.parse(body);
                    //console.log(POST);
                    response.writeHead( 200 );
                    response.write( JSON.stringify( POST ) );
                    response.end();
                });
}

			// do some work here with the database.			
								// Get the documents collection
								var cursor = db.collection('users').find( );
								cursor.each(function(err, doc) {
									if(err){
										console.log("error: " + err);
									} else{
										if (doc != null) {
											console.dir(doc);
										} else {
											console.log("no doc");
										}
									}
								});


							}
						});
})


var server = app.listen(8081, function () {

	var host = server.address().address
	var port = server.address().port

	console.log("Example app listening at http://%s:%s", host, port)

})
