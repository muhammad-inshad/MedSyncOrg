import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import bcrypt from 'bcryptjs';
import { Patient, IPatient } from '../models/Patient.model.ts';
import { HospitalModel, IHospital } from '../models/hospital.model.ts';
import { DoctorModel, IDoctor } from '../models/doctor.model.ts';
import { Role } from '../constants/enums.ts';
const callbackURL = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/google/callback`;
console.log('Google Auth Callback URL:', callbackURL);

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL,
  passReqToCallback: true
},
  async (req, _accessToken, _refreshToken, profile: Profile, done) => {
    try {
      const role = (req.query.state as Role) || Role.PATIENT;
      const email = profile.emails?.[0].value;

      if (!email) {
        return done(new Error('No email found in Google profile'), undefined);
      }

      let user: IPatient | IHospital | IDoctor | null = null;

      if (role === Role.HOSPITAL) {
        user = await HospitalModel.findOne({ email });
      } else if (role === Role.DOCTOR) {
        user = await DoctorModel.findOne({ email });
      } else {
        user = await Patient.findOne({ email });
      }

      if (!user) {
      
        if (role === Role.PATIENT) {
          const hashedPlaceholder = await bcrypt.hash('google-auth-placeholder', 10);
          user = await Patient.create({
            email,
            name: profile.displayName,
            isGoogleAuth: true,
            role: Role.PATIENT,
            password: hashedPlaceholder,
            phone: 0,
            isActive: true,
          } as unknown as IPatient);
        } else if (role === Role.HOSPITAL) {
          const hashedPlaceholder = await bcrypt.hash('google-auth-placeholder', 10);
          user = await HospitalModel.create({
            hospitalName: profile.displayName,
            email,
            address: 'Pending Google Auth',
            phone: '0000000000',
            since: new Date().getFullYear(),
            pincode: '000000',
            password: hashedPlaceholder,
            reviewStatus: 'pending'
          } as unknown as IHospital);
        } else if (role === Role.DOCTOR) {
          const hashedPlaceholder = await bcrypt.hash('google-auth-placeholder', 10);
          user = await DoctorModel.create({
            name: profile.displayName,
            email,
            password: hashedPlaceholder,
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
          } as unknown as IDoctor);
        }
      }

      if (!user) {
        return done(new Error('User creation failed'), undefined);
      }

      return done(null, user as Express.User);
    } catch (error) {
      return done(error as Error, undefined);
    }
  }
));