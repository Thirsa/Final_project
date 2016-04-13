var express = require('express');
var Promise = require('promise')
// import express from 'express'
var fs = require('fs');
var bodyParser = require('body-parser');
// var session = require('express-session')
var Sequelize = require('sequelize');
// var bcrypt = require('bcrypt');
var sass = require('node-sass');
var sassMiddleware = require('node-sass-middleware');
var path = require('path');


var sequelize = new Sequelize('contacts', 'thirsa', null, {
	host: 'localhost',
	dialect: 'postgres',
});

var Contacts = sequelize.define('contact', {
	firstName:{
       type: Sequelize.STRING,
    },
	secondName: {
		type: Sequelize.STRING,
	},     
	preFix:{
		type: Sequelize.STRING
	},
	lastName:{
		type: Sequelize.STRING,
	},
	sex:{
		type:Sequelize.STRING
	}
});

var Birthdays = sequelize.define('birthday', {
	day:{
		type: Sequelize.INTEGER
	},
	month: {
		type: Sequelize.STRING
	},
	year:{
		type: Sequelize.INTEGER
	}
});

var Numbers = sequelize.define('number', {
	number: {
		type: Sequelize.STRING
	},
	deviceType: {
		type: Sequelize.STRING
	}
});

var Addresses = sequelize.define('address', {
	country: {
		type: Sequelize.TEXT
	},
	city:{
		type: Sequelize.STRING
	},
	street:{
		type: Sequelize.STRING
	},
	number:{
		type: Sequelize.INTEGER
	},
	postalCode:{
		type: Sequelize.STRING
	}
});

var Emails = sequelize.define('email', {
	email: {
		type: Sequelize.TEXT
	}
});

var Websites = sequelize.define('website', {
	website: {
		type: Sequelize.STRING
	}
});

Contacts.hasMany(Birthdays);
Birthdays.belongsTo(Contacts);

Contacts.hasMany(Numbers);
Numbers.belongsTo(Contacts);

Contacts.hasMany(Addresses);
Addresses.belongsTo(Contacts);

Contacts.hasMany(Emails);
Emails.belongsTo(Contacts);

Contacts.hasMany(Websites);
Websites.belongsTo(Contacts);

var app = express();


app.use(
	sassMiddleware({
		src: __dirname + '/sass',
		dest: __dirname + '/public',
		debug: true,
	})
);

app.use(express.static(path.join(__dirname, 'public')));


// app.use(express.static('./public'));
app.use(bodyParser.urlencoded({ extended: true }))

app.set('views', './views');
app.set('view engine', 'jade');

// app.use(sassMiddleware({
//     src: __dirname + '/sass', 
//     dest: __dirname + '/public',
//     debug: true,       
// 	}),
// express.static(path.join(__dirname, 'public')));



//Show index page
app.get('/',function (request, response) {
	Contacts.findAll({include:[Addresses]}).then(function (data){
		var allContacts = data.map(function (dat){
			return {
				id: dat.dataValues.id,
				firstName: dat.dataValues.firstName,
				preFix: dat.dataValues.preFix,
				lastName: dat.dataValues.lastName
				// street: dat.dataValues.addresses.street,
				// housenumber: dat.dataValues.addresses.number,
				// postalCode: dat.dataValues.addresses.postalCode,
				// country: dat.dataValues.addresses.country,
				// city: dat.dataValues.addresses.city
			}
		})
		console.log("ALLL MY FUKING CONTACTS"+ allContacts)
		response.render ('index', {allContacts:allContacts.sort()})
	}, function (error){
		if (error){
			console.log ("something went wrong.. please refresh")
		}
	})
});

app.get('/contact/:id', function (request, response){
	var bla = request.params
	console.log (bla)
	console.log ("bla")

	Contacts.findOne({include: [Addresses, Websites, Emails, Birthdays, Numbers], where: {id:1}}).then(function (data){
		// console.log ("my data" + JSON.stringify(data));
		// Addresses.findAll().then(function (data2){
		var details = 
		// data.map(function (dat) {
			// return 
			{
			firstName: data.dataValues.firstName,
			street: data.dataValues.addresses.street,
			website: data.dataValues.websites.website
			}
		// })
		// console.log ("details" + JSON.stringify(details))

		// })
	response.send({data: JSON.strigify(data), details:details})

	}, function (error){if (error){throw error}})

})

//create a contact
app.post('/contact', function (request, response){

function createNumbers (post){
	// for (i=0;i<x.length;i++){
		Numbers.create({
		deviceType:request.body.type,
		number: request.body.phoneNumber,
		contactId: post.id
		})
	// }
}

Contacts.create({
		firstName: request.body.firstName,
		secondName: request.body.secondName,
		preFix: request.body.preFix,
		lastName: request.body.lastName,
		sex: request.body.sex
	}).then(function(post) {
		Promise.all([
			Birthdays.create({
			day: request.body.day,
			month: request.body.month,
			year: request.body.year,
			contactId: post.id
			}),
			Addresses.create({
			country: request.body.country,
			city: request.body.city,
			street:request.body.street,
			number:request.body.number,
			postalCode: request.body.postalCode,
			contactId: post.id
			}),
			createNumbers(post),
			Emails.create({
			email: request.body.email,
			contactId: post.id
			}),
			Websites.create({
			website: request.body.website,
			contactId: post.id
			})
		])
		console.log(post)
		console.log ("Your tables have been created")
		response.redirect ('/') //does this line wait for the promise.all??
		},function (error){
		// if (error === SequelizeDatabaseError){
			
		response.render ('/?message=' + encodeURIComponent ("wrong input for numbers..."))		


		// }			
			// console.log ("Oops.. something went wrong while creating your tables")
			// if (error){
			// throw error;
			// }
	}, function (error){
		if (error === SequelizeDatabaseError){

		response.render ('/?message=' + encodeURIComponent ("wrong input for numbers..."))		


		}
		// if (error){
		// 	throw error}
		})
})

app.post('/contact/delete', function (response, request){
	var data = request.params
	console.log(data)
	Contacts.destroy({include:[Addresses,Emails,Websites,Numbers,Birthdays], where:{id:50}}).then(function (succes){
		console.log (succes)
		response.render('/')
	}, function(error){
		console.log (error);
	})

})

sequelize.sync().then(function (){
	Contacts.create({
		firstName: 'Thirsa',
		secondName: 'Jacqueline',
		preFix: 'de',
		lastName: 'Boer',
		sex: 'female'
	}).then(function(post) {
		Promise.all([
			Birthdays.create({
			day: 29,
			month: 'June',
			year: '1990',
			contactId: post.id
			}),
			Addresses.create({
			country: 'Netherlands',
			city:'Zaandam',
			street:'Perim',
			number:318,
			postalCode: '1503GE',
			contactId: post.id
			}),
			Numbers.create({
			deviceType:'Mobile',
			number:'0611515316',
			contactId: post.id
			}),
			Emails.create({
			email: 'thirsadeboer@gmail.com',
			contactId: post.id
			}),
			Websites.create({
			website: 'thirsadeboer.com',
			contactId: post.id
			})
		])
		console.log(post)
		console.log ("Your tables have been created")
		var server = app.listen(3000, function () {
		console.log(server.address().port);
		},function (error){
			console.log ("Oops.. something went wrong while creating your tables")
			if (error){
			throw error;
			}
		})
	}, function (error){
		if (error){
			throw error}
		})
});


