import express from "express";
import userControllers from "../controllers/userControllers.js";
import session from 'express-session';
import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';
import fileUpload from "express-fileupload";
import imageUpload from "../controllers/blobController.js";
dotenv.config();

const client = new OAuth2Client(process.env.REACT_APP_GOOGLE_CLIENT_ID);



const router = express.Router();
let sessionHandler = session({
  //used to sign the session id, maxAge is the time in ms
  secret: process.env.SECRET,
  name: 'id',
  saveUninitialized: false,
  resave: false,
  cookie: {
    maxAge: 120000,
    secure: false,
    httpOnly: true,
    sameSite: 'strict'
  }
});


//middleware for the upload file
router.use(fileUpload({
  createParentPath: true,
}));
  

router.use(express.json());

/**
 * Athentication post
 */
router.post("/login", sessionHandler, async (req, res) => {
  //TODO: should validate that the token was sent first
  const { token } = req.body;
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.REACT_APP_GOOGLE_CLIENT_ID
  });
  if (!ticket) {
    return res.sendStatus(401);
  }
  const { name, email, picture } = ticket.getPayload();
  //TODO: may want to update and insert the user's name, email and picture in the db.
  //For now I will be using an array, as a mock data that is on top of the app.js
  const user = { "name": name, "email": email, "picture": picture };
  userControllers.addUserIfNew(user);

  //TODO: create a session cookie send it back to the client
  req.session.regenerate(function (err) {
    if (err) {
      //server error, couldn't create the session
      return res.sendStatus(500);
    }
    //store the user's info in the session
    req.session.user = user;
    res.json({ user: user });
  });
});
  

/**
   * route to the server that will require authentication
   * middleware to verify the session
   */
function isAuthenticated(req, res, next) {
  if (!req.session.user) {
    //unauthorized
    return res.sendStatus(401);
  }
  next();
}

/**
   * route for authenticated users only (Template)
   */
router.get("/protected", sessionHandler, isAuthenticated, function (req, res) {
  //would actually be doing something
  res.sendStatus(200);
});


/**
 * POST API to update user elo
 */
router.post("/updateElo", sessionHandler, isAuthenticated, async (req, res) => {
  const user = req.session.user;
  const elo = req.body.elo;
  if(!elo){
    return res.sendStatus(400).end()
  }
  try {
    await userControllers.uptadeElo(user, elo);
    res.sendStatus(200).end();
  } catch (e) {
    console.error(e);
    res.sendStatus(500).end();
  }
});

/**
 * POST API to update user favorites
 */
router.post("/updateFavorites", sessionHandler, isAuthenticated, async (req, res) => {
  const user = req.session.user;
  const favs = req.body.favoriteWords;
  if(!favs){
    return res.sendStatus(400).end()
  }
  try {
    await userControllers.updateFavorites(user, favs);
    res.sendStatus(200).end();
  } catch (e) {
    console.error(e);
    res.sendStatus(500).end();
  }
});

/**
 * POST API to update user pciture
 */
router.post("/updatePicture", sessionHandler, isAuthenticated, async (req, res) => {
  const user = req.session.user;
  const file = req.files.file;
  if(!file){
    return res.sendStatus(400).end()
  }
  try {
    const pictureUrl = await imageUpload(file);
    await userControllers.updatePicture(user, pictureUrl);
    res.sendStatus(200).end();
  } catch (e) {
    console.error(e);
    res.sendStatus(500).end();
  }
});

/**
 * Get API to retrieve User
 */
router.get("/getUserInfo", sessionHandler, isAuthenticated, async (req, res) => {
  let user = req.session.user;
  try {
    user = await userControllers.getUserInfo(user);
    res.json(user).end();
  } catch (e) {
    console.error(e);
    res.sendStatus(500).end();
  }
});


/**
   * logout route
   */
router.get("/logout", sessionHandler, isAuthenticated, function (req, res) {
  //destroy the session
  req.session.destroy(function (err) {
    //callback invoked after destroy returns
    if (err) {
      //server error, couldn't destroy the session
      return res.sendStatus(500);
    }
    res.clearCookie('id');
    res.sendStatus(200);
  });
});
  


export default router;