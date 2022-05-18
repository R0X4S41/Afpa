/*  controllers/authentication.js */
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const mysql = require('mysql2');

const {
    DATABASE_HOST : host, 
    DATABASE_USER : user, 
    DATABASE_PWD : password, 
    DATABASE : database
} = process.env
const db = mysql.createConnection({host,user,password,database});

exports.register = (req, res) => {
    const { name, email, password, passwordConfirm } = req.body;
    console.log(`Register (User) { \n\tname: ${name}, \n\temail: ${email}, \n\tpassword: ${password}, \n\tpasswordConfirm: ${passwordConfirm}\n} `);

    if (name.length > 25) {
        console.log(`-: OOps! The name is too big (max 25 character) :-`);
        
        return res.render('register', {
                        message: '-: OOps! The name is too big (max 25 character) :-'
                });
    }
    if (name.length < 3) {
        console.log(`-: OOps! The name is too small (min 3 character) :-`);
        
        return res.render('register', {
                        message: '-: OOps! The name is too small (min 3 character) :-'
                });
    }
    const reMail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if ( !reMail.test(String(email).toLowerCase()) ) {
        console.log(`-: OOps! The Email is not valid :-`);
        
        return res.render('register', {
                        message: '-: The Email is not valid :-'
                }); 
    }
    const rePass= /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/;
    if ( !rePass.test(String(password)) ) {
        console.log(`-: OOps! The password is not valid :-`);
        
        return res.render('register', {
                        message: '-: The password is not valid :-'
                });
    }
    if ( password !== passwordConfirm ) {
        console.log(`-: OOps! The password do not match :-`);
        
        return res.render('register', {
                        message: '-: OOps! The password(s) do not match :-'
                }); 
    }// EO if 

    db.connect( async ( error ) => {
        if ( error ){
            console.log(`[controllers/authentication.js:48] - ${error}`);
            return res.status(200).redirect('/'); 
        } else {
            let hashedPassowrd = await bcrypt.hash( password, 10 ); 
            db.query( "INSERT INTO user SET ?", 
                {name: name, email: email, password: hashedPassowrd}, 
                (err, result) => {
                        if ( err ){
                            if (err.toString().indexOf("user.email") > 0 ){
                                console.log(`-: OOps! this email is already used  :-`);
                                return res.status(400).render('register', {
                                    message: `-: OOps! this email is already used  :-`
                                });
                            }
                            console.log(`[controllers/authentication.js:60] - ${err}`);
                            return res.render('register', {
                                message: `-: OOps! ${err} :-`
                            }); 
                        } else {
                            console.log(result);
                            return res.status(200).redirect('/'); 
                        }// EO if 
            });// EO db.query("insert...
        }// EO if ( error ){
    } ); //EO db.connect( ( error ) => {
};// EO exports.register  

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(`Login { \n\temail: ${email}, \n\tpassword: ${password}\n} `.bgBlack.yellow);
        if ( !email || !password ){
            console.log(`-: OOps! provide an email and password :.`.bgWhite.red);
            return res.status(400).render('login', {
                message: '-: OOps! provide an email and password :-'
            }); 
        }// EO if ( !email || !password ){
        const reMail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if ( reMail.test(String(email).toLowerCase()) == false) {
            console.log(`-: OOps! The Email is not valid :-`);
            
            return res.render('register', {
                            message: '-: The Email is not valid :-'
            }); 
        }
        const sql = 'SELECT id, name, email, password FROM user WHERE `email` = ?';
        db.query( sql, [email], async (error, resultQuery) => {
            if ( !resultQuery.length ){
                console.log(`-: OOps! email or password is incorrect :.`.bgWhite.red);
                return res.status(400).render('login', {
                        message: '-: OOps! email or password is incorrect :-'
                });
            }// EO if ( !resultQuery.length ){

            const isValidPassword = await bcrypt.compare(password, resultQuery[0].password);
            if ( !isValidPassword ) {
                return res.status(400).render('login', {
                        message: '-: OOps! email or password is incorrect :-'
                }); 
            }// EO if ( !isValidPassword ) {

            console.log(`-: Ok! email and password are corrects :.`.bgWhite.blue);

            // How 2 create an cookie    ??? (token -> cookie)
            /*
             *---------------------------------------
             *  T O K E N
             *---------------------------------------
             */
            const id = resultQuery[0].id;
            const token = jwt.sign( { id }, process.env.JWT_SANFLE, {
                expiresIn: process.env.JWT_EXPIRES_IN,
             } );
            console.log(`[controllers/authentication.js:151] - ${token}`);

            /*
             *---------------------------------------
             *  C O O K I E
             *---------------------------------------
             */
            const cookieOpt = { 
                expiresIn: new Date( Date.now() + 
                            process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
                httpOnly: true
            };
            //console.log(`[controllers/authentication.js:167] - ${cookieOpt}`);

            // create cookie
            res.cookie( 'node-mysql', token, cookieOpt);

            return res.status(200).redirect('/');

        })// EO db.query( sql, 

    } catch ( error ){
        console.log(`[controllers/authentication.js:173] - ${error}`);
    }// EO try...catch

};// EO exports.login
