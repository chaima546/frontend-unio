/* import dotenv from 'dotenv';
dotenv.config();
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import User from "../models/UserModel.js";


// GOOGLE STRATEGY
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ providerId: profile.id, provider: "google" });
    if (!user) {
      user = await User.create({
        username: profile.displayName,
        email: profile.emails[0].value,
        provider: "google",
        providerId: profile.id,
      });
    }
    done(null, user);
  } catch (err) {
    done(err, false);
  }
}));

// FACEBOOK STRATEGY
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_CLIENT_ID,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
  callbackURL: process.env.FACEBOOK_CALLBACK_URL,
  profileFields: ['id', 'emails', 'name', 'displayName']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ providerId: profile.id, provider: "facebook" });
    if (!user) {
      user = await User.create({
        username: profile.displayName,
        email: profile.emails[0].value,
        provider: "facebook",
        providerId: profile.id,
      });
    }
    done(null, user);
  } catch (err) {
    done(err, false);
  }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
}); */