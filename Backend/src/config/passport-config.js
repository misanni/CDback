const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const prisma = require('../database/db');

passport.use(
  new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return done(null, false, { message: 'Incorrect email.' });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return done(null, false, { message: 'Incorrect password.' });
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.clientID,
      clientSecret: process.env.clientSecret,
      callbackURL: 'http://localhost:5000/auth/google/callback', // Update the callbackURL based on your setup
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await prisma.user.findUnique({ where: { email: profile.emails[0].value } });

        if (user) {
          return done(null, user);
        }

        // If the user doesn't exist, you may want to create a new user in your database
        const newUser = await prisma.user.create({
          data: {
            email: profile.emails[0].value,
            // Add any other required fields from the Google profile
          },
        });

        return done(null, newUser);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await prisma.user.findUnique({ where: { id } });
  done(null, user);
});

module.exports = passport;
