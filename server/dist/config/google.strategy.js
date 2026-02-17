import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Patient } from '../models/Patient.model.ts'; // Adjust based on your role logic
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/api/auth/google/callback",
    passReqToCallback: true
}, async (req, accessToken, refreshToken, profile, done) => {
    try {
        const role = req.query.state;
        const email = profile.emails?.[0].value;
        let user = await Patient.findOne({ email });
        if (!user) {
            user = await Patient.create({
                email,
                name: profile.displayName,
                isGoogleAuth: true,
                role: role || 'patient'
            });
        }
        return done(null, user);
    }
    catch (error) {
        return done(error, undefined);
    }
}));
