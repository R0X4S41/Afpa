/*	router/auth.js	*/
/*
 *------
 * Data
 *------
 */
const express = require('express');
const authController = require('../controllers/authentication');

const router = express.Router();

/*
*--------
* POST
*--------
*/
router.post( '/register', authController.register );
router.post( '/login', authController.login );

module.exports = router;