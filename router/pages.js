/*	router/pages.js	*/
/*
 *------
 * Data
 *------
 */
const express = require('express');
const router = express.Router();

/*
 *------
 * GET
 *------
 */
router.get('/', (req, res) => {
	/*
	resp.send(`
		<h1>A VOUS...</h1>
		`);
	*/
	res.render('index');

});

router.get('/login', (req, res) => {
	res.render('login', {message: ''});
})

router.get('/register', (req, res) => {
	res.render('register', {message: ''});
	
})
router.get('/profile', (req, res) => {
	res.render('profile', {message: ''});
	
})


module.exports = router;