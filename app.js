/*	app.js	*/
/*
 *------
 * Data
 *------
 */
require('colors');
const express = require('express');
const path = require('path');

const dotenv = require('dotenv');
dotenv.config({
	path: './.env'
});

const cookieParser = require('cookie-parser');

console.log(`.: ----------------------------------------------------------------------------------:.`.bgGreen.white);
console.log(`.: Server start at ${ new Date() } :.`.bgGreen.white);
console.log(`.: ----------------------------------------------------------------------------------:.`.bgGreen.white);

const port = process.env.PORT || 8008;
const app = express();

/*
 * Setting...
 */
const public = path.join(__dirname, 'public');
app.use( express.static(public) );
// parse URL encoded body (from html form)
app.use( express.urlencoded( {extended: false} ) );
// parse JSON bodie (from the API clients)
app.use( express.json() );
// application.Cookies
app.use( cookieParser() );

app.set( 'view engine', 'hbs' );

/*
 *-----------------------------------
 * 		GESTION DES ROUTES
 *-----------------------------------
 */
app.use( '/', require('./router/pages') );
app.use( '/auth', require('./router/auth') );

/**
 * Listen on provided port, on all network interfaces.
 */
app.listen(port, () => {
	console.log(`\n`);
	console.log(`.: ----------------------------------------------:.`.bgWhite.black);
    console.log(`.: Authentication server is running on port ${port} :.`.bgWhite.black);
    console.log(`.: ----------------------------------------------:.`.bgWhite.black);
	console.log(`\n`);
});
