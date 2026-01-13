// import passport from "passport";
// import { Strategy as GoogleStrategy } from "passport-google-oauth20";
// import { UserRepository } from "../repositories/user.repository";

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//       callbackURL: "/api/auth/google/callback",
//     },
//     async (_accessToken, _refreshToken, profile, done) => {
//       try {
//         const userRepo = new UserRepository();

//         const email = profile.emails?.[0].value;
//         if (!email) return done(new Error("No email from Google"));

//         let user = await userRepo.findByEmail(email);

//         if (!user) {
//           user = await userRepo.create({
//             email,
//             name: profile.displayName,
//             googleId: profile.id,
//             provider: "google",
//           });
//         }

//         return done(null, user);
//       } catch (err) {
//         return done(err, null);
//       }
//     }
//   )
// );
