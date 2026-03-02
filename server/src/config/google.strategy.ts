import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Patient } from '../models/Patient.model.ts';
import { HospitalModel } from '../models/hospital.model.ts';
import { DoctorModel } from '../models/doctor.model.ts';

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: "http://localhost:5000/api/auth/google/callback",
  passReqToCallback: true
},
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      const role = (req.query.state as string) || 'patient';
      const email = profile.emails?.[0].value;

      let user = null;
      let model: any = Patient;

      if (role === 'hospital') {
        model = HospitalModel;
      } else if (role === 'doctor') {
        model = DoctorModel;
      }

      user = await model.findOne({ email });

      if (!user) {
        // Prepare creation data
        const createData: any = {
          email,
          name: profile.displayName,
          isGoogleAuth: true,
          role: role
        };

        // Note: Hospital and Doctor models might need adjustments to their schemas 
        // to support these fields if they don't already. 
        // For now, we attempt to create according to the role.
        if (role === 'patient') {
          user = await Patient.create(createData);
        } else if (role === 'hospital') {
          // Hospitals have more required fields, this might fail without schema adjustments
          // or we might need to handle partial registration
          user = await HospitalModel.create({
            hospitalName: profile.displayName,
            email,
            address: 'Pending Google Auth',
            phone: '0000000000',
            since: new Date().getFullYear(),
            pincode: '000000',
            password: 'google-auth-placeholder',
            reviewStatus: 'pending'
          });
        } else if (role === 'doctor') {
          user = await DoctorModel.create({
            name: profile.displayName,
            email,
            password: 'google-auth-placeholder',
            phone: '0000000000',
            address: 'Pending Google Auth',
            specialization: 'Pending',
            qualification: 'Pending',
            experience: '0',
            department: 'Pending',
            licence: 'Pending',
            profileImage: profile.photos?.[0].value || '',
            about: 'Bio pending Google Auth',
            reviewStatus: 'pending'
          });
        }
      }

      return done(null, user);
    } catch (error) {
      return done(error as Error, undefined);
    }
  }
));