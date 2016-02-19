var express = require('express');
var app = express();
var mongoClient = require('mongodb').MongoClient;

var MONGODB_URI = "mongodb://admin:123456@ds011278.mongolab.com:11278/heroku_hs6w48x7";

// This responds with "Hello World" on the homepage
app.get('/', function (req, res) {
   console.log("Got a GET request for the homepage");
   res.send('Hello GET');
})


// This responds a GET request for the /list_user page.
app.get('/database', function (req, res) {
	mongoClient.connect(MONGODB_URI, function(err, db){
		if(err){
			console.log('Unable to connect to the mongoDB server. Error:', err);
		} else{
			//HURRAY!! We are connected. :)
			console.log('Connection established to', MONGODB_URI);

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
   res.send('Database Listing');
})


var server = app.listen(8081, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)

})