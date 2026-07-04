// src/server.ts
import "dotenv/config";

// src/config/db.ts
import mongoose from "mongoose";
import dotenv from "dotenv";

// src/utils/logger.ts
import winston from "winston";
import fs from "fs";
var logDir = "logs";
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}
var levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};
var level = () => {
  const env = process.env.NODE_ENV || "development";
  const isDevelopment = env === "development";
  return isDevelopment ? "debug" : "warn";
};
var colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white"
};
winston.addColors(colors);
var format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);
var transports = [
  new winston.transports.Console(),
  new winston.transports.File({
    filename: "logs/error.log",
    level: "error"
  }),
  new winston.transports.File({ filename: "logs/all.log" })
];
var Logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports
});
var logger_default = Logger;

// src/config/db.ts
import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);
dotenv.config();
var connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger_default.info("MongoDB connected");
  } catch (error) {
    logger_default.error("MongoDB connection failed", error);
    process.exit(1);
  }
};

// src/app.ts
import express4 from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";
import passport3 from "passport";

// src/routes/auth.routes.ts
import { Router } from "express";

// src/services/auth/patient/implementations/patient.auth.service.ts
import bcrypt from "bcryptjs";

// src/constants/enums.ts
var Role = /* @__PURE__ */ ((Role2) => {
  Role2["DOCTOR"] = "doctor";
  Role2["PATIENT"] = "patient";
  Role2["HOSPITAL"] = "hospital";
  Role2["SUPER_ADMIN"] = "superadmin";
  return Role2;
})(Role || {});

// src/constants/messages.ts
var MESSAGES = {
  AUTH: {
    LOGIN_SUCCESS: "Login successful",
    LOGIN_FAILED: "Invalid email or password",
    INVALID_SEESSION: "Invalid session. Please log in again.",
    SIGNUP_SUCCESS: "Registration successful",
    ALREADY_EXISTS: "User already exists",
    OTP_SENT: "OTP sent successfully",
    OTP_VERIFIED: "OTP verified successfully",
    UNAUTHORIZED: "Authentication required. Please log in.",
    SESSION_EXPIRED: "Session expired or invalid token",
    FORBIDDEN: "You do not have permission to perform this action",
    ACCOUNT_BLOCKED: "Your account has been deactivated. Contact support.",
    INVALID_TOKEN: "Invalid token",
    LOGOUT_SUCCESS: "Logout successful",
    FAILED: "failed"
  },
  DOCTOR: {
    REGISTER_SUCCESS: "Doctor registered successfully",
    LOGIN_SUCCESS: "Doctor login successful",
    REGISTER_FAILED: "Failed to register doctor",
    NOT_FOUND: "Doctor not found",
    UPDATE_SUCCESS: "Doctor updated successfully",
    FETCH_SUCCESS: "Doctor fetched successfully",
    VERIFIED: "Doctor account verified successfully",
    REJECTED: "Doctor application rejected",
    INVALID_STATUS: "Invalid status provided"
  },
  ADMIN: {
    HOSPITAL_EXISTS: "Hospital already exists",
    FETCH_SUCCESS: "Hospital profile fetched successfully",
    UPDATE_SUCCESS: "Hospital updated successfully",
    STATUS_CHANGED: (isActive) => `Hospital successfully ${isActive ? "activated" : "deactivated"}`,
    SIGNUP_SUCCESS: "Hospital registered successfully",
    LOGIN_SUCCESS: "Hospital login successful",
    NOT_FOUND: "Hospital not found"
  },
  PATIENT: {
    FETCH_SUCCESS: "Patient profile fetched successfully",
    UPDATE_SUCCESS: "Patient updated successfully",
    NOT_FOUND: "Patient not found",
    ALREADYBOOKED: "An appointment with these patient details already exists for this date.",
    NOAVILABLETOKEN: "No tokens available for the selected date"
  },
  VALIDATION: {
    REQUIRED_FIELD: "This field is required",
    INVALID_EMAIL: "Invalid email format",
    INVALID_PHONE: "Invalid phone number",
    INVALID_INPUT: "Invalid input provided"
  },
  SERVER: {
    ERROR: "An unexpected error occurred",
    NOT_FOUND: "Resource not found",
    INTERNAL_ERROR: "Internal Server Error"
  },
  UPDATION: {
    UPDATE: " successfully updated",
    ADDED: "successfully created new subscription"
  },
  DASHBOARD_STATS_FETCHED: "Dashboard stats fetched successfully",
  WALLET: {
    FETCH_SUCCESS: "Wallet details fetched successfully",
    ADD_SUCCESS: "Amount added to wallet successfully",
    NOT_FOUND: "Wallet not found",
    INSUFFICIENT_FUNDS: "Insufficient funds in wallet",
    WITHDRAW_SUCCESS: "Amount withdrawn from wallet successfully"
  }
};

// src/errors/app.error.ts
var AppError = class extends Error {
  constructor(message, statusCode = 500 /* INTERNAL_SERVER_ERROR */, isOperational = true) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.status = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
};

// src/utils/apiResponse.utils.ts
var ApiResponse = class {
  static success(res, message = "Success", data, statusCode = 200 /* OK */, pagination) {
    return res.status(statusCode).json({
      success: true,
      message,
      data: data || null,
      pagination
    });
  }
  static error(res, message = MESSAGES.SERVER.ERROR, errors, statusCode = 400 /* BAD_REQUEST */) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors: errors || null
    });
  }
  static created(res, message = "Resource created successfully", data) {
    return this.success(res, message, data, 201 /* CREATED */);
  }
  static validationError(res, message = MESSAGES.VALIDATION.INVALID_INPUT, errors) {
    return this.error(res, message, errors, 400 /* BAD_REQUEST */);
  }
  static unauthorized(res, message = MESSAGES.AUTH.UNAUTHORIZED) {
    return this.error(res, message, null, 401 /* UNAUTHORIZED */);
  }
  static forbidden(res, message = MESSAGES.AUTH.FORBIDDEN) {
    return this.error(res, message, null, 403 /* FORBIDDEN */);
  }
  static notFound(res, message = MESSAGES.SERVER.NOT_FOUND) {
    return this.error(res, message, null, 404 /* NOT_FOUND */);
  }
  static throwError(statusCode, message) {
    throw new AppError(message, statusCode);
  }
  static internalServerError(res, message = MESSAGES.SERVER.ERROR) {
    return this.error(res, message, null, 500 /* INTERNAL_SERVER_ERROR */);
  }
};

// src/dto/auth/success-response.dto.ts
import { z } from "zod";
var SuccessResponseSchema = z.object({
  success: z.boolean(),
  message: z.string()
});

// src/dto/auth/token-response.dto.ts
import { z as z2 } from "zod";
var TokenResponseSchema = z2.object({
  accessToken: z2.string()
});

// src/services/auth/patient/implementations/patient.auth.service.ts
var PatientAuthService = class {
  constructor(_userRepository, _tokenService, _hospitalRepo, _doctorRepo, _patientMapper) {
    this._userRepository = _userRepository;
    this._tokenService = _tokenService;
    this._hospitalRepo = _hospitalRepo;
    this._doctorRepo = _doctorRepo;
    this._patientMapper = _patientMapper;
  }
  async signup(signupData) {
    if (signupData.name.trim() === "" || signupData.name.trim().length < 3) {
      ApiResponse.throwError(400 /* BAD_REQUEST */, "invalide name");
    }
    if (signupData.password.trim() === "" || signupData.password.trim().length < 6) {
      ApiResponse.throwError(400 /* BAD_REQUEST */, "invalide password");
    }
    if (signupData.phone.toString().trim() === "" || signupData.phone.toString().trim().length < 10) {
      ApiResponse.throwError(400 /* BAD_REQUEST */, "invalide phone number");
    }
    if (signupData.email.trim() === "" || !signupData.email.includes("@")) {
      ApiResponse.throwError(400 /* BAD_REQUEST */, "invalide email");
    }
    const existingUser = await this._userRepository.findByEmail(signupData.email);
    if (existingUser) {
      ApiResponse.throwError(400 /* BAD_REQUEST */, MESSAGES.AUTH.ALREADY_EXISTS);
    }
    const hashedPassword = await bcrypt.hash(signupData.password, 10);
    const newUser = await this._userRepository.create({
      ...signupData,
      password: hashedPassword,
      role: signupData.role
    });
    return this.mapToResponse(newUser);
  }
  async login(data) {
    const user = await this._userRepository.findByEmail(data.email);
    if (!user) {
      ApiResponse.throwError(401 /* UNAUTHORIZED */, MESSAGES.AUTH.LOGIN_FAILED);
    }
    if (!user?.password) {
      ApiResponse.throwError(401 /* UNAUTHORIZED */, MESSAGES.AUTH.LOGIN_FAILED);
    }
    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      ApiResponse.throwError(401 /* UNAUTHORIZED */, MESSAGES.AUTH.LOGIN_FAILED);
    }
    const payload = {
      userId: user._id.toString(),
      email: user.email,
      role: data.role
    };
    const accessToken = this._tokenService.generateAccessToken(payload);
    const refreshToken = this._tokenService.generateRefreshToken(payload);
    return {
      user: this.mapToResponse(user),
      accessToken,
      refreshToken
    };
  }
  async resetPassword(email, pass, role) {
    let repo = this._userRepository;
    if (role === "hospital") {
      repo = this._hospitalRepo;
    } else if (role === "doctor") {
      repo = this._doctorRepo;
    }
    const user = await repo.findByEmail(email);
    if (!user) ApiResponse.throwError(404 /* NOT_FOUND */, MESSAGES.PATIENT.NOT_FOUND);
    const hashedPassword = await bcrypt.hash(pass, 10);
    await repo.update(user._id.toString(), { password: hashedPassword });
    return SuccessResponseSchema.parse({ success: true, message: "Password updated successfully" });
  }
  async refreshAccessToken(refreshToken) {
    const payload = this._tokenService.verifyRefreshToken(refreshToken);
    const newAccessToken = this._tokenService.generateAccessToken({
      userId: payload.userId,
      email: payload.email,
      role: payload.role
    });
    return TokenResponseSchema.parse({ accessToken: newAccessToken });
  }
  mapToResponse(user) {
    return this._patientMapper.toDTO(user);
  }
};

// src/repositories/IBase/BaseRepository.ts
var BaseRepository = class {
  constructor(model6) {
    this.model = model6;
  }
  async create(data, session) {
    const createdEntity = new this.model(data);
    return await createdEntity.save(session ? { session } : void 0);
  }
  async findById(id) {
    return await this.model.findById(id).exec();
  }
  async findAll() {
    return await this.model.find().exec();
  }
  async update(id, data) {
    const updateData = { ...data };
    delete updateData._id;
    delete updateData.id;
    const updated = await this.model.findByIdAndUpdate(id, updateData, { new: true }).exec();
    return updated;
  }
  async delete(id) {
    const result = await this.model.findByIdAndDelete(id).exec();
    return !!result;
  }
  async countDocuments(filter = {}) {
    return await this.model.countDocuments(filter).exec();
  }
  async findByEmail(email) {
    return await this.model.findOne({ email }).exec();
  }
  async findByEmailWithPassword(email) {
    return await this.model.findOne({ email }).select("+password").exec();
  }
  async findByIdWithPassword(id) {
    return await this.model.findById(id).select("+password").exec();
  }
  async findWithPagination(options) {
    const { page, limit, search, searchFields, filter } = options;
    const skip = (page - 1) * limit;
    let query = filter ? { ...filter } : {};
    if (search && searchFields && searchFields.length > 0) {
      const searchRegex = new RegExp(search, "i");
      const searchConditions = searchFields.map((field) => ({ [field]: searchRegex }));
      query = {
        ...query,
        $or: searchConditions
      };
    }
    const [data, total] = await Promise.all([
      this.model.find(query).skip(skip).limit(limit).exec(),
      this.model.countDocuments(query).exec()
    ]);
    return { data, total, page, limit };
  }
  async findByFilter(filter) {
    return await this.model.find(filter).exec();
  }
  async findOne(filter) {
    return await this.model.findOne(filter).exec();
  }
};

// src/repositories/patient/user.repository.ts
var UserRepository = class extends BaseRepository {
  constructor(model6) {
    super(model6);
  }
  async getCount(email) {
    return await this.model.countDocuments({ email });
  }
  async addHospital(patientId, hospitalId, session) {
    return await this.model.findByIdAndUpdate(
      patientId,
      { $addToSet: { hospital_id: hospitalId } },
      { new: true, session }
    );
  }
};

// src/controllers/auth/otp/otp.controller.ts
var OtpController = class {
  constructor(otpService) {
    this.otpService = otpService;
  }
  async sendOtp(req, res, next) {
    try {
      const { email, purpose, role } = req.body;
      if (!email) {
        ApiResponse.throwError(400 /* BAD_REQUEST */, MESSAGES.VALIDATION.REQUIRED_FIELD);
      }
      await this.otpService.sendOtp(email, purpose, role);
      return ApiResponse.success(res, MESSAGES.AUTH.OTP_SENT);
    } catch (error) {
      next(error);
    }
  }
  async verifyOtp(req, res, next) {
    try {
      const { signupData, otp } = req.body;
      if (!signupData || !signupData.email) {
        return ApiResponse.validationError(res, "Missing signup data or email");
      }
      await this.otpService.verifyOtp(signupData.email, otp);
      return ApiResponse.success(res, MESSAGES.AUTH.OTP_VERIFIED);
    } catch (error) {
      next(error);
    }
  }
};

// src/controllers/auth/patient/implementations/patient.auth.controller.ts
var patientAuthController = class {
  constructor(authService) {
    this.authService = authService;
    this.signup = async (req, res, next) => {
      try {
        const signupData = req.body;
        const user = await this.authService.signup(signupData);
        return ApiResponse.created(res, "Account created successfully", user);
      } catch (error) {
        next(error);
      }
    };
    this.login = async (req, res, next) => {
      try {
        const loginData = req.body;
        const result = await this.authService.login(loginData);
        const cookieOptions = {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          path: "/"
        };
        res.cookie("refreshToken", result.refreshToken, {
          ...cookieOptions,
          maxAge: Number(process.env.MAX_AGE_REFRESH_TOKEN) || 7 * 24 * 60 * 60 * 1e3
        });
        res.cookie("accessToken", result.accessToken, {
          ...cookieOptions,
          maxAge: Number(process.env.MAX_AGE_ACCESS_TOKEN) || 15 * 60 * 1e3
        });
        return ApiResponse.success(res, "Login successful", {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          user: { ...result.user, role: loginData.role }
        });
      } catch (error) {
        next(error);
      }
    };
    this.refresh = async (req, res, next) => {
      try {
        let refreshToken = req.cookies?.refreshToken;
        if (!refreshToken) {
          refreshToken = req.body?.refreshToken;
        }
        if (!refreshToken) {
          const authHeader = req.headers.authorization;
          if (authHeader && authHeader.startsWith("Refresh ")) {
            refreshToken = authHeader.substring(8);
          }
        }
        if (!refreshToken) {
          return ApiResponse.unauthorized(
            res,
            MESSAGES.AUTH.SESSION_EXPIRED || "Session expired"
          );
        }
        const result = await this.authService.refreshAccessToken(refreshToken);
        res.cookie("accessToken", result.accessToken, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          maxAge: Number(process.env.MAX_AGE_ACCESS_TOKEN) || 15 * 60 * 1e3,
          path: "/"
        });
        return ApiResponse.success(res, "Token refreshed successfully", {
          accessToken: result.accessToken
        });
      } catch (error) {
        next(error);
      }
    };
    this.resetPassword = async (req, res, next) => {
      try {
        const { email, password, role } = req.body;
        const result = await this.authService.resetPassword(
          email,
          password,
          role
        );
        return ApiResponse.success(res, result.message);
      } catch (error) {
        next(error);
      }
    };
    this.logout = async (req, res) => {
      const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/"
      };
      res.clearCookie("accessToken", cookieOptions);
      res.clearCookie("refreshToken", cookieOptions);
      return ApiResponse.success(
        res,
        MESSAGES.AUTH.LOGOUT_SUCCESS
      );
    };
  }
};
var patient_auth_controller_default = patientAuthController;

// src/services/token/token.service.ts
import { randomUUID } from "crypto";
import jwt from "jsonwebtoken";
var { JsonWebTokenError, TokenExpiredError } = jwt;
var TokenService = class {
  constructor() {
    this.accessSecret = process.env.JWT_ACCESS_SECRET || "";
    this.refreshSecret = process.env.JWT_REFRESH_SECRET || "";
    this.accessExpiry = process.env.JWT_ACCESS_EXPIRY || "15m";
    this.refreshExpiry = process.env.JWT_REFRESH_EXPIRY || "7d";
    if (!this.accessSecret || !this.refreshSecret) {
      logger_default.error("JWT secrets not defined in environment variables");
      throw new Error("JWT secrets not defined in environment variables");
    }
  }
  generateAccessToken(payload) {
    return jwt.sign(payload, this.accessSecret, { expiresIn: this.accessExpiry });
  }
  generateRefreshToken(payload) {
    const jti = randomUUID();
    const token = jwt.sign({ ...payload, jti }, this.refreshSecret, { expiresIn: this.refreshExpiry });
    logger_default.info(`Generated refresh token with JTI: ${jti} for user: ${payload.userId}`);
    return token;
  }
  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, this.refreshSecret);
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        logger_default.warn("Refresh token expired");
        ApiResponse.throwError(401 /* UNAUTHORIZED */, "Your session has expired. Please login again.");
      }
      if (error instanceof JsonWebTokenError) {
        logger_default.warn("Invalid refresh token signature");
        ApiResponse.throwError(401 /* UNAUTHORIZED */, "Invalid token signature.");
      }
      logger_default.error("Refresh token verification failed", error);
      ApiResponse.throwError(401 /* UNAUTHORIZED */, "Authentication failed");
    }
  }
  verifyAccessToken(token) {
    try {
      return jwt.verify(token, this.accessSecret);
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        logger_default.warn("Access token expired");
        ApiResponse.throwError(401 /* UNAUTHORIZED */, "Your session has expired.");
      }
      if (error instanceof JsonWebTokenError) {
        logger_default.warn("Invalid access token signature");
        ApiResponse.throwError(401 /* UNAUTHORIZED */, "Invalid token signature.");
      }
      logger_default.error("Access token verification failed", error);
      ApiResponse.throwError(401 /* UNAUTHORIZED */, "Authentication failed");
    }
  }
};

// src/utils/otp/otp.util.ts
var generateOtp = () => {
  return Math.floor(1e5 + Math.random() * 9e5).toString();
};

// src/services/auth/otp/implementations/otp.service.ts
var OtpService = class {
  constructor(userRepo, otpRepository, emailService, hospitalRepo, doctorRepo) {
    this.userRepo = userRepo;
    this.otpRepository = otpRepository;
    this.emailService = emailService;
    this.hospitalRepo = hospitalRepo;
    this.doctorRepo = doctorRepo;
  }
  async sendOtp(email, purpose, role) {
    const cleanEmail = email.trim().toLowerCase();
    let existingUser = null;
    console.log(role);
    if (role === "doctor") {
      existingUser = await this.doctorRepo.findByEmail(cleanEmail);
    } else if (role === "patient") {
      existingUser = await this.userRepo.findByEmail(cleanEmail);
    } else if (role === "hospital") {
      existingUser = await this.hospitalRepo.findByEmail(cleanEmail);
    }
    if (purpose === "forgot-password") {
      if (!existingUser) {
        ApiResponse.throwError(404 /* NOT_FOUND */, `No ${role} found with this email address`);
      }
    } else if (purpose === "signup") {
      if (existingUser) {
        ApiResponse.throwError(409 /* CONFLICT */, MESSAGES.AUTH.ALREADY_EXISTS);
      }
    }
    const otp = generateOtp();
    console.log(`OTP for ${cleanEmail}: ${otp}`);
    await this.otpRepository.saveOtp(cleanEmail, otp);
    await this.emailService.sendOtpEmail(cleanEmail, otp);
    return SuccessResponseSchema.parse({
      success: true,
      message: "OTP sent successfully"
    });
  }
  async verifyOtp(email, userOtp) {
    const cleanEmail = email.trim().toLowerCase();
    const storedOtp = await this.otpRepository.getOtpByEmail(cleanEmail);
    if (!storedOtp) {
      ApiResponse.throwError(400 /* BAD_REQUEST */, "No OTP request found for this email or OTP expired");
    }
    if (storedOtp.otp !== userOtp) {
      ApiResponse.throwError(400 /* BAD_REQUEST */, "Invalid OTP code");
    }
    await this.otpRepository.deleteOtpByEmail(cleanEmail);
    return SuccessResponseSchema.parse({
      success: true,
      message: "OTP verified successfully"
    });
  }
};

// src/utils/otp/mail.util.ts
import nodemailer from "nodemailer";
import dotenv2 from "dotenv";
dotenv2.config();
if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
  console.error(" ERROR: MAIL_USER or MAIL_PASS is not defined in .env file");
}
var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// src/services/auth/otp/implementations/email.service.ts
var EmailService = class {
  async sendOtpEmail(to, otp) {
    const mailOptions = {
      from: `"MedSync" <${process.env.MAIL_USER}>`,
      to,
      subject: "Your MedSync Verification Code",
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
          <h2 style="color: #2563eb;">MedSync Verification</h2>
          <p>Your One-Time Password (OTP) is:</p>
          <h1 style="letter-spacing: 5px; color: #1e40af;">${otp}</h1>
          <p>This code expires in 60 seconds.</p>
          <hr style="border: none; border-top: 1px solid #eee;" />
          <small>If you didn't request this, please ignore this email.</small>
        </div>
      `
    };
    await transporter.sendMail(mailOptions);
    return SuccessResponseSchema.parse({
      success: true,
      message: `OTP sent successfully to ${to}`
    });
  }
};

// src/repositories/hospital/hospital.repository.ts
var HospitalRepository = class extends BaseRepository {
  async startSession(hospitalId) {
    const session = await this.model.findOne({ _id: hospitalId }, { projection: { _id: 0, createAt: 1 } }).exec();
    return session ? session.createdAt : /* @__PURE__ */ new Date();
  }
};

// src/repositories/doctor/doctor.repository.ts
import mongoose2, { Types } from "mongoose";
var DoctorRepository = class extends BaseRepository {
  async countByDepartment(hospitalId, departmentId) {
    const deptObjectId = new mongoose2.Types.ObjectId(departmentId);
    return await this.model.countDocuments({
      hospital_id: hospitalId,
      isActive: true,
      reviewStatus: "approved",
      $or: [
        { department: departmentId },
        ...deptObjectId ? [{ department_id: deptObjectId }] : []
      ]
    }).exec();
  }
  async countActiveDoctor(hospitalId) {
    console.log("hospitalId:", hospitalId);
    console.log("typeof:", typeof hospitalId);
    console.log("hospitalId length:", hospitalId?.length);
    return this.model.countDocuments({
      hospital_id: new Types.ObjectId(hospitalId),
      isActive: true
    }).exec();
  }
  async countBlockedDoctor(hospitalId) {
    return this.model.countDocuments({
      hospital_id: new Types.ObjectId(hospitalId),
      isActive: false
    }).exec();
  }
  async countPendingDoctor(hospitalId) {
    return this.model.countDocuments({
      hospital_id: new Types.ObjectId(hospitalId),
      reviewStatus: "pending"
    }).exec();
  }
  async updateDoctorSalary(doctorId, salary) {
    await this.model.findByIdAndUpdate(doctorId, { salary });
  }
  async findDoctorFromHospitalCount() {
  }
};

// src/models/hospital.model.ts
import mongoose3, { Schema } from "mongoose";
var maxImagesValidator = {
  validator: (val) => val.length <= 3,
  message: "Maximum 3 images allowed"
};
var HospitalSchema = new Schema(
  {
    hospitalName: {
      type: String,
      required: true,
      trim: true
    },
    logo: {
      type: String,
      default: ""
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    role: {
      type: String,
      enum: Object.values(Role),
      default: "hospital" /* HOSPITAL */
    },
    password: {
      type: String,
      required: true,
      select: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    autoDisabled: {
      type: Boolean,
      default: false
    },
    /* ---------------- Images ---------------- */
    images: {
      landscape: {
        type: [String],
        default: [],
        validate: maxImagesValidator
      },
      medicalTeam: {
        type: [String],
        default: [],
        validate: maxImagesValidator
      },
      patientCare: {
        type: [String],
        default: [],
        validate: maxImagesValidator
      },
      services: {
        type: [String],
        default: [],
        validate: maxImagesValidator
      }
    },
    /* ---------------- Contact ---------------- */
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    /* ---------------- Hospital Info ---------------- */
    since: {
      type: Number,
      required: true
    },
    pincode: {
      type: String,
      required: true,
      trim: true
    },
    about: {
      type: String,
      default: ""
    },
    licence: {
      type: String,
      default: ""
    },
    /* ---------------- Finance ---------------- */
    income: {
      type: Number,
      default: 0
    },
    /* ---------------- Review ---------------- */
    reviewStatus: {
      type: String,
      default: "pending"
    },
    reapplyDate: {
      type: Date,
      default: null
    },
    rejectionReason: {
      type: String,
      trim: true
    },
    /* ---------------- Subscription ---------------- */
    subscription: {
      planId: {
        type: Schema.Types.ObjectId,
        ref: "Subscription"
      },
      plan: {
        type: String,
        default: "free"
      },
      amount: {
        type: Number,
        default: 0
      },
      status: {
        type: String,
        enum: ["active", "expired", "cancelled"],
        default: "active"
      },
      startDate: {
        type: Date,
        default: Date.now
      },
      endDate: {
        type: Date
      },
      pendingPlanId: {
        type: Schema.Types.ObjectId,
        ref: "Subscription"
      },
      pendingPlanName: {
        type: String
      },
      pendingActivationDate: {
        type: Date
      },
      upgradeType: {
        type: String,
        enum: ["upgrade", "downgrade", "new", "activate_downgrade"]
      }
    }
  },
  {
    timestamps: true
  }
);
var HospitalModel = mongoose3.model(
  "Hospital",
  HospitalSchema
);

// src/models/doctor.model.ts
import { Schema as Schema2, model } from "mongoose";
var doctorSchema = new Schema2(
  {
    name: {
      type: String,
      required: [true, "Doctor name is required"],
      trim: true
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false
    },
    phone: {
      type: String,
      required: [true, "Phone is required"]
    },
    address: {
      type: String,
      required: [true, "Address is required"]
    },
    specialization_id: {
      type: String,
      required: [true, "Specialization is required"]
    },
    qualification: {
      type: String,
      required: [true, "Qualification is required"]
    },
    experience: {
      type: String,
      required: [true, "Experience is required"]
    },
    department_id: {
      type: String,
      required: [true, "Department is required"]
    },
    hospital_id: {
      type: Schema2.Types.ObjectId,
      ref: "Hospital",
      required: false
    },
    role: {
      type: String,
      enum: Object.values(Role),
      default: "doctor" /* DOCTOR */
    },
    licence: {
      type: String,
      required: [true, "Medical license is required"]
    },
    profileImage: {
      type: String,
      required: [true, "Profile image is required"]
    },
    about: {
      type: String,
      required: [true, "About is required"]
    },
    salary: {
      type: Number,
      default: 0,
      required: false
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    reviewCount: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: false
    },
    isAccountVerified: {
      type: Boolean,
      default: false
    },
    reviewStatus: {
      type: String,
      enum: ["pending", "approved", "revision", "rejected"],
      default: "pending"
    },
    reapplyDate: {
      type: Date,
      default: null
    },
    rejectionReason: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);
var DoctorModel = model("Doctor", doctorSchema);

// src/controllers/auth/patient/implementations/googleAuth.controller.ts
var GoogleAuthController = class {
  constructor(tokenService2) {
    this.tokenService = tokenService2;
  }
  async handleCallback(req, res, next) {
    try {
      const user = req.user;
      if (!user) {
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_user`);
      }
      const userPayload = user.toObject ? user.toObject() : user;
      const role = req.query.state || "patient";
      const cleanPayload = {
        userId: userPayload._id.toString(),
        email: userPayload.email,
        role
      };
      const accessToken = this.tokenService.generateAccessToken(cleanPayload);
      const refreshToken = this.tokenService.generateRefreshToken(cleanPayload);
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: Number(process.env.MAX_AGE_REFRESH_TOKEN) || 7 * 24 * 60 * 60 * 1e3
      });
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: Number(process.env.MAX_AGE_ACCESS_TOKEN) || 15 * 60 * 1e3,
        path: "/"
      });
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      const userData = encodeURIComponent(JSON.stringify({
        _id: userPayload._id,
        email: userPayload.email,
        name: userPayload.name,
        role
      }));
      return res.redirect(`${frontendUrl}/google-success?user=${userData}&role=${role}`);
    } catch (error) {
      logger_default.error("Google Auth Controller Error:", error);
      next(error);
    }
  }
};

// src/models/Otp.model.ts
import mongoose4, { Schema as Schema3 } from "mongoose";
var OtpSchema = new Schema3({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, index: { expires: 59 } }
});
var OtpModel = mongoose4.model("Otp", OtpSchema);

// src/repositories/otp/otp.repository.ts
var OtpRepository = class extends BaseRepository {
  constructor() {
    super(OtpModel);
  }
  async saveOtp(email, otp) {
    await this.model.findOneAndUpdate(
      { email },
      { otp, createdAt: /* @__PURE__ */ new Date() },
      { upsert: true, new: true }
    ).exec();
  }
  async getOtpByEmail(email) {
    return await this.model.findOne({ email }).exec();
  }
  async deleteOtpByEmail(email) {
    await this.model.deleteOne({ email }).exec();
  }
};

// src/dto/patient/patient-response.dto.ts
import { z as z3 } from "zod";
var PatientResponseSchema = z3.object({
  id: z3.string(),
  name: z3.string(),
  email: z3.string().email(),
  phone: z3.number().nullable().optional(),
  isGoogleAuth: z3.boolean(),
  fatherName: z3.string().nullable().optional(),
  gender: z3.enum(["male", "female", "other"]).nullable().optional(),
  dateOfBirth: z3.union([z3.date(), z3.string()]).nullable().optional(),
  address: z3.string().nullable().optional(),
  isActive: z3.boolean().optional(),
  image: z3.string().nullable().optional(),
  bloodGroup: z3.string().nullable().optional(),
  walletBalance: z3.number(),
  medicalReports: z3.array(z3.string()),
  hospital_id: z3.string().optional().nullable(),
  appointmentHistory: z3.array(z3.string()),
  isProfileComplete: z3.boolean(),
  createdAt: z3.union([z3.date(), z3.string()]),
  updatedAt: z3.union([z3.date(), z3.string()]),
  age: z3.number().optional()
});
var CreatePatientSchema = z3.object({
  name: z3.string(),
  email: z3.string().email(),
  phone: z3.number().optional(),
  password: z3.string().optional(),
  fatherName: z3.string().optional(),
  gender: z3.enum(["male", "female", "other"]).optional(),
  dateOfBirth: z3.union([z3.date(), z3.string()]).optional(),
  address: z3.string().optional(),
  bloodGroup: z3.string().optional(),
  age: z3.number().optional(),
  image: z3.string().optional()
});
var UpdatePatientSchema = CreatePatientSchema.partial().extend({
  willRemoveImage: z3.boolean().or(z3.string()).optional(),
  isActive: z3.boolean().optional()
});

// src/mappers/patient.mapper.ts
var PatientMapper = class {
  toDTO(patient) {
    const dto = {
      id: patient._id.toString(),
      name: patient.name || patient.email,
      email: patient.email,
      phone: patient.phone,
      isGoogleAuth: patient.isGoogleAuth || false,
      fatherName: patient.fatherName,
      gender: patient.gender,
      dateOfBirth: patient.dateOfBirth,
      address: patient.address,
      isActive: patient.isActive,
      image: patient.image,
      bloodGroup: patient.bloodGroup,
      walletBalance: patient.walletBalance || 0,
      medicalReports: patient.medicalReports || [],
      hospital_id: patient.hospital_id?.toString(),
      appointmentHistory: patient.appointmentHistory ? patient.appointmentHistory.map((id) => id.toString()) : [],
      isProfileComplete: patient.isProfileComplete || false,
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt,
      age: patient.age
    };
    try {
      return PatientResponseSchema.parse(dto);
    } catch (error) {
      console.log("Validation failed for:", dto.email);
      console.error(JSON.stringify(error, null, 2));
      throw error;
    }
  }
};

// src/models/Patient.model.ts
import mongoose5, { Schema as Schema4 } from "mongoose";
var patientSchema = new Schema4(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: Number, required: false },
    password: { type: String, required: false },
    isGoogleAuth: { type: Boolean, default: false },
    fatherName: { type: String },
    gender: { type: String, enum: ["male", "female", "other"] },
    dateOfBirth: { type: Date },
    address: { type: String },
    isActive: { type: Boolean },
    image: { type: String },
    bloodGroup: { type: String },
    age: { type: Number },
    role: {
      type: String,
      enum: Object.values(Role),
      default: "patient" /* PATIENT */
    },
    walletBalance: { type: Number, default: 0 },
    medicalReports: { type: [String], default: [] },
    hospital_id: [
      {
        type: mongoose5.Schema.Types.ObjectId,
        ref: "Hospital"
      }
    ],
    appointmentHistory: [
      {
        type: mongoose5.Schema.Types.ObjectId,
        ref: "Appointment"
      }
    ],
    isProfileComplete: { type: Boolean, default: false }
  },
  {
    timestamps: true
  }
);
var Patient = mongoose5.model("Patient", patientSchema);

// src/di/auth.di.ts
var userContainer = () => {
  const tokenService2 = new TokenService();
  const emailService = new EmailService();
  const userRepository = new UserRepository(Patient);
  const doctorRepo = new DoctorRepository(DoctorModel);
  const hospitalRepo = new HospitalRepository(HospitalModel);
  const otpRepository = new OtpRepository();
  const otpservice = new OtpService(
    userRepository,
    otpRepository,
    emailService,
    hospitalRepo,
    doctorRepo
  );
  const patientMapper = new PatientMapper();
  const authService = new PatientAuthService(userRepository, tokenService2, hospitalRepo, doctorRepo, patientMapper);
  const otpController2 = new OtpController(otpservice);
  const authController2 = new patient_auth_controller_default(authService);
  const googleAuthController2 = new GoogleAuthController(tokenService2);
  return {
    userRepository,
    authService,
    otpController: otpController2,
    authController: authController2,
    tokenService: tokenService2,
    googleAuthController: googleAuthController2
  };
};

// src/controllers/auth/doctor/doctor.auth.controller.ts
var DoctorAuthController = class {
  constructor(_doctorAuthService) {
    this._doctorAuthService = _doctorAuthService;
    this.registerDoctor = async (req, res, next) => {
      try {
        const files = req.files;
        const doctorData = req.body;
        const doctor = await this._doctorAuthService.registerDoctor(
          doctorData,
          files
        );
        return ApiResponse.created(res, MESSAGES.DOCTOR.REGISTER_SUCCESS, doctor);
      } catch (error) {
        next(error);
      }
    };
    this.loginDoctor = async (req, res, next) => {
      try {
        const loginData = req.body;
        const result = await this._doctorAuthService.loginDoctor(loginData);
        res.cookie("refreshToken", result.refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          maxAge: Number(process.env.MAX_AGE_REFRESH_TOKEN) || 7 * 24 * 60 * 60 * 1e3,
          path: "/"
        });
        res.cookie("accessToken", result.accessToken, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          maxAge: Number(process.env.MAX_AGE_ACCESS_TOKEN) || 15 * 60 * 1e3,
          path: "/"
        });
        return ApiResponse.success(res, MESSAGES.DOCTOR.LOGIN_SUCCESS, {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          user: {
            ...result.user,
            role: "doctor"
          }
        });
      } catch (error) {
        next(error);
      }
    };
    this.selectHospitals = async (req, res, next) => {
      try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6;
        const search = req.query.search || "";
        const result = await this._doctorAuthService.getAvailableHospitals(page, limit, search);
        return ApiResponse.success(res, "Hospitals fetched successfully", result);
      } catch (error) {
        next(error);
      }
    };
    this.getHospitalDepartments = async (req, res, next) => {
      try {
        const { hospitalId } = req.params;
        const result = await this._doctorAuthService.getHospitalDepartments(hospitalId);
        return ApiResponse.success(res, "Departments fetched successfully", result);
      } catch (error) {
        next(error);
      }
    };
    this.getHospitalQualifications = async (req, res, next) => {
      try {
        const { hospitalId } = req.params;
        const result = await this._doctorAuthService.getHospitalQualifications(hospitalId);
        return ApiResponse.success(res, "Qualifications fetched successfully", result);
      } catch (error) {
        next(error);
      }
    };
    this.getHospitalSpecializations = async (req, res, next) => {
      try {
        const { hospitalId } = req.params;
        const { departmentId } = req.query;
        const result = await this._doctorAuthService.getHospitalSpecializations(hospitalId, departmentId);
        return ApiResponse.success(res, "Specializations fetched successfully", result);
      } catch (error) {
        next(error);
      }
    };
  }
};

// src/services/auth/doctor/doctor.auth.service.ts
import bcrypt2 from "bcryptjs";

// src/config/cloudinary.ts
import { v2 as cloudinary } from "cloudinary";
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
var cloudinary_default = cloudinary;

// src/utils/cloudinaryUpload.ts
import { Readable } from "stream";
var uploadBufferToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary_default.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("Upload failed"));
        resolve(result.secure_url);
      }
    );
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(stream);
  });
};
var extractPublicId = (url) => {
  try {
    const parts = url.split("/");
    const uploadIndex = parts.indexOf("upload");
    if (uploadIndex === -1) return "";
    const pathParts = parts.slice(uploadIndex + 2);
    const fullPath = pathParts.join("/");
    return fullPath.split(".")[0];
  } catch (error) {
    console.error("Error extracting public ID:", error);
    return "";
  }
};
var deleteFromCloudinary = async (url) => {
  const publicId = extractPublicId(url);
  if (!publicId) return;
  try {
    await cloudinary_default.uploader.destroy(publicId);
  } catch (error) {
    console.error(`Failed to delete image with public ID ${publicId}:`, error);
  }
};

// src/services/auth/doctor/doctor.auth.service.ts
import { Types as Types3 } from "mongoose";
var DoctorAuthService = class {
  constructor(_doctorRepo, _tokenService, _doctorMapper, _hospitalRepo, _hospitalMapper, _departmentRepo, _qualificationRepo, _specializationRepo, _departmentMapper, _qualificationMapper, _specializationMapper) {
    this._doctorRepo = _doctorRepo;
    this._tokenService = _tokenService;
    this._doctorMapper = _doctorMapper;
    this._hospitalRepo = _hospitalRepo;
    this._hospitalMapper = _hospitalMapper;
    this._departmentRepo = _departmentRepo;
    this._qualificationRepo = _qualificationRepo;
    this._specializationRepo = _specializationRepo;
    this._departmentMapper = _departmentMapper;
    this._qualificationMapper = _qualificationMapper;
    this._specializationMapper = _specializationMapper;
  }
  async registerDoctor(body, files) {
    let profileImageUrl = "";
    let licenseUrl = "";
    const existingDoctor = await this._doctorRepo.findByEmail(body.email);
    if (existingDoctor) {
      ApiResponse.throwError(409 /* CONFLICT */, MESSAGES.AUTH.ALREADY_EXISTS);
      logger_default.warn(`Registration attempt with existing email: ${body.email}`);
    }
    if (files?.profileImage?.[0]) {
      profileImageUrl = await uploadBufferToCloudinary(
        files.profileImage[0].buffer,
        "doctors/profile"
      );
    }
    if (files?.license?.[0]) {
      licenseUrl = await uploadBufferToCloudinary(
        files.license[0].buffer,
        "doctors/license"
      );
    }
    const hashedPassword = await bcrypt2.hash(body.password, 10);
    const doctorData = {
      name: body.name,
      email: body.email,
      password: hashedPassword,
      hospital_id: new Types3.ObjectId(body.hospital_id),
      phone: body.phone,
      address: body.address,
      specialization_id: body.specialization,
      qualification: body.qualification,
      experience: body.experience,
      department_id: body.department,
      about: body.about,
      licence: licenseUrl,
      profileImage: profileImageUrl,
      isActive: true,
      isAccountVerified: false,
      reviewStatus: "pending"
    };
    const created = await this._doctorRepo.create(doctorData);
    return this._doctorMapper.toDTO(created);
  }
  async loginDoctor(loginData) {
    const doctor = await this._doctorRepo.findByEmailWithPassword(loginData.email);
    if (!doctor) {
      ApiResponse.throwError(400 /* BAD_REQUEST */, MESSAGES.AUTH.LOGIN_FAILED);
    }
    if (!doctor.isActive) {
      ApiResponse.throwError(403 /* FORBIDDEN */, MESSAGES.AUTH.ACCOUNT_BLOCKED);
    }
    const isPasswordMatch = await bcrypt2.compare(
      loginData.password,
      doctor.password
    );
    if (!isPasswordMatch) {
      ApiResponse.throwError(400 /* BAD_REQUEST */, MESSAGES.AUTH.LOGIN_FAILED);
    }
    const accessToken = this._tokenService.generateAccessToken({
      userId: doctor._id.toString(),
      email: doctor.email,
      role: loginData.role
    });
    const refreshToken = this._tokenService.generateRefreshToken({
      userId: doctor._id.toString(),
      email: doctor.email,
      role: loginData.role
    });
    return { user: this._doctorMapper.toDTO(doctor), accessToken, refreshToken };
  }
  async getAvailableHospitals(page, limit, search) {
    const filter = {
      reviewStatus: "approved",
      isActive: true
    };
    if (search) {
      filter.$or = [
        { hospitalName: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } }
      ];
    }
    const result = await this._hospitalRepo.findWithPagination({
      page,
      limit,
      filter
    });
    return {
      hospitals: result.data.map((h) => this._hospitalMapper.toDTO(h)),
      total: result.total,
      totalPages: Math.ceil(result.total / limit),
      currentPage: page
    };
  }
  async getHospitalDepartments(hospitalId) {
    const result = await this._departmentRepo.findByHospitalId(hospitalId);
    return result.data.map((d) => this._departmentMapper.toDTO(d));
  }
  async getHospitalQualifications(hospitalId) {
    const qualifications = await this._qualificationRepo.findByHospitalId(hospitalId);
    return qualifications.map((q) => this._qualificationMapper.toDTO(q));
  }
  async getHospitalSpecializations(hospitalId, departmentId) {
    let result;
    if (departmentId) {
      result = await this._specializationRepo.findByDepartmentId(departmentId);
    } else {
      result = await this._specializationRepo.findByHospitalId(hospitalId);
    }
    return result.map((s) => this._specializationMapper.toDTO(s));
  }
};

// src/controllers/doctor/doctor.controller.ts
var DoctorController = class {
  constructor(_doctorService) {
    this._doctorService = _doctorService;
    this.getme = async (req, res, next) => {
      try {
        const user = req.user;
        const doctorID = user?.doctorID || user?.userId;
        if (!doctorID) {
          ApiResponse.throwError(401 /* UNAUTHORIZED */, "Unauthorized");
        }
        const doctor = await this._doctorService.getDoctorProfile(doctorID);
        return res.status(200 /* OK */).json({
          success: true,
          data: doctor
        });
      } catch (error) {
        next(error);
      }
    };
    this.updateDoctor = async (req, res, next) => {
      try {
        const id = req.user?.doctorID || req.user?.userId;
        if (!id) {
          return ApiResponse.throwError(401 /* UNAUTHORIZED */, "Unauthorized");
        }
        const files = req.files;
        const updateData = { ...req.body };
        if (typeof updateData.consultationTime === "string") {
          try {
            updateData.consultationTime = JSON.parse(updateData.consultationTime);
          } catch (error) {
            logger_default.error("Error parsing consultationTime:", error);
          }
        }
        if (typeof updateData.payment === "string") {
          try {
            updateData.payment = JSON.parse(updateData.payment);
          } catch (error) {
            logger_default.error("Error parsing payment:", error);
          }
        }
        if (files?.profileImage?.[0]) {
          updateData.profileImageFile = files.profileImage[0];
        }
        if (files?.license?.[0]) {
          updateData.licenseFile = files.license[0];
        }
        const updatedDoctor = await this._doctorService.updateDoctorProfile(id, updateData);
        return res.status(200 /* OK */).json({
          success: true,
          message: "Doctor updated successfully",
          data: updatedDoctor
        });
      } catch (error) {
        next(error);
      }
    };
    this.reapplyDoctor = async (req, res, next) => {
      try {
        const { id } = req.params;
        const result = await this._doctorService.reapply(id);
        return res.status(200 /* OK */).json({
          success: true,
          message: "Doctor re-application submitted",
          data: result
        });
      } catch (error) {
        next(error);
      }
    };
    this.applyLeave = async (req, res, next) => {
      try {
        const user = req.user;
        const doctorId = user?.doctorID || user?.userId;
        if (!doctorId) {
          return ApiResponse.throwError(401 /* UNAUTHORIZED */, "Unauthorized");
        }
        const { startDate, endDate, leaveSession, reason, photo: bodyPhoto } = req.body;
        const filePhoto = req.file;
        const photo = filePhoto || bodyPhoto;
        const result = await this._doctorService.applyLeave(doctorId, {
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          leaveSession: leaveSession || void 0,
          reason,
          photo
        });
        return ApiResponse.success(res, "Leave application submitted successfully", result, 201 /* CREATED */);
      } catch (error) {
        next(error);
      }
    };
    this.getDoctorLeaves = async (req, res, next) => {
      try {
        const user = req.user;
        const doctorId = user?.doctorID || user?.userId;
        if (!doctorId) {
          return ApiResponse.throwError(401 /* UNAUTHORIZED */, "Unauthorized");
        }
        const { page = 1, limit = 5, startDate, endDate } = req.query;
        const result = await this._doctorService.getDoctorLeaves({
          doctorId,
          page: Number(page),
          limit: Number(limit),
          startDate: startDate ? new Date(startDate) : void 0,
          endDate: endDate ? new Date(endDate) : void 0
        });
        return ApiResponse.success(res, "Leaves fetched successfully", result.data, 200 /* OK */, {
          page: result.page,
          limit: result.limit,
          totalItems: result.total,
          totalPages: Math.ceil(result.total / result.limit)
        });
      } catch (error) {
        next(error);
      }
    };
  }
};
var doctor_controller_default = DoctorController;

// src/services/doctor/implementations/doctor.service.ts
import bcrypt3 from "bcryptjs";
var DoctorService = class {
  constructor(_doctorRepo, _tokenService, _appointmentRepo, _leaveRepo, _doctorMapper, _leaveMapper) {
    this._doctorRepo = _doctorRepo;
    this._tokenService = _tokenService;
    this._appointmentRepo = _appointmentRepo;
    this._leaveRepo = _leaveRepo;
    this._doctorMapper = _doctorMapper;
    this._leaveMapper = _leaveMapper;
  }
  async getDoctorProfile(doctorId) {
    const doctor = await this._doctorRepo.findById(doctorId);
    if (!doctor) {
      ApiResponse.throwError(404 /* NOT_FOUND */, MESSAGES.DOCTOR.NOT_FOUND);
    }
    return this._doctorMapper.toDTO(doctor);
  }
  async updateDoctorProfile(id, updateData) {
    const existingDoctor = await this._doctorRepo.findById(id);
    if (!existingDoctor) ApiResponse.throwError(404 /* NOT_FOUND */, MESSAGES.DOCTOR.NOT_FOUND);
    if (updateData.profileImageFile) {
      if (existingDoctor.profileImage) {
        await cloudinary_default.uploader.destroy(extractPublicId(existingDoctor.profileImage));
      }
      const profileImageUrl = await uploadBufferToCloudinary(
        updateData.profileImageFile.buffer,
        "doctors/profile"
      );
      updateData.profileImage = profileImageUrl;
      delete updateData.profileImageFile;
    } else if (updateData.profileImage && updateData.profileImage.startsWith("data:image")) {
      const res = await cloudinary_default.uploader.upload(updateData.profileImage, {
        folder: "doctors/profiles"
      });
      updateData.profileImage = res.secure_url;
    }
    if (updateData.licenseFile) {
      if (existingDoctor.licence) {
        await cloudinary_default.uploader.destroy(extractPublicId(existingDoctor.licence));
      }
      const licenseUrl = await uploadBufferToCloudinary(
        updateData.licenseFile.buffer,
        "doctors/license"
      );
      updateData.licence = licenseUrl;
      delete updateData.licenseFile;
    } else if (updateData.licenseImage && updateData.licenseImage.startsWith("data:image")) {
      const res = await cloudinary_default.uploader.upload(updateData.licenseImage, {
        folder: "doctors/licenses"
      });
      updateData.licence = res.secure_url;
      delete updateData.licenseImage;
    }
    updateData.rejectionReason = void 0;
    if (updateData.currentPassword && updateData.newPassword) {
      const doctorWithPassword = await this._doctorRepo.findByIdWithPassword(id);
      if (!doctorWithPassword) {
        ApiResponse.throwError(404 /* NOT_FOUND */, MESSAGES.DOCTOR.NOT_FOUND);
      }
      const isPasswordMatch = await bcrypt3.compare(
        updateData.currentPassword,
        doctorWithPassword.password
      );
      if (!isPasswordMatch) {
        ApiResponse.throwError(400 /* BAD_REQUEST */, "Current password does not match");
      }
      const hashedPassword = await bcrypt3.hash(updateData.newPassword, 10);
      updateData.password = hashedPassword;
      delete updateData.currentPassword;
      delete updateData.newPassword;
    }
    const updated = await this._doctorRepo.update(id, updateData);
    return this._doctorMapper.toDTO(updated);
  }
  async reapply(doctorId) {
    const doctor = await this._doctorRepo.findById(doctorId);
    if (!doctor) ApiResponse.throwError(404 /* NOT_FOUND */, MESSAGES.DOCTOR.NOT_FOUND);
    const updateData = {
      ...doctor.toObject(),
      reviewStatus: "pending",
      reapplyDate: /* @__PURE__ */ new Date()
    };
    const updated = await this._doctorRepo.update(doctorId, updateData);
    return this._doctorMapper.toDTO(updated);
  }
  async applyLeave(doctorId, leaveData) {
    let photoUrl = "";
    if (leaveData.photo) {
      if (typeof leaveData.photo === "string" && leaveData.photo.startsWith("data:image")) {
        const res = await cloudinary_default.uploader.upload(leaveData.photo, {
          folder: "doctors/leaves"
        });
        photoUrl = res.secure_url;
      } else if (typeof leaveData.photo !== "string") {
        photoUrl = await uploadBufferToCloudinary(
          leaveData.photo.buffer,
          "doctors/leaves"
        );
      }
    }
    const leave = await this._leaveRepo.create({
      doctorId,
      startDate: leaveData.startDate,
      endDate: leaveData.endDate,
      leaveSession: leaveData.leaveSession,
      reason: leaveData.reason,
      photo: photoUrl,
      status: "pending"
    });
    return this._leaveMapper.toDTO(leave);
  }
  async getDoctorLeaves(options) {
    const res = await this._leaveRepo.findDoctorLeaves(options);
    return {
      ...res,
      data: res.data.map((l) => this._leaveMapper.toDTO(l))
    };
  }
};

// src/dto/doctor/doctor-response.dto.ts
import { z as z4 } from "zod";
var DoctorResponseSchema = z4.object({
  id: z4.string(),
  name: z4.string(),
  email: z4.string().email(),
  phone: z4.string(),
  address: z4.string(),
  specialization: z4.string(),
  qualification: z4.string(),
  experience: z4.string(),
  department: z4.string(),
  about: z4.string(),
  licence: z4.string(),
  profileImage: z4.string(),
  rating: z4.number(),
  reviewCount: z4.number(),
  isActive: z4.boolean(),
  salary: z4.number(),
  isAccountVerified: z4.boolean(),
  reviewStatus: z4.enum(["pending", "approved", "revision", "rejected"]),
  reapplyDate: z4.union([z4.date(), z4.string()]).nullable().optional(),
  // Add .nullable()
  hospital_id: z4.string().nullable().optional(),
  rejectionReason: z4.string().optional(),
  createdAt: z4.union([z4.date(), z4.string()]),
  updatedAt: z4.union([z4.date(), z4.string()])
});

// src/mappers/doctor.mapper.ts
var DoctorMapper = class {
  toDTO(doctor) {
    const dto = {
      id: doctor._id.toString(),
      name: doctor.name,
      email: doctor.email,
      phone: doctor.phone,
      address: doctor.address,
      specialization: doctor.specialization?.toString() || "",
      qualification: doctor.qualification,
      experience: doctor.experience,
      department: doctor.department?.toString() || "",
      hospital_id: doctor.hospital_id ? doctor.hospital_id.toString() : null,
      about: doctor.about || "",
      licence: doctor.licence || "",
      profileImage: doctor.profileImage || "",
      rating: Number(doctor.rating) || 0,
      reviewCount: Number(doctor.reviewCount) || 0,
      isActive: Boolean(doctor.isActive),
      isAccountVerified: Boolean(doctor.isAccountVerified),
      reviewStatus: doctor.reviewStatus,
      reapplyDate: doctor.reapplyDate,
      rejectionReason: doctor.rejectionReason,
      salary: doctor.salary,
      createdAt: doctor.createdAt,
      updatedAt: doctor.updatedAt
    };
    return DoctorResponseSchema.parse(dto);
  }
};

// src/middleware/doctor.auth.middleware.ts
var DoctorAuthMiddleware = class {
  constructor(_tokenService, _doctorRepo) {
    this._tokenService = _tokenService;
    this._doctorRepo = _doctorRepo;
    this.handle = async (req, res, next) => {
      try {
        const token = req.cookies?.accessToken;
        if (!token) {
          return res.status(401 /* UNAUTHORIZED */).json({ message: "Access token missing" });
        }
        const payload = this._tokenService.verifyAccessToken(token);
        if (payload.role !== "doctor") {
          logger_default.warn(`Attempted doctor access by user with role: ${payload.role}`);
          return res.status(403 /* FORBIDDEN */).json({ message: "Insufficient permissions" });
        }
        const doctor = await this._doctorRepo.findById(payload.userId);
        if (!doctor || doctor.isActive === false) {
          return res.status(403 /* FORBIDDEN */).json({ message: "Account is blocked" });
        }
        req.user = {
          ...payload,
          doctorID: doctor.id
        };
        next();
      } catch (error) {
        logger_default.error("Doctor auth middleware error:", error);
        return res.status(401 /* UNAUTHORIZED */).json({ message: "Invalid or expired token" });
      }
    };
  }
};

// src/dto/hospital/hospital-response.dto.ts
import { z as z5 } from "zod";
var HospitalResponseSchema = z5.object({
  id: z5.string(),
  hospitalName: z5.string(),
  address: z5.string(),
  isActive: z5.boolean(),
  autoDisabled: z5.boolean(),
  email: z5.string().email(),
  phone: z5.string(),
  since: z5.number(),
  pincode: z5.string(),
  reapplyDate: z5.union([z5.date(), z5.string()]).nullable().optional(),
  logo: z5.string().nullable().optional(),
  licence: z5.string().nullable().optional(),
  about: z5.string().nullable().optional(),
  income: z5.number(),
  images: z5.object({
    landscape: z5.array(z5.string()),
    medicalTeam: z5.array(z5.string()),
    patientCare: z5.array(z5.string()),
    services: z5.array(z5.string())
  }),
  reviewStatus: z5.enum(["pending", "approved", "revision", "rejected"]),
  rejectionReason: z5.string().optional(),
  subscription: z5.object({
    plan: z5.string(),
    amount: z5.number(),
    status: z5.enum(["active", "expired", "cancelled"]),
    startDate: z5.union([z5.date(), z5.string()]).optional(),
    endDate: z5.union([z5.date(), z5.string()]).optional(),
    limits: z5.object({
      maxPatients: z5.number(),
      maxDoctors: z5.number(),
      maxDepartments: z5.number()
    }).optional()
  }),
  currentCounts: z5.object({
    doctors: z5.number(),
    patients: z5.number(),
    departments: z5.number()
  }).optional(),
  createdAt: z5.union([z5.date(), z5.string()]),
  updatedAt: z5.union([z5.date(), z5.string()])
});
var DepartmentResponseSchema = z5.object({
  _id: z5.string(),
  departmentName: z5.string(),
  description: z5.string().optional(),
  image: z5.string().optional(),
  doctorCount: z5.number().optional()
});
var QualificationResponseSchema = z5.object({
  _id: z5.string(),
  name: z5.string(),
  qualificationName: z5.string(),
  description: z5.string().optional(),
  image: z5.string().optional()
});
var SpecializationResponseSchema = z5.object({
  _id: z5.string(),
  name: z5.string(),
  description: z5.string().optional(),
  image: z5.string().optional(),
  department_id: z5.string()
});
var SelectedHospitalSchema = z5.object({
  _id: z5.string(),
  hospitalName: z5.string(),
  logo: z5.string().optional(),
  address: z5.string(),
  isActive: z5.boolean(),
  autoDisabled: z5.boolean(),
  images: z5.object({
    landscape: z5.array(z5.string()),
    medicalTeam: z5.array(z5.string()),
    patientCare: z5.array(z5.string()),
    services: z5.array(z5.string())
  }),
  email: z5.string().email(),
  phone: z5.string(),
  since: z5.number(),
  pincode: z5.string(),
  about: z5.string().optional(),
  licence: z5.string().optional(),
  subscription: z5.object({
    plan: z5.string(),
    amount: z5.number(),
    status: z5.enum(["active", "expired", "cancelled"]),
    startDate: z5.union([z5.date(), z5.string()]).optional(),
    endDate: z5.union([z5.date(), z5.string()]).optional(),
    limits: z5.object({
      maxPatients: z5.number(),
      maxDoctors: z5.number(),
      maxDepartments: z5.number()
    }).optional()
  }),
  currentCounts: z5.object({
    doctors: z5.number(),
    patients: z5.number(),
    departments: z5.number()
  }).optional(),
  departments: z5.array(DepartmentResponseSchema),
  qualifications: z5.array(QualificationResponseSchema),
  specializations: z5.array(SpecializationResponseSchema),
  totalDepartments: z5.number(),
  currentPage: z5.number(),
  totalPages: z5.number()
});
var HospitalStatusUpdateResponseSchema = HospitalResponseSchema.extend({
  message: z5.string()
});
var CreateHospitalSchema = z5.object({
  hospitalName: z5.string(),
  email: z5.string().email(),
  password: z5.string().min(6),
  phone: z5.string(),
  address: z5.string(),
  since: z5.number().or(z5.string()),
  pincode: z5.string(),
  about: z5.string().optional(),
  logo: z5.string().optional(),
  licence: z5.string().optional(),
  subscription: z5.object({
    plan: z5.string(),
    amount: z5.number().optional(),
    status: z5.enum(["active", "expired", "cancelled"]).optional(),
    startDate: z5.union([z5.date(), z5.string()]).optional(),
    endDate: z5.union([z5.date(), z5.string()]).optional()
  }).optional()
});
var UpdateHospitalSchema = CreateHospitalSchema.partial().extend({
  isActive: z5.boolean().optional(),
  images: z5.any().optional()
});

// src/mappers/hospital.mapper.ts
import z6 from "zod";
var HospitalMapper = class {
  toDTO(hospital, limits, currentCounts) {
    const dto = {
      id: hospital._id.toString(),
      hospitalName: hospital.hospitalName,
      logo: hospital.logo ?? void 0,
      // Convert null to undefined
      address: hospital.address,
      isActive: hospital.isActive,
      autoDisabled: hospital.autoDisabled,
      email: hospital.email,
      phone: hospital.phone,
      since: hospital.since,
      pincode: hospital.pincode,
      about: hospital.about ?? void 0,
      licence: hospital.licence ?? void 0,
      images: {
        landscape: hospital.images?.landscape || [],
        medicalTeam: hospital.images?.medicalTeam || [],
        patientCare: hospital.images?.patientCare || [],
        services: hospital.images?.services || []
      },
      income: hospital.income || 0,
      reviewStatus: hospital.reviewStatus,
      // FIX: reapplyDate was null in your log. This converts it for Zod:
      reapplyDate: hospital.reapplyDate ?? void 0,
      rejectionReason: hospital.rejectionReason ?? void 0,
      subscription: {
        plan: hospital.subscription?.plan,
        amount: hospital.subscription?.amount || 0,
        status: hospital.subscription?.status || "active",
        startDate: hospital.subscription?.startDate ?? void 0,
        endDate: hospital.subscription?.endDate ?? void 0,
        limits
        // Ensure your Schema has .optional() for this
      },
      currentCounts,
      createdAt: hospital.createdAt,
      updatedAt: hospital.updatedAt
    };
    try {
      return HospitalResponseSchema.parse(dto);
    } catch (error) {
      console.error("Hospital Mapping Failed for:", hospital.hospitalName);
      if (error instanceof z6.ZodError) {
        console.error(error.format());
      }
      throw error;
    }
  }
};

// src/repositories/hospital/implementation/department.repository.ts
import { Types as Types4 } from "mongoose";
var DepartmentRepository = class extends BaseRepository {
  constructor(model6) {
    super(model6);
  }
  async findByHospitalId(hospitalId, page = 1, limit = 6, search = "") {
    const query = {
      hospital_id: new Types4.ObjectId(hospitalId),
      isActive: true
    };
    if (search) {
      query.$or = [
        { departmentName: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.model.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.model.countDocuments(query).exec()
    ]);
    return { data, total };
  }
};

// src/models/department.model.ts
import mongoose6, { Schema as Schema5 } from "mongoose";
var DepartmentSchema = new Schema5(
  {
    hospital_id: {
      type: Schema5.Types.ObjectId,
      ref: "Hospital",
      required: true
    },
    departmentName: {
      type: String,
      required: true,
      trim: true
    },
    image: {
      type: String
    },
    description: {
      type: String
    },
    doctors: [
      {
        type: Schema5.Types.ObjectId,
        ref: "Doctor"
      }
    ],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);
var department_model_default = mongoose6.model("Department", DepartmentSchema);

// src/repositories/hospital/implementation/qualification.repository.ts
var QualificationRepository = class extends BaseRepository {
  constructor(model6) {
    super(model6);
  }
  async findByHospitalId(hospitalId) {
    return await this.model.find({ hospital_id: hospitalId, isActive: true }).sort({ createdAt: -1 }).exec();
  }
};

// src/models/qualification.model.ts
import mongoose7, { Schema as Schema6 } from "mongoose";
var QualificationSchema = new Schema6(
  {
    hospital_id: {
      type: Schema6.Types.ObjectId,
      ref: "Hospital",
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    abbreviation: {
      type: String,
      trim: true
    },
    image: {
      type: String
    },
    description: {
      type: String
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);
var qualification_model_default = mongoose7.model(
  "Qualification",
  QualificationSchema
);

// src/models/specialization.model.ts
import mongoose8, { Schema as Schema7 } from "mongoose";
var SpecializationSchema = new Schema7(
  {
    hospital_id: {
      type: Schema7.Types.ObjectId,
      ref: "Hospital",
      required: true
    },
    department_id: {
      type: Schema7.Types.ObjectId,
      ref: "Department",
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String
    },
    image: {
      type: String
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);
var specialization_model_default = mongoose8.model(
  "Specialization",
  SpecializationSchema
);

// src/repositories/hospital/implementation/specialization.repository.ts
import { Types as Types8 } from "mongoose";
var SpecializationRepository = class extends BaseRepository {
  constructor() {
    super(specialization_model_default);
  }
  async findByHospitalId(hospitalId) {
    return this.model.find({ hospital_id: new Types8.ObjectId(hospitalId), isActive: true });
  }
  async findByDepartmentId(departmentId) {
    return this.model.find({ department_id: new Types8.ObjectId(departmentId), isActive: true });
  }
};

// src/repositories/appointment/appointment.repository.ts
import mongoose10, { Types as Types10 } from "mongoose";

// src/models/appointment.ts
import mongoose9, { Schema as Schema8 } from "mongoose";
var AppointmentStatus = /* @__PURE__ */ ((AppointmentStatus2) => {
  AppointmentStatus2["PENDING"] = "pending";
  AppointmentStatus2["COMPLETED"] = "completed";
  AppointmentStatus2["CANCELLED"] = "cancelled";
  AppointmentStatus2["PROCESSING"] = "processing";
  AppointmentStatus2["REJECTED"] = "rejected";
  return AppointmentStatus2;
})(AppointmentStatus || {});
var AppointmentMode = /* @__PURE__ */ ((AppointmentMode3) => {
  AppointmentMode3["ONLINE"] = "online";
  AppointmentMode3["OFFLINE"] = "offline";
  return AppointmentMode3;
})(AppointmentMode || {});
var appointmentSchema = new Schema8(
  {
    bookedBy: {
      type: Schema8.Types.ObjectId,
      ref: "Patient",
      required: true
    },
    doctorId: {
      type: Schema8.Types.ObjectId,
      ref: "Doctor",
      required: true
    },
    slotStartTime: { type: String, required: true },
    slotEndTime: { type: String, required: true },
    hospitalId: {
      type: Schema8.Types.ObjectId,
      ref: "Hospital",
      required: true
    },
    requsetRejectedReason: {
      type: String
    },
    cancelRequest: {
      type: Boolean,
      default: false
    },
    appointmentDate: {
      type: Date,
      required: true
    },
    paymentstatus: {
      type: String
    },
    tokenNumber: {
      type: Number,
      required: true
    },
    visitTime: {
      type: String
    },
    mode: {
      type: String,
      enum: Object.values(AppointmentMode),
      required: true
    },
    status: {
      type: String,
      enum: Object.values(AppointmentStatus),
      default: "pending" /* PENDING */
    },
    patientDetails: {
      name: { type: String, required: true },
      age: { type: Number, required: true },
      phone: { type: String, required: true },
      email: { type: String },
      address: { type: String }
    },
    rejectionReason: {
      type: String
    },
    cancelReason: {
      type: String
    },
    bloodPressure: {
      type: String
    },
    heartRate: {
      type: String
    },
    weight: {
      type: String
    },
    paymentId: {
      type: String
    },
    session: {
      type: String,
      enum: ["morning", "afternoon", "evening"]
    }
  },
  {
    timestamps: true
  }
);
var AppointmentModel = mongoose9.model(
  "Appointment",
  appointmentSchema
);

// src/repositories/appointment/appointment.repository.ts
var AppointmentRepository = class extends BaseRepository {
  constructor() {
    super(AppointmentModel);
  }
  async findByDoctorAndDate(doctorId, dateString) {
    const [year, month, day] = dateString.split("-").map(Number);
    const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    startOfDay.setHours(startOfDay.getHours() - 12);
    const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
    const query = {
      doctorId,
      appointmentDate: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: { $nin: ["cancelled"] }
    };
    const appointments = await this.model.find(query).sort({ session: 1, tokenNumber: 1 }).exec();
    return {
      appointments,
      total: appointments.length
    };
  }
  async findtodayconseltation(doctorId, dateString, options) {
    const [year, month, day] = dateString.split("-").map(Number);
    const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    startOfDay.setHours(startOfDay.getHours() - 12);
    const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
    const baseQuery = {
      doctorId,
      appointmentDate: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: { $nin: ["cancelled"] }
    };
    const query = { ...baseQuery };
    if (options?.shift) {
      query.session = options.shift;
    }
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 10;
    const skip = (page - 1) * limit;
    const total = await this.model.countDocuments(query);
    const appointments = await this.model.find(query).sort({ session: 1, tokenNumber: 1 }).skip(skip).limit(limit).exec();
    return {
      appointments,
      total
    };
  }
  async countByDoctorAndDate(doctorId, date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    startOfDay.setHours(startOfDay.getHours() - 12);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    return await this.model.countDocuments({
      doctorId,
      appointmentDate: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: { $nin: ["cancelled" /* CANCELLED */] }
    }).exec();
  }
  async findUpcomingAppointments(doctorId, options) {
    const { page, limit, search, date } = options;
    const skip = (page - 1) * limit;
    if (!mongoose10.Types.ObjectId.isValid(doctorId)) {
      throw new Error("Invalid doctorId");
    }
    const ObjectDoctorId = new mongoose10.Types.ObjectId(doctorId);
    const query = {
      doctorId: ObjectDoctorId,
      status: { $nin: ["completed" /* COMPLETED */] }
    };
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      query.appointmentDate = {
        $gte: startOfDay,
        $lte: endOfDay
      };
    } else {
      const today = /* @__PURE__ */ new Date();
      today.setHours(0, 0, 0, 0);
      query.appointmentDate = { $gte: today };
    }
    if (search && search.trim()) {
      query.$or = [
        { "patientDetails.name": { $regex: search, $options: "i" } },
        { "patientDetails.phone": { $regex: search, $options: "i" } }
      ];
    }
    const [appointments, total] = await Promise.all([
      this.model.find(query).populate("bookedBy", "name email image").sort({ appointmentDate: 1, visitTime: 1 }).skip(skip).limit(limit).exec(),
      this.model.countDocuments(query).exec()
    ]);
    return { appointments, total };
  }
  async findDuplicate(doctorId, date, patient, session) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    startOfDay.setHours(startOfDay.getHours() - 12);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    return await this.model.findOne({
      doctorId,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      "patientDetails.name": patient.name,
      "patientDetails.age": patient.age,
      "patientDetails.email": patient.email,
      status: { $ne: "cancelled" }
    }).session(session ?? null);
  }
  async findPatientAppointments(patientId, options) {
    const { page, limit, search } = options;
    const skip = (page - 1) * limit;
    const query = {
      bookedBy: new Types10.ObjectId(patientId)
    };
    if (search) {
      const doctors = await mongoose10.model("Doctor").find({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { specialization: { $regex: search, $options: "i" } },
          { department: { $regex: search, $options: "i" } }
        ]
      }).select("_id");
      const doctorIds = doctors.map((d) => d._id);
      query.doctorId = { $in: doctorIds };
    }
    const [appointments, total] = await Promise.all([
      this.model.find(query).populate("doctorId", "name specialization department profileImage").sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.model.countDocuments(query).exec()
    ]);
    return { appointments, total };
  }
  async findLiveToken(doctorId) {
    const today = /* @__PURE__ */ new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    startOfDay.setHours(startOfDay.getHours() - 12);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    return await this.model.findOne({
      doctorId,
      appointmentDate: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: "pending" /* PENDING */
    }).sort({ tokenNumber: 1 }).exec();
  }
  async findDoctorByPatientToday(patientId) {
    const today = /* @__PURE__ */ new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    startOfDay.setHours(startOfDay.getHours() - 12);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    const appointment = await this.model.findOne({
      bookedBy: new Types10.ObjectId(patientId),
      appointmentDate: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: { $nin: ["cancelled" /* CANCELLED */] }
    }).select("doctorId").exec();
    return appointment ? appointment.doctorId.toString() : null;
  }
  async findPatientAppointmentsToday(patientId, dateString) {
    let startOfDay;
    let endOfDay;
    if (dateString) {
      const [year, month, day] = dateString.split("-").map(Number);
      startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
      startOfDay.setHours(startOfDay.getHours() - 12);
      endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
    } else {
      const today = /* @__PURE__ */ new Date();
      startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);
      startOfDay.setHours(startOfDay.getHours() - 12);
      endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);
    }
    return await this.model.find({
      bookedBy: new Types10.ObjectId(patientId),
      appointmentDate: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: { $nin: ["cancelled" /* CANCELLED */] }
    }).populate("doctorId", "name specialization department profileImage").sort({ tokenNumber: 1 }).exec();
  }
  async findByPaymentId(paymentId) {
    return await this.model.findOne({ paymentId }).exec();
  }
  getPatientEmail(appointmentId) {
    return this.model.findById(appointmentId).select("patientDetails.email").exec().then(
      (appointment) => appointment ? appointment.patientDetails.email || null : null
    );
  }
  async countByDoctorDateAndSession(doctorId, date, session, mongoSession) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    startOfDay.setHours(startOfDay.getHours() - 12);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    return await this.model.countDocuments({
      doctorId,
      appointmentDate: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      session,
      status: { $nin: ["cancelled" /* CANCELLED */] }
    }).session(mongoSession ?? null).exec();
  }
};

// src/controllers/doctor/appointment.controller.ts
var AppointmentController = class {
  constructor(_appointmentService) {
    this._appointmentService = _appointmentService;
    this.getUpcomingAppointments = async (req, res, next) => {
      try {
        const user = req.user;
        const doctorId = user?.doctorID || user?.userId;
        if (!doctorId) {
          return ApiResponse.throwError(401 /* UNAUTHORIZED */, "Unauthorized");
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const search = req.query.search || "";
        const date = req.query.date;
        const { appointments, total } = await this._appointmentService.getUpcomingAppointments(doctorId, {
          page,
          limit,
          search,
          date
        });
        logger_default.debug(`Fetching upcoming appointments for date: ${date}`);
        return ApiResponse.success(res, "Upcoming appointments fetched successfully", appointments, 200 /* OK */, {
          page,
          limit,
          totalItems: total,
          totalPages: Math.ceil(total / limit)
        });
      } catch (error) {
        next(error);
      }
    };
  }
};

// src/services/doctor/implementations/appointment.service.ts
var AppointmentService = class {
  constructor(_appointmentRepo, _appointmentMapper, _prescriptionRepo, _HospitalDoctorConfigRepo, _WalletRepo, prescriptionMapper) {
    this._appointmentRepo = _appointmentRepo;
    this._appointmentMapper = _appointmentMapper;
    this._prescriptionRepo = _prescriptionRepo;
    this._HospitalDoctorConfigRepo = _HospitalDoctorConfigRepo;
    this._WalletRepo = _WalletRepo;
    this.prescriptionMapper = prescriptionMapper;
  }
  async getUpcomingAppointments(doctorId, options) {
    const { page, limit, search, date } = options;
    const res = await this._appointmentRepo.findUpcomingAppointments(doctorId, {
      page,
      limit,
      search,
      date: date ? new Date(date) : void 0
    });
    return {
      appointments: res.appointments.map((app2) => this._appointmentMapper.toDTO(app2)),
      total: res.total
    };
  }
  async getTodayConsultations(doctorId, options) {
    const today = /* @__PURE__ */ new Date();
    const dateString = today.toISOString().split("T")[0];
    const res = await this._appointmentRepo.findtodayconseltation(
      doctorId,
      dateString,
      options
    );
    return {
      appointments: res.appointments.map((app2) => this._appointmentMapper.toDTO(app2)),
      total: res.total
    };
  }
  async updateStatus(appointmentId, status) {
    const appointment = await this._appointmentRepo.findById(appointmentId);
    if (!appointment) {
      throw new Error("Appointment not found");
    }
    const config = await this._HospitalDoctorConfigRepo.findOne({
      doctorId: appointment.doctorId,
      hospitalId: appointment.hospitalId
    });
    if (!config) {
      throw new Error("Config not found");
    }
    const doctorAmount = config.doctorFee;
    const hospitalAmount = doctorAmount * config.hospitalCommission / 100;
    const findDoctrorWallet = await this._WalletRepo.findOne({
      ownerId: appointment.doctorId
    });
    if (!findDoctrorWallet) {
      await this._WalletRepo.create({
        ownerId: appointment.doctorId
      });
    }
    const findHospitalWallet = await this._WalletRepo.findOne({
      ownerId: appointment.hospitalId
    });
    if (!findHospitalWallet) {
      await this._WalletRepo.create({
        ownerId: appointment.hospitalId
      });
    }
    if (appointment.paymentstatus === "pending") {
      await this._WalletRepo.creditWallet(
        appointment.doctorId.toString(),
        doctorAmount
      );
      await this._WalletRepo.creditWallet(
        appointment.hospitalId.toString(),
        hospitalAmount
      );
    } else {
      await this._WalletRepo.debitWallet(
        appointment.hospitalId.toString(),
        doctorAmount
      );
      await this._WalletRepo.creditWallet(
        appointment.doctorId.toString(),
        doctorAmount
      );
    }
    const updated = await this._appointmentRepo.update(
      appointmentId,
      { status }
    );
    return updated ? this._appointmentMapper.toDTO(updated) : null;
  }
  async savePrescription(appointmentId, prescriptionData) {
    const appointment = await this._appointmentRepo.findById(appointmentId);
    if (!appointment) return null;
    if (!appointment.patientDetails.email) {
      throw new Error("Patient email is required");
    }
    const doctorId = typeof appointment.doctorId === "object" ? appointment.doctorId._id : appointment.doctorId;
    const prescriptionPayload = {
      hospital_id: appointment.hospitalId,
      patient_email: appointment.patientDetails.email,
      doctor_id: doctorId,
      appointment_id: appointment._id,
      medicines: prescriptionData.medicines,
      notes: prescriptionData.notes
    };
    const prescription = await this._prescriptionRepo.create(prescriptionPayload);
    if (!prescription) {
      throw new Error("Failed to save prescription");
    }
    const prescriptionDTO = this.prescriptionMapper.toDTO(prescription);
    return prescriptionDTO;
  }
};

// src/repositories/leave/leave.repository.ts
import { Types as Types12 } from "mongoose";

// src/models/doctorLeave.model.ts
import { Schema as Schema9, model as model2 } from "mongoose";
var doctorLeaveSchema = new Schema9(
  {
    doctorId: {
      type: Schema9.Types.ObjectId,
      ref: "Doctor",
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    leaveSession: {
      type: String,
      enum: ["morning", "afternoon", "evening", "night"]
    },
    reason: {
      type: String
    },
    rejectedReson: {
      type: String
    },
    photo: {
      type: String
    },
    status: {
      type: String,
      enum: ["approved", "pending", "rejected"],
      default: "pending"
    }
  },
  { timestamps: true }
);
var doctorLeave_model_default = model2("DoctorLeave", doctorLeaveSchema);

// src/repositories/leave/leave.repository.ts
var LeaveRepository = class extends BaseRepository {
  constructor() {
    super(doctorLeave_model_default);
  }
  async findDoctorLeaves(options) {
    const { doctorId, page, limit, startDate, endDate } = options;
    const skip = (page - 1) * limit;
    const filter = {
      doctorId: new Types12.ObjectId(doctorId)
    };
    if (startDate) {
      const startOfDay = new Date(startDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = endDate ? new Date(endDate) : new Date(startDate);
      endOfDay.setHours(23, 59, 59, 999);
      filter.$and = [
        { startDate: { $lte: endOfDay } },
        { endDate: { $gte: startOfDay } }
      ];
    }
    const [data, total] = await Promise.all([
      this.model.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.model.countDocuments(filter).exec()
    ]);
    return { data, total, page, limit };
  }
  async findHospitalLeaves(options) {
    const { hospitalId, page, limit, search, date } = options;
    const skip = (page - 1) * limit;
    const doctorFilter = { hospital_id: new Types12.ObjectId(hospitalId) };
    if (search) {
      doctorFilter.name = { $regex: search, $options: "i" };
    }
    const doctors = await DoctorModel.find(doctorFilter).select("_id").exec();
    const doctorIds = doctors.map((d) => d._id);
    const leaveFilter = { doctorId: { $in: doctorIds } };
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      leaveFilter.$and = [
        { startDate: { $lte: endOfDay } },
        { endDate: { $gte: startOfDay } }
      ];
    }
    const [data, total] = await Promise.all([
      this.model.find(leaveFilter).populate("doctorId", "name email profileImage specialization department").sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.model.countDocuments(leaveFilter).exec()
    ]);
    return { data, total, page, limit };
  }
  async updateStatus(id, status, rejectedReason) {
    const update = { status };
    if (status === "rejected" && rejectedReason) {
      update.rejectedReson = rejectedReason;
    }
    return await this.model.findByIdAndUpdate(id, update, { new: true }).exec();
  }
};

// src/dto/appointment/appointment-response.dto.ts
import { z as z7 } from "zod";
var AppointmentResponseSchema = z7.object({
  id: z7.string(),
  patientName: z7.string(),
  patientAge: z7.number(),
  patientPhone: z7.string(),
  patientEmail: z7.string().optional().nullable(),
  patientAddress: z7.string().optional().nullable(),
  patientImage: z7.string().optional().nullable(),
  appointmentDate: z7.string(),
  visitTime: z7.string().optional().nullable(),
  status: z7.nativeEnum(AppointmentStatus),
  mode: z7.nativeEnum(AppointmentMode),
  // Doctor Details - Added these fields
  doctorId: z7.string(),
  doctorName: z7.string().optional(),
  doctorProfileImage: z7.string().optional().nullable(),
  doctorSpecialization: z7.string().optional(),
  doctorDepartment: z7.string().optional(),
  tokenNumber: z7.number(),
  prescription: z7.object({
    medicines: z7.array(z7.object({
      name: z7.string(),
      dosage: z7.string(),
      duration: z7.string()
    })),
    notes: z7.string().optional(),
    prescribedAt: z7.string().optional()
  }).optional(),
  bloodPressure: z7.string().optional(),
  heartRate: z7.string().optional(),
  weight: z7.string().optional(),
  cancelReason: z7.string().optional().nullable(),
  session: z7.enum(["morning", "afternoon", "evening"]).optional().nullable(),
  createdAt: z7.string(),
  updatedAt: z7.string(),
  rejectionReason: z7.string().optional().nullable()
});

// src/mappers/appointment.mapper.ts
var AppointmentMapper = class {
  toDTO(appointment) {
    const doc = appointment.doctorId;
    const patient = appointment.bookedBy;
    const dto = {
      id: appointment._id.toString(),
      patientName: appointment.patientDetails.name,
      patientAge: appointment.patientDetails.age,
      patientPhone: appointment.patientDetails.phone,
      patientEmail: appointment.patientDetails.email || null,
      patientAddress: appointment.patientDetails.address || null,
      patientImage: patient?.image || null,
      doctorId: doc?._id ? doc._id.toString() : appointment.doctorId?.toString() || "",
      doctorName: doc?.name || "Unknown Doctor",
      doctorProfileImage: doc?.profileImage || null,
      doctorSpecialization: doc?.specialization || "General Medicine",
      doctorDepartment: doc?.department || "General",
      appointmentDate: appointment.appointmentDate instanceof Date ? appointment.appointmentDate.toISOString() : new Date(appointment.appointmentDate).toISOString(),
      visitTime: appointment.visitTime || null,
      status: appointment.status,
      mode: appointment.mode,
      tokenNumber: appointment.tokenNumber,
      rejectionReason: appointment?.rejectionReason,
      bloodPressure: appointment.bloodPressure,
      heartRate: appointment.heartRate,
      weight: appointment.weight,
      cancelReason: appointment.cancelReason || null,
      session: appointment.session || null,
      createdAt: appointment.createdAt instanceof Date ? appointment.createdAt.toISOString() : new Date(appointment.createdAt).toISOString(),
      updatedAt: appointment.updatedAt instanceof Date ? appointment.updatedAt.toISOString() : new Date(appointment.updatedAt).toISOString()
    };
    return AppointmentResponseSchema.parse(dto);
  }
};

// src/controllers/doctor/consultation.controller.ts
var Consultation = class {
  constructor(_appointmentService) {
    this._appointmentService = _appointmentService;
    this.getConsultation = async (req, res) => {
      try {
        const userId = req.user?.userId;
        if (!userId) {
          return ApiResponse.unauthorized(res, "Doctor not authenticated");
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const shift = req.query.shift;
        const { appointments, total } = await this._appointmentService.getTodayConsultations(userId, { page, limit, shift });
        return ApiResponse.success(
          res,
          "Consultations fetched successfully",
          { appointments, total },
          200 /* OK */
        );
      } catch (error) {
        logger_default.error("Error in getConsultation:", error);
        return ApiResponse.error(res, "Failed to fetch consultations");
      }
    };
    this.markAsCompleted = async (req, res) => {
      try {
        const { id } = req.params;
        const updated = await this._appointmentService.updateStatus(id, "completed" /* COMPLETED */);
        if (!updated) {
          return ApiResponse.error(res, "Failed to update appointment status");
        }
        return ApiResponse.success(
          res,
          "Appointment marked as completed successfully",
          updated,
          200 /* OK */
        );
      } catch (error) {
        logger_default.error("Error in markAsCompleted:", error);
        return ApiResponse.error(res, "Failed to mark appointment as completed");
      }
    };
    this.prescription = async (req, res) => {
      try {
        const { appointmentId, medicines, notes } = req.body;
        if (!appointmentId) {
          return ApiResponse.error(res, "Appointment ID is required");
        }
        const updated = await this._appointmentService.savePrescription(appointmentId, {
          medicines,
          notes
        });
        if (!updated) {
          return ApiResponse.error(res, "Failed to save prescription");
        }
        return ApiResponse.success(
          res,
          "Prescription saved successfully",
          updated,
          200 /* OK */
        );
      } catch (error) {
        logger_default.error("Error in savePrescription:", error);
        return ApiResponse.error(res, "Failed to save prescription");
      }
    };
  }
};

// src/mappers/doctor-leave.mapper.ts
import { Types as Types13 } from "mongoose";

// src/dto/doctor/doctor-leave-response.dto.ts
import { z as z8 } from "zod";
var DoctorLeaveResponseSchema = z8.object({
  id: z8.string(),
  doctorId: z8.union([
    z8.string(),
    z8.object({
      _id: z8.string(),
      name: z8.string(),
      email: z8.string(),
      profileImage: z8.string(),
      specialization: z8.string().optional(),
      department: z8.string().optional()
    })
  ]),
  startDate: z8.union([z8.date(), z8.string()]),
  endDate: z8.union([z8.date(), z8.string()]),
  leaveSession: z8.enum(["morning", "afternoon", "evening", "night"]).optional(),
  reason: z8.string().optional(),
  photo: z8.string().optional(),
  rejectedReson: z8.string().optional(),
  status: z8.enum(["approved", "pending", "rejected"]),
  createdAt: z8.union([z8.date(), z8.string()]),
  updatedAt: z8.union([z8.date(), z8.string()])
});

// src/mappers/doctor-leave.mapper.ts
var DoctorLeaveMapper = class {
  toDTO(leave) {
    const dto = {
      id: leave._id.toString(),
      doctorId: leave.doctorId instanceof Types13.ObjectId ? leave.doctorId.toString() : {
        _id: leave.doctorId._id.toString(),
        name: leave.doctorId.name,
        email: leave.doctorId.email,
        profileImage: leave.doctorId.profileImage,
        specialization: leave.doctorId.specialization,
        department: leave.doctorId.department
      },
      startDate: leave.startDate,
      endDate: leave.endDate,
      leaveSession: leave.leaveSession,
      reason: leave.reason,
      photo: leave.photo,
      rejectedReson: leave.rejectedReson,
      status: leave.status,
      createdAt: leave.createdAt,
      updatedAt: leave.updatedAt
    };
    return DoctorLeaveResponseSchema.parse(dto);
  }
};

// src/models/prescription.model.ts
import mongoose11, { Schema as Schema10 } from "mongoose";
var MedicineSchema = new Schema10(
  {
    name: { type: String, required: true },
    dosage: { type: String, required: true },
    duration: { type: String, required: true }
  }
);
var PrescriptionSchema = new Schema10(
  {
    hospital_id: { type: Schema10.Types.ObjectId, ref: "Hospital", required: true },
    patient_email: { type: String, required: true },
    doctor_id: { type: Schema10.Types.ObjectId, ref: "Doctor", required: true },
    appointment_id: { type: Schema10.Types.ObjectId },
    medicines: { type: [MedicineSchema], required: true },
    notes: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  }
);
var prescription_model_default = mongoose11.model("Prescription", PrescriptionSchema);

// src/dto/hospital/department-response.dto.ts
import { z as z9 } from "zod";
var DepartmentResponseSchema2 = z9.object({
  id: z9.string(),
  departmentName: z9.string(),
  description: z9.string().optional(),
  image: z9.string().optional(),
  isActive: z9.boolean()
});

// src/mappers/department.mapper.ts
var DepartmentMapper = class {
  toDTO(department) {
    const dto = {
      id: department._id.toString(),
      departmentName: department.departmentName,
      description: department.description,
      image: department.image,
      isActive: department.isActive
    };
    return DepartmentResponseSchema2.parse(dto);
  }
};

// src/dto/hospital/qualification-response.dto.ts
import { z as z10 } from "zod";
var QualificationResponseSchema2 = z10.object({
  id: z10.string(),
  name: z10.string(),
  abbreviation: z10.string().optional(),
  description: z10.string().optional(),
  image: z10.string().optional(),
  isActive: z10.boolean()
});

// src/mappers/qualification.mapper.ts
var QualificationMapper = class {
  toDTO(qualification) {
    const dto = {
      id: qualification._id.toString(),
      name: qualification.name,
      abbreviation: qualification.abbreviation ?? "",
      description: qualification.description ?? "",
      image: qualification.image ?? "",
      isActive: qualification.isActive
    };
    return QualificationResponseSchema2.parse(dto);
  }
};

// src/dto/hospital/specialization-response.dto.ts
import { z as z11 } from "zod";
var SpecializationResponseSchema2 = z11.object({
  id: z11.string(),
  name: z11.string(),
  department_id: z11.string(),
  description: z11.string().optional(),
  image: z11.string().optional(),
  isActive: z11.boolean()
});

// src/mappers/specialization.mapper.ts
var SpecializationMapper = class {
  toDTO(specialization) {
    const dto = {
      id: specialization._id.toString(),
      name: specialization.name,
      department_id: specialization.department_id.toString(),
      description: specialization.description,
      image: specialization.image,
      isActive: specialization.isActive
    };
    return SpecializationResponseSchema2.parse(dto);
  }
};

// src/repositories/Prescription/prescription.repository.ts
var PrescriptionRepository = class extends BaseRepository {
  constructor(model6) {
    super(model6);
  }
  async findPrescriptionsPaginated(options) {
    const { email, page, limit, search } = options;
    let filter = { patient_email: email };
    if (search) {
      const [doctorIds, hospitalIds] = await Promise.all([
        DoctorModel.find({ name: { $regex: search, $options: "i" } }).distinct(
          "_id"
        ),
        HospitalModel.find({
          hospitalName: { $regex: search, $options: "i" }
        }).distinct("_id")
      ]);
      filter = {
        ...filter,
        $or: [
          { doctor_id: { $in: doctorIds } },
          { hospital_id: { $in: hospitalIds } }
        ]
      };
    }
    const total = await this.model.countDocuments(filter);
    const data = await this.model.find(filter).populate("doctor_id").populate("hospital_id").skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 }).exec();
    return {
      data,
      total,
      page,
      limit
    };
  }
};

// src/controllers/doctor/DoctorSlotManagement.controller.ts
var DoctorSlotManagementController = class {
  constructor(slotservice) {
    this.slotservice = slotservice;
    this.createDoctorSchedule = async (req, res, next) => {
      try {
        const doctorId = req.user?.doctorID || req.user?.userId;
        if (!doctorId) {
          return ApiResponse.unauthorized(res, "Doctor ID not found in token");
        }
        const scheduleData = {
          ...req.body,
          doctorId
        };
        await this.slotservice.createSchedule(scheduleData);
        return ApiResponse.created(res, "Recurring schedule created successfully");
      } catch (error) {
        next(error);
      }
    };
    this.getDoctorSchedules = async (req, res, next) => {
      try {
        const doctorId = req.user?.doctorID || req.user?.userId;
        if (!doctorId) {
          return ApiResponse.unauthorized(res);
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const result = await this.slotservice.getSchedules(doctorId, page, limit);
        return ApiResponse.success(
          res,
          "Schedules fetched successfully",
          result.data,
          void 0,
          {
            totalItems: result.total,
            totalPages: Math.ceil(result.total / limit),
            currentPage: page,
            limit
          }
        );
      } catch (error) {
        next(error);
      }
    };
    this.updateDoctorSchedule = async (req, res, next) => {
      try {
        const doctorId = req.user?.doctorID || req.user?.userId;
        if (!doctorId) {
          return ApiResponse.unauthorized(res, "Doctor ID not found in token");
        }
        const { id } = req.params;
        const scheduleData = {
          ...req.body,
          doctorId
        };
        await this.slotservice.updateSchedule(id, scheduleData);
        return ApiResponse.success(res, "Recurring schedule updated successfully");
      } catch (error) {
        next(error);
      }
    };
    this.deleteDoctorSchedule = async (req, res, next) => {
      try {
        const { id } = req.params;
        const doctorId = req.user?.doctorID || req.user?.userId;
        const { status } = req.body;
        if (!doctorId) {
          return ApiResponse.unauthorized(res);
        }
        await this.slotservice.deleteSchedule(id, doctorId, status);
        return ApiResponse.success(res, "Schedule deleted successfully");
      } catch (error) {
        next(error);
      }
    };
  }
};

// src/services/doctor/implementations/SlotManagement.service.ts
import mongoose12 from "mongoose";
var SlotMangementService = class {
  constructor(_slotrepo, _slotmapper, _appointementrepo) {
    this._slotrepo = _slotrepo;
    this._slotmapper = _slotmapper;
    this._appointementrepo = _appointementrepo;
  }
  async createSchedule(data) {
    if (!data.doctorId || !data.daysOfWeek?.length || !data.session) {
      ApiResponse.throwError(400 /* BAD_REQUEST */, "Missing required fields");
    }
    const existingSchedule = await this._slotrepo.findExistingSchedule(data.doctorId, data.daysOfWeek, data.session);
    if (existingSchedule) {
      const cheack = existingSchedule.includes(data.session);
      if (existingSchedule.length > 0 && cheack) {
        ApiResponse.throwError(
          409 /* CONFLICT */,
          `Schedule already created for the selected days and session on ${existingSchedule.join(",")}`
        );
      }
    }
    const [startH, startM] = data.startTime.split(":").map(Number);
    const [endH, endM] = data.endTime.split(":").map(Number);
    const startTotal = startH * 60 + startM;
    const endTotal = endH * 60 + endM;
    const totalMinutes = endTotal - startTotal;
    if (totalMinutes <= 0) {
      ApiResponse.throwError(400 /* BAD_REQUEST */, "Invalid time range");
    }
    const tokenPerDay = Math.floor(totalMinutes / data.slotDuration);
    const payload = {
      ...data,
      tokenPerDay,
      isActive: false,
      doctorId: new mongoose12.Types.ObjectId(data.doctorId)
    };
    await this._slotrepo.create(payload);
  }
  async getSchedules(doctorId, page = 1, limit = 10) {
    const result = await this._slotrepo.findWithPagination({
      page,
      limit,
      filter: {
        doctorId: new mongoose12.Types.ObjectId(doctorId)
      }
    });
    const mappedData = result.data.map(
      (slot) => this._slotmapper.toDTO(slot)
    );
    return {
      data: mappedData,
      total: result.total
    };
  }
  async updateSchedule(scheduleId, data) {
    if (!data.doctorId || !data.daysOfWeek?.length || !data.session) {
      ApiResponse.throwError(400 /* BAD_REQUEST */, "Missing required fields");
    }
    const [startH, startM] = data.startTime.split(":").map(Number);
    const [endH, endM] = data.endTime.split(":").map(Number);
    const startTotal = startH * 60 + startM;
    const endTotal = endH * 60 + endM;
    const totalMinutes = endTotal - startTotal;
    if (totalMinutes <= 0) {
      ApiResponse.throwError(400 /* BAD_REQUEST */, "Invalid time range");
    }
    const tokenPerDay = Math.floor(totalMinutes / data.slotDuration);
    const payload = {
      ...data,
      doctorId: new mongoose12.Types.ObjectId(data.doctorId),
      tokenPerDay
    };
    const updated = await this._slotrepo.update(scheduleId, payload);
    if (!updated) {
      throw new Error("Update failed");
    }
  }
  async deleteSchedule(scheduleId, doctorId, status) {
    const isActive = !status;
    if (!isActive) {
      const schedule = await this._slotrepo.findById(scheduleId);
      if (schedule) {
        const { appointments } = await this._appointementrepo.findUpcomingAppointments(doctorId, { page: 1, limit: 1e3 });
        const hasExistingAppointments = appointments.some((app2) => {
          const appDay = new Date(app2.appointmentDate).getUTCDay();
          return app2.session === schedule.session && schedule.daysOfWeek.includes(appDay) && app2.status !== "cancelled" && app2.status !== "completed";
        });
        if (hasExistingAppointments) {
          ApiResponse.throwError(400 /* BAD_REQUEST */, "Cannot deactivate schedule with existing appointments");
        }
      }
    }
    const updated = await this._slotrepo.update(scheduleId, {
      isActive
    });
    if (!updated) {
      throw new Error("Update failed");
    }
  }
};

// src/dto/doctor/slot-response.dto.ts
import { z as z12 } from "zod";
var SlotResponseSchema = z12.object({
  id: z12.string(),
  session: z12.enum(["morning", "afternoon", "evening"]),
  daysOfWeek: z12.array(z12.number()),
  startTime: z12.string(),
  endTime: z12.string(),
  slotDuration: z12.number(),
  tokenPerDay: z12.number(),
  isActive: z12.boolean()
});

// src/mappers/slot.mapper.ts
var SlotMapper = class {
  toDTO(slot) {
    const dto = {
      id: slot._id.toString(),
      session: slot.session,
      daysOfWeek: slot.daysOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
      slotDuration: slot.slotDuration,
      tokenPerDay: slot.tokenPerDay,
      isActive: slot.isActive
    };
    return SlotResponseSchema.parse(dto);
  }
  toDTOList(slots) {
    return slots.map((slot) => this.toDTO(slot));
  }
};

// src/repositories/slot/slot.repository.ts
import mongoose13 from "mongoose";
var SlotRepository = class extends BaseRepository {
  constructor(model6) {
    super(model6);
  }
  async findByDoctorId(doctorId) {
    return await this.model.find({ doctorId, isActive: true }).exec();
  }
  async findExistingSchedule(doctorId, daysOfWeek) {
    const result = await this.model.aggregate([
      {
        $match: {
          doctorId: new mongoose13.Types.ObjectId(doctorId),
          daysOfWeek: { $in: daysOfWeek }
        }
      },
      { $project: { _id: 0, session: 1 } }
    ]);
    const sessions = result.map((item) => item.session);
    return sessions;
  }
};

// src/models/DoctorSlot.ts
import { Schema as Schema11, model as model3 } from "mongoose";
var doctorScheduleSchema = new Schema11(
  {
    doctorId: {
      type: Schema11.Types.ObjectId,
      ref: "Doctor",
      required: true
    },
    daysOfWeek: {
      type: [Number],
      required: true,
      validate: {
        validator: (v) => v.every((d) => d >= 0 && d <= 6),
        message: "Days must be between 0 (Sunday) and 6 (Saturday)"
      }
    },
    tokenPerDay: {
      type: Number,
      required: true,
      min: 1
    },
    session: {
      type: String,
      enum: ["morning", "afternoon", "evening"],
      required: true
    },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    slotDuration: { type: Number, required: true, min: 5 },
    validFrom: { type: Date, default: Date.now },
    validUntil: { type: Date, default: null },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);
var DoctorScheduleModel = model3(
  "DoctorSchedule",
  doctorScheduleSchema
);

// src/services/doctor/implementations/doctorDashbord.service.ts
import { Types as Types16 } from "mongoose";
var DoctorDashboardService = class {
  constructor(_repository, _doctorRepo, _walletRepo) {
    this._repository = _repository;
    this._doctorRepo = _doctorRepo;
    this._walletRepo = _walletRepo;
  }
  async salaryincreserequest(data) {
    const payload = {
      doctorId: new Types16.ObjectId(data.doctorId),
      hospitalId: new Types16.ObjectId(data.hospitalId),
      currentAmount: Number(data.currentSalary),
      requestedAmount: Number(data.requestedSalary),
      reason: data.reason
    };
    const dublicate = await this._repository.findDoctorId(payload.doctorId, payload.hospitalId);
    if (dublicate) {
      throw new AppError("Under review, please wait", 409 /* CONFLICT */);
    }
    const res = await this._repository.create(payload);
    return res !== null;
  }
  async getsalaryincreserequest(doctorId) {
    const result = await this._repository.findLatestByDoctorId(new Types16.ObjectId(doctorId));
    return result;
  }
  async getwallet(doctorId) {
    const doctor = await this._walletRepo.findByFilter({
      ownerId: new Types16.ObjectId(doctorId)
    });
    if (!doctor || doctor.length === 0) {
      throw new AppError("Doctor not found", 404 /* NOT_FOUND */);
    }
    return {
      balance: doctor[0].balance,
      totalenrnings: doctor[0].totalearnings || 0,
      totalwithdrawn: doctor[0].totalwithdrawn || 0,
      Transaction: (doctor[0].Transaction || []).map((tx) => ({
        amount: tx.amount,
        type: tx.type,
        date: tx.date.toISOString()
      }))
    };
  }
  async withdraw(doctorId, amount) {
    const doctor = await this._walletRepo.findByFilter({
      ownerId: new Types16.ObjectId(doctorId)
    });
    if (!doctor || doctor.length === 0) {
      throw new AppError("Doctor not found", 404 /* NOT_FOUND */);
    }
    const wallet = doctor[0];
    if (wallet.balance < amount) {
      throw new AppError("Insufficient balance", 400 /* BAD_REQUEST */);
    }
    wallet.balance -= amount;
    wallet.totalwithdrawn = (wallet.totalwithdrawn || 0) + amount;
    wallet.Transaction = wallet.Transaction || [];
    wallet.Transaction.push({
      amount,
      type: "debit",
      date: /* @__PURE__ */ new Date()
    });
    await wallet.save();
    return true;
  }
};

// src/repositories/salaryhike/salaryhike.repository.ts
import mongoose14, { Types as Types17 } from "mongoose";
var SalaryrequestRepository = class extends BaseRepository {
  async findDoctorId(doctorId, hospitalId) {
    const existing = await this.model.findOne({
      doctorId,
      hospitalId,
      status: { $nin: ["APPROVED", "REJECTED"] }
    });
    return !!existing;
  }
  async findDoctorSalaryRequests(filter) {
    const query = {
      hospitalId: new Types17.ObjectId(filter.hospital_id)
    };
    if (filter.status && filter.status.toUpperCase() !== "ALL") {
      query.status = filter.status.toUpperCase();
    }
    if (filter.search) {
      const doctors = await mongoose14.model("Doctor").find({
        name: { $regex: filter.search, $options: "i" }
      }).select("_id");
      query.doctorId = { $in: doctors.map((d) => d._id) };
    }
    const skip = (filter.page - 1) * filter.limit;
    const totalItems = await this.model.countDocuments(query);
    const salaryRequests = await this.model.find(query).populate("doctorId").skip(skip).limit(filter.limit).sort({ createdAt: -1 });
    return { salaryRequests, totalItems };
  }
  async updateSalaryRequestStatus(id, status, data) {
    const update = { status };
    if (status === "APPROVED") {
      update.approvedAmount = data.approvedAmount;
      update.approvalNote = data.note;
    } else {
      update.rejectionReason = data.note;
    }
    return await this.model.findByIdAndUpdate(id, update, { new: true }).populate("doctorId");
  }
  async findLatestByDoctorId(doctorId) {
    return await this.model.findOne({ doctorId }).sort({ createdAt: -1 });
  }
};

// src/models/SalaryRequest.model.ts
import { Schema as Schema12, model as model4 } from "mongoose";
var SalaryRequestStatus = /* @__PURE__ */ ((SalaryRequestStatus2) => {
  SalaryRequestStatus2["PENDING"] = "PENDING";
  SalaryRequestStatus2["APPROVED"] = "APPROVED";
  SalaryRequestStatus2["REJECTED"] = "REJECTED";
  return SalaryRequestStatus2;
})(SalaryRequestStatus || {});
var salaryRequestSchema = new Schema12(
  {
    doctorId: {
      type: Schema12.Types.ObjectId,
      ref: "Doctor"
    },
    hospitalId: {
      type: Schema12.Types.ObjectId,
      ref: "Hospital",
      required: true
    },
    currentAmount: {
      type: Number,
      required: true
    },
    requestedAmount: {
      type: Number,
      required: true
    },
    reason: {
      type: String,
      required: true,
      trim: true
    },
    rejectionReason: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: Object.values(SalaryRequestStatus),
      default: "PENDING" /* PENDING */
    },
    approvedAmount: {
      type: Number
    },
    approvalNote: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);
var SalaryRequestModel = model4(
  "SalaryRequest",
  salaryRequestSchema
);

// src/controllers/doctor/doctorDashboard.controller.ts
var DoctorDashboard = class {
  constructor(_service) {
    this._service = _service;
    this.SALARY_INCREASE_REQUEST = async (req, res) => {
      try {
        const result = await this._service.salaryincreserequest(req.body);
        return ApiResponse.success(
          res,
          "Request successfully added",
          result,
          200 /* OK */
        );
      } catch (error) {
        if (error instanceof AppError) {
          return ApiResponse.error(res, error.message, error);
        }
        return ApiResponse.error(res, "Failed to request salary hike", error);
      }
    };
    this.GET_SALARY_INCREASE_REQUEST = async (req, res) => {
      try {
        const doctorId = req.query.doctorId;
        if (!doctorId) {
          throw new AppError("Doctor ID is required", 400 /* BAD_REQUEST */);
        }
        const result = await this._service.getsalaryincreserequest(doctorId);
        return ApiResponse.success(
          res,
          "Salary increase request fetched successfully",
          result,
          200 /* OK */
        );
      } catch (error) {
        if (error instanceof AppError) {
          return ApiResponse.error(res, error.message, error);
        }
        return ApiResponse.error(res, "Failed to fetch salary hike request", error);
      }
    };
    this.GET_WALLET = async (req, res) => {
      try {
        const user = req.user;
        const doctorID = user?.doctorID || user?.userId;
        if (!doctorID) {
          ApiResponse.throwError(401 /* UNAUTHORIZED */, "Unauthorized");
        }
        const result = await this._service.getwallet(doctorID);
        return ApiResponse.success(res, "Wallet information fetched successfully", result, 200 /* OK */);
      } catch (error) {
        console.log(error);
        throw new AppError("Failed to fetch wallet information", 500 /* INTERNAL_SERVER_ERROR */);
      }
    };
    this.WITHDRAW = async (req, res) => {
      try {
        const user = req.user;
        const doctorID = user?.doctorID || user?.userId;
        if (!doctorID) {
          ApiResponse.throwError(401 /* UNAUTHORIZED */, "Unauthorized");
        }
        const result = await this._service.withdraw(doctorID, req.body.amount);
        return ApiResponse.success(res, "Withdrawal request submitted successfully", result, 200 /* OK */);
      } catch (error) {
        console.log(error);
        throw new AppError("Failed to process withdrawal request", 500 /* INTERNAL_SERVER_ERROR */);
      }
    };
  }
};

// src/repositories/wallet/wallet.repository.ts
var WalletRepository = class extends BaseRepository {
  async creditWallet(ownerId, amount) {
    console.log("WalletRepository creditWallet", ownerId, amount);
    let owner = await this.model.findById(ownerId);
    console.log("i am owner", owner);
    return await this.model.findOneAndUpdate(
      { ownerId },
      {
        $inc: {
          balance: amount,
          totalearnings: amount
        },
        $push: {
          Transaction: {
            amount,
            type: "credit",
            date: /* @__PURE__ */ new Date()
          }
        }
      },
      { new: true, upsert: true }
    );
  }
  async debitWallet(ownerId, amount) {
    const wallet = await this.model.findOne({ ownerId });
    if (!wallet) {
      throw new Error("Wallet not found");
    }
    if (wallet.balance < amount) {
      throw new Error("Insufficient balance");
    }
    return await this.model.findOneAndUpdate(
      { ownerId },
      {
        $inc: {
          balance: -amount,
          totalwithdrawn: amount
        },
        $push: {
          Transaction: {
            amount,
            type: "debit",
            date: /* @__PURE__ */ new Date()
          }
        }
      },
      { new: true }
    );
  }
};

// src/models/wallet.model.ts
import mongoose15, { Schema as Schema13 } from "mongoose";
var walletSchema = new Schema13(
  {
    ownerId: {
      type: Schema13.Types.ObjectId,
      required: true,
      index: true
    },
    balance: {
      type: Number,
      default: 0
    },
    Transaction: [
      {
        amount: { type: Number, required: true },
        type: { type: String, enum: ["credit", "debit"], required: true },
        date: { type: Date, default: Date.now }
      }
    ],
    totalearnings: {
      type: Number,
      default: 0
    },
    totalwithdrawn: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);
var Wallet = mongoose15.model("Wallet", walletSchema);

// src/models/HospitalDoctorConfigModel.ts
import { Schema as Schema14, model as model5 } from "mongoose";
var hospitalDoctorConfigSchema = new Schema14(
  {
    hospitalId: {
      type: Schema14.Types.ObjectId,
      ref: "Hospital",
      required: true
    },
    doctorId: {
      type: Schema14.Types.ObjectId,
      ref: "Doctor",
      required: true
    },
    doctorFee: {
      type: Number,
      required: true,
      min: [0, "Doctor fee cannot be negative"],
      default: 0
    },
    hospitalCommission: {
      type: Number,
      required: true,
      min: [0, "Commission cannot be negative"],
      default: 0
    }
  },
  { timestamps: true }
);
var HospitalDoctorConfigModel = model5(
  "HospitalDoctorConfig",
  hospitalDoctorConfigSchema
);

// src/repositories/HospitalDoctorConfig/HospitalDoctorConfigRepository.ts
var HospitalDoctorConfigRepository = class extends BaseRepository {
  constructor() {
    super(HospitalDoctorConfigModel);
  }
  async findByDoctorIdHOspitalid(id) {
    return await this.model.findOne({ doctorId: id });
  }
};

// src/dto/patient/prescription-response.dto.ts
import { z as z13 } from "zod";
var PrescriptionResponseSchema = z13.object({
  id: z13.string(),
  patient_email: z13.string(),
  doctor_id: z13.object({
    id: z13.string(),
    name: z13.string(),
    profileImage: z13.string().optional(),
    specialization: z13.string().optional()
  }),
  hospital_id: z13.object({
    id: z13.string(),
    name: z13.string(),
    logo: z13.string().optional(),
    address: z13.string().optional()
  }),
  appointment_id: z13.string().optional(),
  medicines: z13.array(z13.object({
    name: z13.string(),
    dosage: z13.string(),
    duration: z13.string()
  })),
  notes: z13.string().optional(),
  createdAt: z13.union([z13.date(), z13.string()]),
  updatedAt: z13.union([z13.date(), z13.string()])
});

// src/mappers/prescription.mapper.ts
var PrescriptionMapper = class {
  toDTO(prescription) {
    const doctor = prescription.doctor_id;
    const hospital = prescription.hospital_id;
    const dto = {
      id: prescription._id.toString(),
      patient_email: prescription.patient_email,
      doctor_id: {
        id: doctor._id?.toString() || prescription.doctor_id.toString(),
        name: doctor.name || "Unknown Doctor",
        profileImage: doctor.profileImage || "",
        specialization: doctor.specialization || ""
      },
      hospital_id: {
        id: hospital._id?.toString() || prescription.hospital_id.toString(),
        name: hospital.hospitalName || "Unknown Hospital",
        logo: hospital.logo || "",
        address: hospital.address || ""
      },
      appointment_id: prescription.appointment_id?.toString(),
      medicines: prescription.medicines.map((m) => ({
        name: m.name,
        dosage: m.dosage,
        duration: m.duration
      })),
      notes: prescription.notes,
      createdAt: prescription.createdAt,
      updatedAt: prescription.updatedAt
    };
    return PrescriptionResponseSchema.parse(dto);
  }
};

// src/di/doctor.di.ts
var doctorContainer = () => {
  const doctorRepository = new DoctorRepository(DoctorModel);
  const tokenService2 = new TokenService();
  const hospitalRepo = new HospitalRepository(HospitalModel);
  const hospitalMapper = new HospitalMapper();
  const departmentRepo = new DepartmentRepository(department_model_default);
  const qualificationRepo = new QualificationRepository(qualification_model_default);
  const specializationRepo = new SpecializationRepository();
  const leaveRepo = new LeaveRepository();
  const appointmentRepo = new AppointmentRepository();
  const appointmentMapper = new AppointmentMapper();
  const prescriptionMapper = new PrescriptionMapper();
  const slotmapper = new SlotMapper();
  const slotRepo = new SlotRepository(DoctorScheduleModel);
  const prescriptionRepo = new PrescriptionRepository(prescription_model_default);
  const HospitalDoctorConfigRepo = new HospitalDoctorConfigRepository();
  const slotservice = new SlotMangementService(slotRepo, slotmapper, appointmentRepo);
  const slotcontroller2 = new DoctorSlotManagementController(slotservice);
  const departmentMapper = new DepartmentMapper();
  const qualificationMapper = new QualificationMapper();
  const specializationMapper = new SpecializationMapper();
  const WalletRepo = new WalletRepository(Wallet);
  const doctordashbordrepository = new SalaryrequestRepository(SalaryRequestModel);
  const doctordashbordservice = new DoctorDashboardService(doctordashbordrepository, doctorRepository, WalletRepo);
  const doctorDashboard2 = new DoctorDashboard(doctordashbordservice);
  const appointmentService = new AppointmentService(appointmentRepo, appointmentMapper, prescriptionRepo, HospitalDoctorConfigRepo, WalletRepo, prescriptionMapper);
  const consultation2 = new Consultation(appointmentService);
  const doctorMapper = new DoctorMapper();
  const doctorLeaveMapper = new DoctorLeaveMapper();
  const doctorService = new DoctorService(
    doctorRepository,
    tokenService2,
    appointmentRepo,
    leaveRepo,
    doctorMapper,
    doctorLeaveMapper
  );
  const doctorAuthService = new DoctorAuthService(
    doctorRepository,
    tokenService2,
    doctorMapper,
    hospitalRepo,
    hospitalMapper,
    departmentRepo,
    qualificationRepo,
    specializationRepo,
    departmentMapper,
    qualificationMapper,
    specializationMapper
  );
  const doctorcontroller2 = new doctor_controller_default(doctorService);
  const doctorAuthController2 = new DoctorAuthController(doctorAuthService);
  const doctorAuthMiddleware2 = new DoctorAuthMiddleware(tokenService2, doctorRepository);
  const appoimentController2 = new AppointmentController(appointmentService);
  return {
    tokenService: tokenService2,
    doctorcontroller: doctorcontroller2,
    doctorAuthController: doctorAuthController2,
    doctorRepository,
    doctorAuthMiddleware: doctorAuthMiddleware2,
    appoimentController: appoimentController2,
    consultation: consultation2,
    qualificationRepo,
    slotcontroller: slotcontroller2,
    doctorDashboard: doctorDashboard2
  };
};

// src/controllers/hospital/doctor/implementations/doctor.management.controller.ts
var DoctorManagementController = class {
  constructor(_doctorManagementService) {
    this._doctorManagementService = _doctorManagementService;
    this.getAllKycDoctors = async (req, res, next) => {
      try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const search = req.query.search;
        const status = req.query.filter;
        const hospital = req.user;
        const hospital_id = hospital?.userId;
        const filter = {
          licence: { $exists: true, $ne: "" },
          reviewStatus: { $ne: "approved" }
        };
        if (hospital_id) {
          filter.hospital_id = hospital_id.toString();
        }
        const result = await this._doctorManagementService.getAllDoctors({ page, limit, search, filter, status });
        return ApiResponse.success(res, "KYC Doctors fetched successfully", result.data, 200 /* OK */, {
          page,
          limit,
          totalItems: result.total,
          totalPages: Math.ceil(result.total / limit)
        });
      } catch (error) {
        next(error);
      }
    };
  }
  async getAllDoctors(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 5;
      const search = req.query.search;
      const hospital = req.user;
      const hospital_id = hospital?.userId;
      const filterStatus = req.query.filter;
      const filter = {
        reviewStatus: "approved"
      };
      if (hospital_id) {
        filter.hospital_id = hospital_id.toString();
      }
      if (filterStatus === "active") {
        filter.isActive = true;
      } else if (filterStatus === "blocked") {
        filter.isActive = false;
      }
      const result = await this._doctorManagementService.getAllDoctors({ page, limit, search, filter });
      return ApiResponse.success(res, "Doctors fetched successfully", result.data, 200 /* OK */, {
        page,
        limit,
        totalItems: result.total,
        totalPages: Math.ceil(result.total / limit)
      });
    } catch (error) {
      next(error);
    }
  }
  async doctorsToggle(req, res, next) {
    try {
      const { id } = req.params;
      const result = await this._doctorManagementService.doctorsToggle(id);
      return ApiResponse.success(res, "Doctor status toggled successfully", result);
    } catch (error) {
      next(error);
    }
  }
  async acceptDoctor(req, res, next) {
    try {
      const { id } = req.params;
      const result = await this._doctorManagementService.acceptDoctor(id);
      return ApiResponse.success(res, "Doctor accepted successfully", result);
    } catch (error) {
      next(error);
    }
  }
  async rejectDoctor(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const result = await this._doctorManagementService.rejectDoctor(id, reason);
      return ApiResponse.success(res, "Doctor rejected successfully", result);
    } catch (error) {
      next(error);
    }
  }
  async requestRevisionDoctor(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const result = await this._doctorManagementService.requestRevisionDoctor(id, reason);
      return ApiResponse.success(res, "Doctor revision requested successfully", result);
    } catch (error) {
      next(error);
    }
  }
  async registerDoctor(req, res, next) {
    try {
      const files = req.files;
      const doctorData = req.body;
      const hospital = req.user;
      const hospital_id = hospital?.userId;
      if (!hospital_id) {
        return ApiResponse.throwError(401 /* UNAUTHORIZED */, "Hospital ID not found");
      }
      const doctor = await this._doctorManagementService.registerDoctor(
        doctorData,
        files,
        hospital_id.toString()
      );
      return ApiResponse.created(res, MESSAGES.DOCTOR.REGISTER_SUCCESS, doctor);
    } catch (error) {
      next(error);
    }
  }
  async updateDoctor(req, res, next) {
    try {
      const { id } = req.params;
      const files = req.files;
      const doctorData = req.body;
      logger_default.debug(`Updating doctor ${id} with data: ${JSON.stringify(doctorData)}`);
      const result = await this._doctorManagementService.updateDoctor(id, doctorData, files);
      return ApiResponse.success(res, "Doctor profile updated successfully", result);
    } catch (error) {
      next(error);
    }
  }
  async getLeaveDoctors(req, res, next) {
    try {
      const hospital = req.user;
      const hospitalId = hospital?.userId?.toString() || "";
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 5;
      const search = req.query.search;
      const dateStr = req.query.date;
      const date = dateStr ? new Date(dateStr) : void 0;
      const result = await this._doctorManagementService.getLeaveDoctors({
        hospitalId,
        page,
        limit,
        search,
        date
      });
      return ApiResponse.success(res, "Doctor leaves fetched successfully", result.data, 200 /* OK */, {
        page: result.page,
        limit: result.limit,
        totalItems: result.total,
        totalPages: Math.ceil(result.total / result.limit)
      });
    } catch (error) {
      next(error);
    }
  }
  async updateLeaveStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, rejectedReason } = req.body;
      if (!status || !["approved", "rejected"].includes(status)) {
        return ApiResponse.throwError(400 /* BAD_REQUEST */, "Invalid status");
      }
      const result = await this._doctorManagementService.updateLeaveStatus(id, status, rejectedReason);
      return ApiResponse.success(res, `Leave ${status} successfully`, result);
    } catch (error) {
      next(error);
    }
  }
  async getDoctorDetails(req, res) {
    const { id } = req.params;
    const result = await this._doctorManagementService.getDoctorDetails(id);
    logger_default.debug(`Fetched doctor details for ${id}`);
    return ApiResponse.success(res, "success", result);
  }
  async getDeptSpecs(req, res, next) {
    try {
      const user = req.user;
      const hospitalId = user.userId;
      const result = await this._doctorManagementService.getDeptSpecs(hospitalId);
      return ApiResponse.success(res, "success", result);
    } catch (error) {
      next(error);
    }
  }
};

// src/services/hospital/doctor/implementations/doctor.management.service.ts
import { Types as Types21 } from "mongoose";
import bcrypt4 from "bcryptjs";

// src/services/image/implementation/cloudinary.image.service.ts
var CloudinaryImageService = class {
  async uploadImage(source, folder) {
    if (Buffer.isBuffer(source)) {
      return uploadBufferToCloudinary(source, folder);
    }
    try {
      const result = await cloudinary_default.uploader.upload(source, {
        folder
      });
      return result.secure_url;
    } catch (error) {
      logger_default.error(`Cloudinary upload failed for folder ${folder}:`, error);
      throw error;
    }
  }
  async deleteImage(url) {
    const publicId = extractPublicId(url);
    if (!publicId) return;
    try {
      await cloudinary_default.uploader.destroy(publicId);
      logger_default.info(`Deleted image with public ID: ${publicId}`);
    } catch (error) {
      logger_default.error(`Failed to delete image with public ID ${publicId}:`, error);
    }
  }
  async processGalleryUpdate(currentUrls, desiredState, folder) {
    const urlsToDelete = currentUrls.filter((url) => !desiredState.includes(url));
    await Promise.all(urlsToDelete.map((url) => this.deleteImage(url)));
    const processedUrls = await Promise.all(
      desiredState.map(async (item) => {
        if (item.startsWith("http")) {
          return item;
        } else if (item.startsWith("data:image")) {
          return this.uploadImage(item, folder);
        }
        return item;
      })
    );
    return processedUrls.filter((url) => typeof url === "string" && url.startsWith("http"));
  }
};

// src/services/hospital/doctor/implementations/doctor.management.service.ts
var DoctorManagementService = class {
  constructor(_doctorRepo, _doctorMapper, _departmentRepo, _leaveRepo, _subscriptionService, _leaveMapper, _specializationRepo, _qualificationRepo) {
    this._doctorRepo = _doctorRepo;
    this._doctorMapper = _doctorMapper;
    this._departmentRepo = _departmentRepo;
    this._leaveRepo = _leaveRepo;
    this._subscriptionService = _subscriptionService;
    this._leaveMapper = _leaveMapper;
    this._specializationRepo = _specializationRepo;
    this._qualificationRepo = _qualificationRepo;
    this._cloudinary = new CloudinaryImageService();
  }
  async getAllDoctors(options) {
    const { page, limit, search, filter, status } = options;
    const queryFilter = { ...filter };
    if (status === "active") {
      queryFilter.isActive = true;
    } else if (status === "blocked") {
      queryFilter.isActive = false;
    } else if (status === "pending" || status === "approved" || status === "revision" || status === "rejected") {
      queryFilter.reviewStatus = status;
    }
    const result = await this._doctorRepo.findWithPagination({
      page,
      limit,
      search,
      searchFields: ["name", "email", "specialization"],
      filter: queryFilter
    });
    const hospitalId = filter?.hospital_id;
    const departmentMap = /* @__PURE__ */ new Map();
    if (hospitalId) {
      const { data: departments } = await this._departmentRepo.findByHospitalId(
        hospitalId,
        1,
        100
      );
      departments.forEach((dept) => {
        departmentMap.set(dept._id.toString(), dept.departmentName);
      });
    }
    const doctors = result.data.map((doc) => {
      const dto = this._doctorMapper.toDTO(doc);
      if (departmentMap.has(dto.department)) {
        dto.department = departmentMap.get(dto.department);
      }
      return dto;
    });
    return {
      data: doctors,
      total: result.total,
      page: result.page,
      limit: result.limit
    };
  }
  async doctorsToggle(id) {
    const doctor = await this._doctorRepo.findById(id);
    if (!doctor) {
      logger_default.warn(
        `Toggle Doctor status failed: Doctor not found with ID ${id}`
      );
      ApiResponse.throwError(404 /* NOT_FOUND */, "Doctor not found");
    }
    const newStatus = !doctor.isActive;
    logger_default.info(`Doctor status toggled: ${id} to ${newStatus}`);
    const updated = await this._doctorRepo.update(id, {
      isActive: newStatus
    });
    return updated ? this._doctorMapper.toDTO(updated) : null;
  }
  async acceptDoctor(id) {
    const doctor = await this._doctorRepo.findById(id);
    if (!doctor) {
      logger_default.warn(`Accept Doctor failed: Doctor not found with ID ${id}`);
      ApiResponse.throwError(404 /* NOT_FOUND */, "Doctor not found");
    }
    logger_default.info(`Doctor accepted: ${id}`);
    const updated = await this._doctorRepo.update(id, {
      reviewStatus: "approved",
      isActive: true,
      isAccountVerified: true,
      rejectionReason: void 0
    });
    return updated ? this._doctorMapper.toDTO(updated) : null;
  }
  async rejectDoctor(id, reason) {
    const doctor = await this._doctorRepo.findById(id);
    if (!doctor) {
      logger_default.warn(`Reject Doctor failed: Doctor not found with ID ${id}`);
      ApiResponse.throwError(404 /* NOT_FOUND */, "Doctor not found");
    }
    logger_default.info(`Doctor rejected: ${id}`);
    const updated = await this._doctorRepo.update(id, {
      reviewStatus: "rejected",
      isActive: true,
      rejectionReason: reason
    });
    return updated ? this._doctorMapper.toDTO(updated) : null;
  }
  async requestRevisionDoctor(id, reason) {
    const doctor = await this._doctorRepo.findById(id);
    if (!doctor) {
      logger_default.warn(`Request Revision failed: Doctor not found with ID ${id}`);
      ApiResponse.throwError(404 /* NOT_FOUND */, "Doctor not found");
    }
    logger_default.info(`Doctor revision requested: ${id}`);
    const updated = await this._doctorRepo.update(id, {
      reviewStatus: "revision",
      isActive: true,
      rejectionReason: reason
    });
    return updated ? this._doctorMapper.toDTO(updated) : null;
  }
  async registerDoctor(data, files, hospital_id) {
    await this._subscriptionService.checkSubscriptionLimit(
      hospital_id,
      "maxDoctors"
    );
    let profileImageUrl = "";
    let licenseUrl = "";
    const existingDoctor = await this._doctorRepo.findByEmail(data.email);
    if (existingDoctor) {
      ApiResponse.throwError(
        409 /* CONFLICT */,
        MESSAGES.AUTH.ALREADY_EXISTS
      );
    }
    if (files?.profileImage?.[0]) {
      profileImageUrl = await uploadBufferToCloudinary(
        files.profileImage[0].buffer,
        "doctors/profile"
      );
    }
    if (files?.license?.[0]) {
      licenseUrl = await uploadBufferToCloudinary(
        files.license[0].buffer,
        "doctors/license"
      );
    }
    const hashedPassword = await bcrypt4.hash(data.password, 10);
    const doctorData = {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      hospital_id: new Types21.ObjectId(hospital_id),
      phone: data.phone,
      address: data.address,
      specialization: data.specialization,
      qualification: data.qualification,
      experience: data.experience,
      department: data.department,
      about: data.about,
      licence: licenseUrl,
      profileImage: profileImageUrl,
      isActive: true,
      isAccountVerified: true,
      reviewStatus: "pending"
    };
    const created = await this._doctorRepo.create(doctorData);
    return this._doctorMapper.toDTO(created);
  }
  async updateDoctor(id, data, files) {
    const doctor = await this._doctorRepo.findById(id);
    if (!doctor) {
      ApiResponse.throwError(404 /* NOT_FOUND */, "Doctor not found");
    }
    let profileImageUrl = doctor.profileImage;
    let licenseUrl = doctor.licence;
    if (files?.profileImage?.[0]) {
      profileImageUrl = await uploadBufferToCloudinary(
        files.profileImage[0].buffer,
        "doctors/profile"
      );
    }
    if (files?.license?.[0]) {
      licenseUrl = await uploadBufferToCloudinary(
        files.license[0].buffer,
        "doctors/license"
      );
    }
    const updateData = {
      ...data,
      hospital_id: data.hospital_id ? typeof data.hospital_id === "string" ? new Types21.ObjectId(data.hospital_id) : data.hospital_id : void 0,
      profileImage: profileImageUrl,
      licence: licenseUrl,
      isActive: data.isActive === "true" || data.isActive === true,
      isAccountVerified: data.isAccountVerified === "true" || data.isAccountVerified === true
    };
    const updated = await this._doctorRepo.update(id, updateData);
    console.log(updated);
    return updated ? this._doctorMapper.toDTO(updated) : null;
  }
  async getLeaveDoctors(options) {
    const res = await this._leaveRepo.findHospitalLeaves(options);
    return {
      ...res,
      data: res.data.map((leave) => this._leaveMapper.toDTO(leave))
    };
  }
  async updateLeaveStatus(leaveId, status, reason) {
    const leave = await this._leaveRepo.updateStatus(leaveId, status, reason);
    return leave ? this._leaveMapper.toDTO(leave) : null;
  }
  async getDoctorDetails(id) {
    const doctor = await this._doctorRepo.findById(id);
    if (!doctor) {
      logger_default.warn(`Doctor not found with ID: ${id}`);
      return null;
    }
    const doctorDTO = this._doctorMapper.toDTO(doctor);
    const doctorData = doctor;
    if (doctorData.department_id) {
      const department = await this._departmentRepo.findById(
        doctorData.department_id.toString()
      );
      if (department) {
        doctorDTO.department = department.departmentName;
      }
    }
    if (doctorData.specialization_id) {
      const specialization = await this._specializationRepo.findById(
        doctorData.specialization_id
      );
      if (specialization) {
        doctorDTO.specialization = specialization.name;
      }
    }
    return doctorDTO;
  }
  async getDeptSpecs(hospitalId) {
    const hospitalObjectId = new Types21.ObjectId(hospitalId);
    const [departments, specializations, qualifications] = await Promise.all([
      this._departmentRepo.findByFilter({ hospital_id: hospitalObjectId }),
      this._specializationRepo.findByFilter({ hospital_id: hospitalObjectId }),
      this._qualificationRepo.findByFilter({ hospital_id: hospitalObjectId })
    ]);
    return {
      departments,
      specializations,
      qualifications
    };
  }
};

// src/controllers/hospital/patient/implementations/patient.management.controller.ts
var PatientManagementController = class {
  constructor(_patientManagementService) {
    this._patientManagementService = _patientManagementService;
    this.getAllPatient = async (req, res, next) => {
      try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const search = req.query.search || "";
        const hospital = req.user;
        const hospital_id = hospital?.userId;
        const filter = req.query.filter;
        const result = await this._patientManagementService.getAllPatient({ page, limit, search, filter, hospital_id });
        return ApiResponse.success(res, MESSAGES.PATIENT.FETCH_SUCCESS, result.data, 200 /* OK */, {
          page,
          limit,
          totalItems: result.total,
          totalPages: Math.ceil(result.total / limit)
        });
      } catch (error) {
        next(error);
      }
    };
  }
  async addPatient(req, res, next) {
    try {
      const hospital = req.user;
      const hospital_id = hospital?.userId;
      if (!hospital_id) {
        return ApiResponse.throwError(401 /* UNAUTHORIZED */, "Hospital ID not found");
      }
      const patientData = req.body;
      const patientFile = req.file;
      const result = await this._patientManagementService.addPatient(patientData, hospital_id, patientFile);
      return ApiResponse.created(res, "Patient added successfully", result);
    } catch (error) {
      next(error);
    }
  }
  async patientsToggle(req, res, next) {
    try {
      const { id } = req.params;
      const result = await this._patientManagementService.patientsToggle(id);
      return ApiResponse.success(res, "Patient status toggled successfully", result);
    } catch (error) {
      next(error);
    }
  }
  async updatePatient(req, res, next) {
    try {
      const { id } = req.params;
      const patientData = req.body;
      const patientFile = req.file;
      const result = await this._patientManagementService.updatePatient(id, patientData, patientFile);
      return ApiResponse.success(res, "Patient updated successfully", result);
    } catch (error) {
      next(error);
    }
  }
};

// src/services/hospital/patient/implementations/patient.management.service.ts
import { Types as Types22 } from "mongoose";
var PatientManagementService = class {
  constructor(_userRepo, _patientMapper, _appointmentRepo, _hospitalSubscriptionService) {
    this._userRepo = _userRepo;
    this._patientMapper = _patientMapper;
    this._appointmentRepo = _appointmentRepo;
    this._hospitalSubscriptionService = _hospitalSubscriptionService;
  }
  async addPatient(patientData, hospital_id, patientFile) {
    const patient = await this._userRepo.create({
      ...patientData,
      hospital_id: [new Types22.ObjectId(hospital_id)],
      image: patientFile?.path || void 0,
      isActive: true
    });
    return this._patientMapper.toDTO(patient);
  }
  async patientsToggle(id) {
    const patient = await this._userRepo.findById(id);
    if (!patient) {
      ApiResponse.throwError(404 /* NOT_FOUND */, "Patient not found");
    }
    const updated = await this._userRepo.update(id, { isActive: !patient.isActive });
    return this._patientMapper.toDTO(updated);
  }
  async updatePatient(id, patientData, patientFile) {
    const updatePayload = { ...patientData };
    if (patientFile) {
      updatePayload.image = patientFile.path;
    }
    const updated = await this._userRepo.update(id, updatePayload);
    if (!updated) {
      ApiResponse.throwError(404 /* NOT_FOUND */, "Patient not found");
    }
    return this._patientMapper.toDTO(updated);
  }
  async getAllPatient(query) {
    const queryFilter = { hospital_id: query.hospital_id };
    if (query.filter === "active") {
      queryFilter.isActive = true;
    } else if (query.filter === "blocked") {
      queryFilter.isActive = false;
    }
    const result = await this._userRepo.findWithPagination({
      page: query.page,
      limit: query.limit,
      search: query.search,
      searchFields: ["name", "email", "phone"],
      filter: queryFilter
    });
    return {
      data: result.data.map((p) => this._patientMapper.toDTO(p)),
      total: result.total
    };
  }
};

// src/services/auth/hospital/hospital.auth.service.ts
import bcrypt5 from "bcryptjs";
var HospitalAuthService = class {
  constructor(_hospitalRepo, _tokenService, _hospitalMapper) {
    this._hospitalRepo = _hospitalRepo;
    this._tokenService = _tokenService;
    this._hospitalMapper = _hospitalMapper;
  }
  async signup(hospitalData, files) {
    const { email, password, hospitalName } = hospitalData;
    if (!email || !password || !hospitalName) {
      logger_default.warn("Signup failed: Required fields missing");
      ApiResponse.throwError(400 /* BAD_REQUEST */, MESSAGES.VALIDATION.REQUIRED_FIELD);
    }
    const existingHospital = await this._hospitalRepo.findByEmail(email);
    if (existingHospital) {
      logger_default.warn(`Signup failed: Hospital already exists for email ${email}`);
      ApiResponse.throwError(409 /* CONFLICT */, MESSAGES.ADMIN.HOSPITAL_EXISTS);
    }
    let logoUrl = "";
    let licenceUrl = "";
    try {
      if (files.logo && files.logo.length > 0) {
        logoUrl = await uploadBufferToCloudinary(files.logo[0].buffer, "hospital/logo");
      }
      if (files.licence && files.licence.length > 0) {
        licenceUrl = await uploadBufferToCloudinary(files.licence[0].buffer, "hospital/licence");
      }
    } catch (error) {
      logger_default.error(`Cloudinary upload failed: ${error}`);
      ApiResponse.throwError(500 /* INTERNAL_SERVER_ERROR */, MESSAGES.SERVER.INTERNAL_ERROR);
    }
    const hashedPassword = await bcrypt5.hash(password, 10);
    const hospital = await this._hospitalRepo.create({
      ...hospitalData,
      password: hashedPassword,
      logo: logoUrl,
      licence: licenceUrl
    });
    logger_default.info(`New Hospital registered: ${email}`);
    return {
      hospital: this._hospitalMapper.toDTO(hospital)
    };
  }
  async loginHospital(loginData) {
    const hospital = await this._hospitalRepo.findByEmailWithPassword(loginData.email);
    if (!hospital) {
      logger_default.warn(`Login failed: Hospital not found for email ${loginData.email}`);
      ApiResponse.throwError(400 /* BAD_REQUEST */, MESSAGES.AUTH.LOGIN_FAILED);
    }
    console.log(hospital.isActive);
    if (!hospital.isActive) {
      logger_default.warn(`Login failed: Account blocked for email ${loginData.email}`);
      ApiResponse.throwError(403 /* FORBIDDEN */, MESSAGES.AUTH.ACCOUNT_BLOCKED);
    }
    const isPasswordMatch = await bcrypt5.compare(loginData.password, hospital.password);
    if (!isPasswordMatch) {
      logger_default.warn(`Login failed: Invalid password for email ${loginData.email}`);
      ApiResponse.throwError(400 /* BAD_REQUEST */, MESSAGES.AUTH.LOGIN_FAILED);
    }
    const accessToken = this._tokenService.generateAccessToken({
      userId: hospital._id.toString(),
      email: hospital.email,
      role: loginData.role
    });
    const refreshToken = this._tokenService.generateRefreshToken({
      userId: hospital._id.toString(),
      email: hospital.email,
      role: loginData.role
    });
    logger_default.info(`Hospital logged in: ${loginData.email}`);
    const userDto = this._hospitalMapper.toDTO(hospital);
    return { user: userDto, accessToken, refreshToken };
  }
};

// src/controllers/auth/hospital/hospital.auth.controller.ts
var HospitalAuthController = class {
  constructor(_hospitalAuthService) {
    this._hospitalAuthService = _hospitalAuthService;
    this.signup = async (req, res, next) => {
      try {
        const hospitalData = req.body;
        const files = req.files;
        const result = await this._hospitalAuthService.signup(hospitalData, files);
        return ApiResponse.created(res, MESSAGES.ADMIN.SIGNUP_SUCCESS || "Hospital account created successfully", result);
      } catch (error) {
        next(error);
      }
    };
    this.loginHospital = async (req, res, next) => {
      try {
        const { email, password } = req.body;
        if (!email || !password) {
          ApiResponse.throwError(400 /* BAD_REQUEST */, MESSAGES.VALIDATION.REQUIRED_FIELD);
        }
        const result = await this._hospitalAuthService.loginHospital({ email, password, role: "hospital" });
        res.cookie("refreshToken", result.refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          maxAge: Number(process.env.MAX_AGE_REFRESH_TOKEN) || 7 * 24 * 60 * 60 * 1e3,
          path: "/"
        });
        res.cookie("accessToken", result.accessToken, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          maxAge: Number(process.env.MAX_AGE_ACCESS_TOKEN) || 15 * 60 * 1e3,
          path: "/"
        });
        return ApiResponse.success(res, MESSAGES.ADMIN.LOGIN_SUCCESS || MESSAGES.AUTH.LOGIN_SUCCESS, result);
      } catch (error) {
        next(error);
      }
    };
  }
};

// src/dto/subscription/subscription-response.dto.ts
import { z as z14 } from "zod";
var SubscriptionResponseSchema = z14.object({
  id: z14.string(),
  amount: z14.number(),
  status: z14.enum(["active", "expired", "cancelled"]),
  planName: z14.string(),
  duration: z14.number().optional(),
  durationUnit: z14.enum(["months", "years"]).optional(),
  description: z14.string().optional(),
  startDate: z14.union([z14.string(), z14.date()]).optional(),
  endDate: z14.union([z14.string(), z14.date()]).optional(),
  createdAt: z14.union([z14.string(), z14.date()]),
  updatedAt: z14.union([z14.string(), z14.date()])
});
var CreateSubscriptionSchema = z14.object({
  planName: z14.string(),
  description: z14.string().optional(),
  price: z14.number(),
  duration: z14.number(),
  durationUnit: z14.enum(["days", "months", "years"]),
  features: z14.array(z14.string()).optional(),
  planType: z14.enum(["Basic", "Standard", "Premium", "Enterprise"]).optional(),
  limits: z14.object({
    maxPatients: z14.number(),
    maxDoctors: z14.number(),
    maxDepartments: z14.number()
  }),
  isActive: z14.boolean().optional()
});
var UpdateSubscriptionSchema = CreateSubscriptionSchema.partial();

// src/mappers/subscription.mapper.ts
var SubscriptionMapper = class {
  toDTO(subscription) {
    const dto = {
      id: subscription._id.toString(),
      amount: subscription.amount,
      status: subscription.status,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      planName: subscription.planName,
      duration: subscription.duration,
      durationUnit: subscription.durationUnit,
      description: subscription.description,
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt
    };
    try {
      return SubscriptionResponseSchema.parse(dto);
    } catch (error) {
      console.error("ZOD ERROR:", error);
      throw error;
    }
  }
};

// src/services/hospital/hospital/implementations/hospital.service.ts
import bcrypt6 from "bcryptjs";
var HospitalService = class {
  constructor(_hospitalRepo, _hospitalMapper, _imageService, _patientService, _doctorRepo, _departmentRepo, _userRepo, _subscriptionRepo) {
    this._hospitalRepo = _hospitalRepo;
    this._hospitalMapper = _hospitalMapper;
    this._imageService = _imageService;
    this._patientService = _patientService;
    this._doctorRepo = _doctorRepo;
    this._departmentRepo = _departmentRepo;
    this._userRepo = _userRepo;
    this._subscriptionRepo = _subscriptionRepo;
  }
  async getHospitalProfile(hospitalId) {
    const hospital = await this._hospitalRepo.findById(hospitalId);
    if (!hospital) {
      ApiResponse.throwError(404 /* NOT_FOUND */, MESSAGES.ADMIN.NOT_FOUND);
    }
    const [doctors, patients, departments] = await Promise.all([
      this._doctorRepo.countDocuments({ hospital_id: hospitalId }),
      this._userRepo.countDocuments({ hospital_id: hospitalId }),
      this._departmentRepo.countDocuments({ hospital_id: hospitalId })
    ]);
    const currentCounts = { doctors, patients, departments };
    let limits;
    if (hospital.subscription?.plan) {
      const planName = hospital.subscription.plan.charAt(0).toUpperCase() + hospital.subscription.plan.slice(1);
      await this._subscriptionRepo.findByPlanName(planName);
    }
    return this._hospitalMapper.toDTO(hospital, limits, currentCounts);
  }
  async getSelectedHospital(hospitalId, page = 1, limit = 10, search = "") {
    const data = await this._patientService.selectedHospital(hospitalId, page, limit, search);
    return SelectedHospitalSchema.parse(data);
  }
  async updateHospitalStatusReapply(hospitalId) {
    const updatedHospital = await this._hospitalRepo.update(hospitalId, {
      reviewStatus: "pending",
      rejectionReason: void 0
    });
    return updatedHospital ? this._hospitalMapper.toDTO(updatedHospital) : null;
  }
  async updateHospital(hospitalId, hospitalData, files) {
    const hospital = await this._hospitalRepo.findById(hospitalId);
    if (!hospital) {
      logger_default.warn(`Update Hospital failed: Hospital not found with ID ${hospitalId}`);
      return null;
    }
    const updatePayload = { ...hospitalData };
    if (updatePayload.password && updatePayload.password.trim() !== "") {
      const salt = await bcrypt6.genSalt(10);
      updatePayload.password = await bcrypt6.hash(updatePayload.password, salt);
    } else {
      delete updatePayload.password;
    }
    try {
      if (typeof updatePayload.subscription === "string") {
        updatePayload.subscription = JSON.parse(updatePayload.subscription);
      }
      if (typeof updatePayload.images === "string") {
        updatePayload.images = JSON.parse(updatePayload.images);
      }
      if (typeof updatePayload.since === "string") {
        updatePayload.since = parseInt(updatePayload.since, 10);
      }
    } catch (error) {
      logger_default.error("Error parsing JSON fields in hospital update", error);
    }
    const currentImages = hospital.images || {
      landscape: [],
      medicalTeam: [],
      patientCare: [],
      services: []
    };
    const desiredImages = updatePayload.images || currentImages;
    if (typeof updatePayload.logo === "string" && updatePayload.logo.startsWith("data:image")) {
      if (hospital.logo) await this._imageService.deleteImage(hospital.logo);
      updatePayload.logo = await this._imageService.uploadImage(
        updatePayload.logo,
        "hospitals/logos"
      );
    } else if (updatePayload.logo === "" && hospital.logo) {
      await this._imageService.deleteImage(hospital.logo);
      updatePayload.logo = "";
    } else if (files?.logo?.[0]) {
      if (hospital.logo) await this._imageService.deleteImage(hospital.logo);
      updatePayload.logo = await this._imageService.uploadImage(
        files.logo[0].buffer,
        "hospitals/logos"
      );
    }
    if (typeof updatePayload.licence === "string" && updatePayload.licence.startsWith("data:image")) {
      if (hospital.licence) await this._imageService.deleteImage(hospital.licence);
      updatePayload.licence = await this._imageService.uploadImage(
        updatePayload.licence,
        "hospitals/licenses"
      );
    } else if (updatePayload.licence === "" && hospital.licence) {
      await this._imageService.deleteImage(hospital.licence);
      updatePayload.licence = "";
    } else if (files?.licence?.[0]) {
      if (hospital.licence) await this._imageService.deleteImage(hospital.licence);
      updatePayload.licence = await this._imageService.uploadImage(
        files.licence[0].buffer,
        "hospitals/licenses"
      );
    }
    const categories = ["landscape", "medicalTeam", "patientCare", "services"];
    updatePayload.images = { ...currentImages };
    for (const category of categories) {
      const currentUrls = currentImages[category] || [];
      const desiredState = desiredImages[category] || [];
      let finalState = [...desiredState];
      if (files?.[category]) {
        const uploadedUrls = await Promise.all(
          files[category].map(
            (file) => this._imageService.uploadImage(
              file.buffer,
              `hospitals/gallery/${category}`
            )
          )
        );
        finalState = [...finalState, ...uploadedUrls];
      }
      updatePayload.images[category] = await this._imageService.processGalleryUpdate(
        currentUrls,
        finalState,
        `hospitals/gallery/${category}`
      );
    }
    if (updatePayload.subscription && typeof updatePayload.subscription !== "string") {
      const subscription = updatePayload.subscription;
      if (subscription.plan) {
        const planDetails = await this._subscriptionRepo.findByPlanName(subscription.plan);
        if (planDetails) {
          const startDate = subscription.startDate ? new Date(subscription.startDate) : /* @__PURE__ */ new Date();
          subscription.startDate = startDate;
          subscription.endDate = this.calculateSubscriptionEndDate(
            startDate,
            planDetails.duration || 1,
            planDetails.durationUnit || "months"
          );
        }
      }
    }
    logger_default.info(`Updating hospital profile for ID: ${hospitalId}`);
    const updatedHospital = await this._hospitalRepo.update(
      hospitalId,
      updatePayload
    );
    return updatedHospital ? this._hospitalMapper.toDTO(updatedHospital) : null;
  }
  calculateSubscriptionEndDate(startDate, duration, unit) {
    const endDate = new Date(startDate);
    switch (unit) {
      case "days":
        endDate.setDate(endDate.getDate() + duration);
        break;
      case "months":
        endDate.setMonth(endDate.getMonth() + duration);
        break;
      case "years":
        endDate.setFullYear(endDate.getFullYear() + duration);
        break;
      default:
        endDate.setMonth(endDate.getMonth() + duration);
    }
    return endDate;
  }
};

// src/controllers/hospital/hospital/implementation/hospital.controller.ts
var HospitalController = class {
  constructor(_hospitalService) {
    this._hospitalService = _hospitalService;
  }
  async getHospitalProfile(req, res, next) {
    try {
      const user = req.user;
      const hospitalId = user.userId;
      const result = await this._hospitalService.getHospitalProfile(hospitalId);
      return ApiResponse.success(res, MESSAGES.ADMIN.FETCH_SUCCESS, result);
    } catch (error) {
      next(error);
    }
  }
  async getSelectedHospital(req, res, next) {
    try {
      const { id } = req.params;
      const { page, limit, search } = req.query;
      const result = await this._hospitalService.getSelectedHospital(
        id,
        page ? Number(page) : void 0,
        limit ? Number(limit) : void 0,
        search
      );
      return ApiResponse.success(res, MESSAGES.ADMIN.FETCH_SUCCESS, result);
    } catch (error) {
      next(error);
    }
  }
  async reapply(req, res, next) {
    try {
      const user = req.user;
      const hospitalId = user.userId;
      const result = await this._hospitalService.updateHospitalStatusReapply(hospitalId);
      return ApiResponse.success(res, "Re-application submitted successfully", result);
    } catch (error) {
      next(error);
    }
  }
  async updateHospital(req, res, next) {
    try {
      const user = req.user;
      const id = user.userId;
      const hospitalData = req.body;
      const files = req.files;
      const result = await this._hospitalService.updateHospital(id, hospitalData, files);
      return ApiResponse.success(res, MESSAGES.ADMIN.UPDATE_SUCCESS, result);
    } catch (error) {
      next(error);
    }
  }
};

// src/middleware/hospital.auth.middleware.ts
var HospitalAuthMiddleware = class {
  constructor(tokenService2, hospitalRepo) {
    this.tokenService = tokenService2;
    this.hospitalRepo = hospitalRepo;
    this.handle = async (req, res, next) => {
      try {
        const token = req.cookies?.accessToken;
        if (!token) {
          return res.status(401 /* UNAUTHORIZED */).json({ message: "Access token missing" });
        }
        const payload = this.tokenService.verifyAccessToken(token);
        if (payload.role !== "hospital") {
          return res.status(403 /* FORBIDDEN */).json({ message: "Insufficient permissions" });
        }
        const hospital = await this.hospitalRepo.findById(payload.userId);
        if (!hospital || hospital.isActive === false) {
          logger_default.warn(`Access denied: Hospital ${payload.userId} is inactive or not found.`);
          return res.status(403 /* FORBIDDEN */).json({ message: "Account is blocked or inactive" });
        }
        req.user = payload;
        next();
      } catch (error) {
        logger_default.error("Hospital auth middleware error:", error);
        return res.status(401 /* UNAUTHORIZED */).json({ message: "Invalid or expired token" });
      }
    };
  }
};

// src/controllers/patient/Patient.controller.ts
var PatientController = class {
  constructor(patientService) {
    this.patientService = patientService;
    this.getMe = async (req, res, next) => {
      try {
        const user = req.user;
        const userId = user?.userId;
        if (!userId) {
          ApiResponse.throwError(401 /* UNAUTHORIZED */, MESSAGES.AUTH.UNAUTHORIZED || "Unauthorized");
        }
        const patient = await this.patientService.getProfile(userId);
        return ApiResponse.success(res, MESSAGES.PATIENT.FETCH_SUCCESS, patient);
      } catch (error) {
        next(error);
      }
    };
    this.updatePatient = async (req, res, next) => {
      try {
        if (!req.user) {
          return ApiResponse.throwError(401 /* UNAUTHORIZED */, MESSAGES.AUTH.UNAUTHORIZED);
        }
        const id = req.user.userId;
        const updatedPatient = await this.patientService.updateProfile(id, req.body);
        return ApiResponse.success(res, MESSAGES.PATIENT.UPDATE_SUCCESS, updatedPatient);
      } catch (error) {
        next(error);
      }
    };
    this.getAllPatient = async (req, res, next) => {
      try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const search = req.query.search || "";
        const result = await this.patientService.getAllPatient({ page, limit, search });
        return ApiResponse.success(res, MESSAGES.PATIENT.FETCH_SUCCESS, result.data, 200 /* OK */, {
          page,
          limit,
          totalItems: result.total,
          totalPages: Math.ceil(result.total / limit)
        });
      } catch (error) {
        next(error);
      }
    };
    this.getHospitals = async (req, res, next) => {
      try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 6;
        const search = req.query.search || "";
        const location = req.query.location || "";
        const result = await this.patientService.gethospitals(page, limit, search, location);
        return ApiResponse.success(res, MESSAGES.ADMIN.FETCH_SUCCESS, {
          hospitals: result.data,
          totalPages: Math.ceil(result.total / limit)
        });
      } catch (error) {
        next(error);
      }
    };
    this.changePassword = async (req, res, next) => {
      try {
        if (!req.user) {
          return ApiResponse.throwError(401 /* UNAUTHORIZED */, MESSAGES.AUTH.UNAUTHORIZED);
        }
        const id = req.user.userId;
        const { currentPassword, newPassword } = req.body;
        await this.patientService.changePassword(id, currentPassword, newPassword);
        return ApiResponse.success(res, "Password changed successfully");
      } catch (error) {
        next(error);
      }
    };
    this.selectedHospital = async (req, res, next) => {
      try {
        const { id } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6;
        const search = req.query.search || "";
        const hospital = await this.patientService.selectedHospital(id, page, limit, search);
        return ApiResponse.success(res, MESSAGES.ADMIN.FETCH_SUCCESS, hospital);
      } catch (error) {
        next(error);
      }
    };
    this.getdepartments = async (req, res, next) => {
      try {
        logger_default.debug("Fetching departments in PatientController");
      } catch (error) {
        next(error);
      }
    };
    this.getDoctorDepartment = async (req, res, next) => {
      try {
        const { id } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6;
        const search = req.query.search || "";
        const doctor = await this.patientService.getDoctorDepartment(id, page, limit, search);
        return ApiResponse.success(res, MESSAGES.DOCTOR.FETCH_SUCCESS, doctor);
      } catch (error) {
        next(error);
      }
    };
    this.getDoctorById = async (req, res, next) => {
      try {
        const { id } = req.params;
        const doctor = await this.patientService.getDoctorById(id);
        return ApiResponse.success(res, MESSAGES.DOCTOR.FETCH_SUCCESS, doctor);
      } catch (error) {
        next(error);
      }
    };
    this.getAvailableSlots = async (req, res, next) => {
      try {
        const { doctorId } = req.params;
        const { date } = req.query;
        const slots = await this.patientService.getAvailableSlots(doctorId, date);
        return ApiResponse.success(res, "Slots fetched successfully", slots);
      } catch (error) {
        next(error);
      }
    };
    this.bookAppointment = async (req, res, next) => {
      try {
        const user = req.user;
        const patientId = user?.userId;
        if (!patientId) {
          return ApiResponse.throwError(401 /* UNAUTHORIZED */, MESSAGES.AUTH.UNAUTHORIZED || "Unauthorized");
        }
        console.log(patientId, req.body);
        await this.patientService.bookAppointment(patientId, req.body);
        return ApiResponse.success(res, "Appointment booked successfully", null, 201 /* CREATED */);
      } catch (error) {
        next(error);
      }
    };
    this.checkDuplicateAppointment = async (req, res, next) => {
      try {
        const { doctorId, date, patient } = req.body;
        const duplicate = await this.patientService.checkDuplicateAppointment(doctorId, date, patient);
        return ApiResponse.success(res, "Duplicate check completed", duplicate);
      } catch (error) {
        next(error);
      }
    };
    this.getAppoimentHistory = async (req, res, next) => {
      try {
        if (!req.user) {
          return ApiResponse.throwError(401 /* UNAUTHORIZED */, MESSAGES.AUTH.UNAUTHORIZED);
        }
        const patientId = req.user.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const search = req.query.search || "";
        if (!patientId) {
          return ApiResponse.throwError(401 /* UNAUTHORIZED */, MESSAGES.AUTH.UNAUTHORIZED);
        }
        const result = await this.patientService.getAppoimentHistory(patientId, { page, limit, search });
        return ApiResponse.success(res, "Appointment history fetched successfully", result.data, 200 /* OK */, {
          page,
          limit,
          totalItems: result.total,
          totalPages: Math.ceil(result.total / limit)
        });
      } catch (error) {
        next(error);
      }
    };
    this.getTodayAppointments = async (req, res, next) => {
      try {
        const user = req.user;
        const patientId = user?.userId;
        if (!patientId) {
          return ApiResponse.throwError(401 /* UNAUTHORIZED */, MESSAGES.AUTH.UNAUTHORIZED);
        }
        const { date } = req.query;
        const appointments = await this.patientService.getTodayAppointments(patientId, date);
        console.log(appointments);
        return ApiResponse.success(res, "Today's appointments fetched successfully", appointments);
      } catch (error) {
        next(error);
      }
    };
    this.appoinmentCancel = async (req, res, next) => {
      try {
        const id = req.params.id;
        const { reason } = req.body;
        await this.patientService.cancelAppointment({ id, reason });
        return ApiResponse.success(res, MESSAGES.UPDATION.UPDATE);
      } catch (error) {
        next(error);
      }
    };
    this.checkAppointmentStatus = async (req, res, next) => {
      try {
        const { sessionId } = req.params;
        const exists = await this.patientService.checkAppointmentStatus(sessionId);
        return ApiResponse.success(res, "Appointment status checked", { exists });
      } catch (error) {
        next(error);
      }
    };
    this.getPrescriptions = async (req, res, next) => {
      try {
        const user = req.user;
        const patientId = user?.userId;
        if (!patientId) {
          return ApiResponse.throwError(401 /* UNAUTHORIZED */, MESSAGES.AUTH.UNAUTHORIZED);
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const search = req.query.search || "";
        const result = await this.patientService.getPrescriptions(patientId, { page, limit, search });
        return ApiResponse.success(res, "Prescriptions fetched successfully", result.data, 200 /* OK */, {
          page,
          limit,
          totalItems: result.total,
          totalPages: Math.ceil(result.total / limit)
        });
      } catch (error) {
        next(error);
      }
    };
    this.getDoctorFee = async (req, res, next) => {
      try {
        const { doctorId } = req.params;
        const fee = await this.patientService.getDoctorFee(doctorId);
        return ApiResponse.success(res, "Doctor fee fetched successfully", { fee });
      } catch (error) {
        next(error);
      }
    };
    this.getWallet = async (req, res, next) => {
      try {
        const user = req.user;
        const patientId = user?.userId;
        if (!patientId) {
          return ApiResponse.throwError(401 /* UNAUTHORIZED */, MESSAGES.AUTH.UNAUTHORIZED);
        }
        const wallet = await this.patientService.getWallet(patientId);
        return ApiResponse.success(res, "Wallet fetched successfully", wallet);
      } catch (error) {
        next(error);
      }
    };
    this.addToWallet = async (req, res, next) => {
      try {
        const user = req.user;
        const patientId = user?.userId;
        if (!patientId) {
          return ApiResponse.throwError(401 /* UNAUTHORIZED */, MESSAGES.AUTH.UNAUTHORIZED);
        }
        const { amount } = req.body;
        await this.patientService.addToWallet(patientId, amount);
        return ApiResponse.success(res, "Amount added to wallet successfully");
      } catch (error) {
        next(error);
      }
    };
    this.withdrawFromWallet = async (req, res, next) => {
      try {
        const user = req.user;
        const patientId = user?.userId;
        if (!patientId) {
          return ApiResponse.throwError(401 /* UNAUTHORIZED */, MESSAGES.AUTH.UNAUTHORIZED);
        }
        const { amount } = req.body;
        await this.patientService.withdrawFromWallet(patientId, amount);
        return ApiResponse.success(res, "Amount withdrawn from wallet successfully");
      } catch (error) {
        next(error);
      }
    };
    this.getLocations = async (req, res, next) => {
      try {
        const locations = await this.patientService.getLocations();
        return ApiResponse.success(res, "Locations fetched successfully", locations);
      } catch (error) {
        next(error);
      }
    };
  }
};
var Patient_controller_default = PatientController;

// src/middleware/patient.auth.middleware.ts
var PatientAuthMiddleware = class {
  constructor(_tokenService, _userRepo) {
    this._tokenService = _tokenService;
    this._userRepo = _userRepo;
    this.handle = async (req, res, next) => {
      try {
        const token = req.cookies?.accessToken;
        if (!token) {
          return res.status(401 /* UNAUTHORIZED */).json({ message: "Access token missing" });
        }
        const payload = this._tokenService.verifyAccessToken(token);
        if (payload.role !== "patient") {
          logger_default.warn(`Attempted patient access by role: ${payload.role}`);
          return res.status(403 /* FORBIDDEN */).json({ message: "Insufficient permissions" });
        }
        const user = await this._userRepo.findById(payload.userId);
        if (!user || user.isActive === false) {
          return res.status(403 /* FORBIDDEN */).json({ message: "Account is blocked" });
        }
        req.user = payload;
        next();
      } catch (error) {
        logger_default.error("Patient auth middleware error:", error);
        return res.status(401 /* UNAUTHORIZED */).json({ message: "Invalid or expired token" });
      }
    };
  }
};

// src/services/patient/implementations/patient.service.ts
import { MongoServerError } from "mongodb";
import bcrypt7 from "bcryptjs";
import mongoose16, { Types as Types23 } from "mongoose";
var PatientService = class {
  constructor(_userRepo, _hospitalRepo, _departmentRepo, _doctorRepo, _appointmentRepo, _qualificationRepo, _specializationRepo, _subscriptionRepo, _patientMapper, _hospitalMapper, _doctorMapper, _appointmentMapper, _priscriptionRepo, _prescriptionMapper, _slotreppo, _slotemapper, _HospitalDoctorConfigRepo, _walletRepository) {
    this._userRepo = _userRepo;
    this._hospitalRepo = _hospitalRepo;
    this._departmentRepo = _departmentRepo;
    this._doctorRepo = _doctorRepo;
    this._appointmentRepo = _appointmentRepo;
    this._qualificationRepo = _qualificationRepo;
    this._specializationRepo = _specializationRepo;
    this._subscriptionRepo = _subscriptionRepo;
    this._patientMapper = _patientMapper;
    this._hospitalMapper = _hospitalMapper;
    this._doctorMapper = _doctorMapper;
    this._appointmentMapper = _appointmentMapper;
    this._priscriptionRepo = _priscriptionRepo;
    this._prescriptionMapper = _prescriptionMapper;
    this._slotreppo = _slotreppo;
    this._slotemapper = _slotemapper;
    this._HospitalDoctorConfigRepo = _HospitalDoctorConfigRepo;
    this._walletRepository = _walletRepository;
    this.getPrescriptions = async (patientId, query) => {
      const patient = await this._userRepo.findById(patientId);
      if (!patient) {
        ApiResponse.throwError(
          404 /* NOT_FOUND */,
          MESSAGES.PATIENT.NOT_FOUND
        );
      }
      const result = await this._priscriptionRepo.findPrescriptionsPaginated({
        email: patient.email,
        page: query.page,
        limit: query.limit,
        search: query.search
      });
      return {
        data: result.data.map((rx) => this._prescriptionMapper.toDTO(rx)),
        total: result.total,
        page: result.page,
        limit: result.limit
      };
    };
    this.getDoctorFee = async (doctorId) => {
      const doctor = await this._HospitalDoctorConfigRepo.findOne({ doctorId });
      if (!doctor) {
        ApiResponse.throwError(404 /* NOT_FOUND */, MESSAGES.DOCTOR.NOT_FOUND);
      }
      return { doctorFee: doctor.doctorFee, hospitalCommission: doctor.hospitalCommission };
    };
  }
  async getProfile(userId) {
    const patient = await this._userRepo.findById(userId);
    if (!patient) {
      ApiResponse.throwError(404 /* NOT_FOUND */, MESSAGES.PATIENT.NOT_FOUND);
    }
    return this._patientMapper.toDTO(patient);
  }
  async updateProfile(id, data) {
    const updated = await this._userRepo.update(id, data);
    if (!updated) {
      ApiResponse.throwError(404 /* NOT_FOUND */, MESSAGES.PATIENT.NOT_FOUND);
    }
    return this._patientMapper.toDTO(updated);
  }
  async getAllPatient(query) {
    const result = await this._userRepo.findWithPagination({
      page: query.page,
      limit: query.limit,
      search: query.search,
      searchFields: ["name", "email", "phone"]
    });
    return {
      data: result.data.map((p) => this._patientMapper.toDTO(p)),
      total: result.total
    };
  }
  async gethospitals(page, limit, search, location) {
    const filter = { isActive: true, reviewStatus: "approved" };
    if (location) {
      filter.address = location;
    }
    const result = await this._hospitalRepo.findWithPagination({
      page,
      limit,
      search,
      searchFields: ["hospitalName", "address", "email"],
      filter
    });
    return {
      ...result,
      data: result.data.map((h) => this._hospitalMapper.toDTO(h))
    };
  }
  async changePassword(id, current, newP) {
    const patient = await this._userRepo.findByIdWithPassword(id);
    if (!patient) {
      ApiResponse.throwError(404 /* NOT_FOUND */, MESSAGES.PATIENT.NOT_FOUND);
    }
    const isMatch = await bcrypt7.compare(current, patient.password);
    if (!isMatch) {
      ApiResponse.throwError(400 /* BAD_REQUEST */, "Current password does not match");
    }
    const salt = await bcrypt7.genSalt(10);
    const hashedPassword = await bcrypt7.hash(newP, salt);
    await this._userRepo.update(id, { password: hashedPassword });
  }
  async selectedHospital(id, page = 1, limit = 6, search = "") {
    const hospital = await this._hospitalRepo.findById(id);
    if (!hospital) {
      ApiResponse.throwError(404 /* NOT_FOUND */, MESSAGES.ADMIN.NOT_FOUND);
    }
    const [departmentsResult, qualifications, specializations] = await Promise.all([
      this._departmentRepo.findByHospitalId(id, page, limit, search),
      this._qualificationRepo.findByHospitalId(id),
      this._specializationRepo.findByHospitalId(id)
    ]);
    const departmentsWithCounts = await Promise.all(
      departmentsResult.data.map(async (dept) => {
        const d = dept.toObject ? dept.toObject() : dept;
        const doctorCount = await this._doctorRepo.countByDepartment(id, d._id.toString());
        return {
          ...d,
          _id: d._id.toString(),
          doctorCount
        };
      })
    );
    const formattedQualifications = qualifications.map((q) => {
      const obj = q.toObject ? q.toObject() : q;
      return {
        _id: obj._id.toString(),
        name: String(obj.name || ""),
        qualificationName: String(obj.qualificationName || obj.abbreviation || ""),
        description: obj.description || "",
        image: obj.image || ""
      };
    });
    const formattedSpecializations = specializations.map((s) => {
      const obj = s.toObject ? s.toObject() : s;
      return {
        _id: obj._id.toString(),
        name: String(obj.name || ""),
        description: obj.description || "",
        image: obj.image || "",
        department_id: obj.department_id.toString()
      };
    });
    const hospitalData = hospital.toObject();
    const selectedHospitalData = {
      ...hospitalData,
      _id: hospitalData._id.toString(),
      departments: departmentsWithCounts,
      qualifications: formattedQualifications,
      specializations: formattedSpecializations,
      totalDepartments: departmentsResult.total,
      currentPage: page,
      totalPages: Math.ceil(departmentsResult.total / limit)
    };
    return SelectedHospitalSchema.parse(selectedHospitalData);
  }
  async getDoctorDepartment(id, page, limit, search) {
    const deptId = new mongoose16.Types.ObjectId(id);
    const result = await this._doctorRepo.findWithPagination({
      page,
      limit,
      search,
      searchFields: ["name", "specialization"],
      filter: {
        isActive: true,
        reviewStatus: "approved",
        $or: [
          { department: id },
          { department_id: deptId }
        ]
      }
    });
    return {
      ...result,
      data: result.data.map((d) => this._doctorMapper.toDTO(d))
    };
  }
  async getDoctorById(id) {
    const doctor = await this._doctorRepo.findById(id);
    if (!doctor) {
      ApiResponse.throwError(404 /* NOT_FOUND */, MESSAGES.DOCTOR.NOT_FOUND);
    }
    return this._doctorMapper.toDTO(doctor);
  }
  async getAvailableSlots(doctorId, date) {
    const [year, month, day] = date.split("-").map(Number);
    const utcDate = new Date(Date.UTC(year, month - 1, day));
    const dayOfWeek = utcDate.getUTCDay();
    const [availableSlots, { appointments, total }] = await Promise.all([
      this._slotreppo.findByDoctorId(doctorId),
      this._appointmentRepo.findByDoctorAndDate(doctorId, date)
    ]);
    const filteredSlots = availableSlots.filter((slot) => {
      if (!slot.isActive) return false;
      if (!slot.daysOfWeek.includes(dayOfWeek)) return false;
      if (slot.validFrom) {
        const validFromDate = new Date(slot.validFrom);
        const validFromUTC = new Date(Date.UTC(
          validFromDate.getUTCFullYear(),
          validFromDate.getUTCMonth(),
          validFromDate.getUTCDate()
        ));
        if (utcDate < validFromUTC) return false;
      }
      if (slot.validUntil) {
        const validUntilDate = new Date(slot.validUntil);
        const validUntilUTC = new Date(Date.UTC(
          validUntilDate.getUTCFullYear(),
          validUntilDate.getUTCMonth(),
          validUntilDate.getUTCDate()
        ));
        if (utcDate > validUntilUTC) return false;
      }
      return true;
    });
    const slotDTOs = this._slotemapper.toDTOList(filteredSlots);
    return {
      slots: slotDTOs,
      appointments,
      total
    };
  }
  async bookAppointment(patientId, data) {
    const { doctorId, appointmentDate, patientDetails, hospitalId, session, totalAmount } = data;
    if (!doctorId || !appointmentDate || !patientDetails || !hospitalId || !session) {
      ApiResponse.throwError(400 /* BAD_REQUEST */, "Missing required appointment details");
    }
    if (totalAmount !== void 0 && totalAmount > 0) {
      logger_default.info(`[PatientService] Processing payment-related wallet updates for amount: ${totalAmount}`);
      const doctorObjectId = new Types23.ObjectId(
        typeof doctorId === "object" ? doctorId._id : doctorId
      );
      const hospitalObjectId = new Types23.ObjectId(
        typeof hospitalId === "object" ? hospitalId._id : hospitalId
      );
      const findhospitalWallate = await this._walletRepository.findOne({
        ownerId: hospitalObjectId
      });
      const config = await this._HospitalDoctorConfigRepo.findOne({
        hospitalId: hospitalObjectId,
        doctorId: doctorObjectId
      });
      if (!config) {
        logger_default.error(`[PatientService] Config not found for hospital: ${hospitalObjectId} and doctor: ${doctorObjectId}`);
        throw new Error("Hospital-Doctor configuration not found");
      }
      const doctorFee = config.doctorFee || 0;
      const commissionPercent = config.hospitalCommission || 0;
      const hospitalAmount = doctorFee * commissionPercent / 100;
      const doctorAmount = doctorFee;
      const finalAmount = hospitalAmount + doctorAmount;
      if (!findhospitalWallate) {
        await this._walletRepository.create({
          ownerId: hospitalObjectId
        });
      }
      await this._walletRepository.creditWallet(hospitalId.toString(), finalAmount);
    }
    const dateObj = new Date(appointmentDate);
    const istOffset = 5.5 * 60 * 60 * 1e3;
    const istDate = new Date(dateObj.getTime() + istOffset);
    const dayOfWeek = istDate.getUTCDay();
    const doctorSchedules = await this._slotreppo.findByDoctorId(doctorId.toString());
    const selectedSchedule = doctorSchedules.find(
      (s) => s.session === session && s.isActive && s.daysOfWeek.includes(dayOfWeek)
    );
    if (!selectedSchedule) {
      ApiResponse.throwError(400 /* BAD_REQUEST */, `No ${session} session available`);
    }
    const mongoSession = await mongoose16.startSession();
    try {
      for (let attempt = 0; attempt < 3; attempt++) {
        mongoSession.startTransaction();
        try {
          const duplicate = await this._appointmentRepo.findDuplicate(
            doctorId.toString(),
            dateObj,
            patientDetails,
            mongoSession
          );
          if (duplicate) {
            ApiResponse.throwError(409 /* CONFLICT */, MESSAGES.PATIENT.ALREADYBOOKED);
          }
          const sessionBookedCount = await this._appointmentRepo.countByDoctorDateAndSession(
            doctorId.toString(),
            dateObj,
            session,
            mongoSession
          );
          if (sessionBookedCount >= selectedSchedule.tokenPerDay) {
            ApiResponse.throwError(
              400 /* BAD_REQUEST */,
              `No more slots available for ${session}`
            );
          }
          const tokenNumber = sessionBookedCount + 1;
          const [startHour, startMinute] = selectedSchedule.startTime.split(":").map(Number);
          const startMinutes = startHour * 60 + (startMinute || 0);
          const visitMinutes = startMinutes + sessionBookedCount * selectedSchedule.slotDuration;
          const visitHour = Math.floor(visitMinutes / 60);
          const visitMin = visitMinutes % 60;
          const visitTime = `${visitHour.toString().padStart(2, "0")}:${visitMin.toString().padStart(2, "0")}`;
          const endMinutes = visitMinutes + selectedSchedule.slotDuration;
          const endHour = Math.floor(endMinutes / 60);
          const endMin = endMinutes % 60;
          const slotEndTime = `${endHour.toString().padStart(2, "0")}:${endMin.toString().padStart(2, "0")}`;
          const appointmentData = { ...data };
          if (appointmentData.bloodPressure === "") delete appointmentData.bloodPressure;
          if (appointmentData.heartRate === "") delete appointmentData.heartRate;
          if (appointmentData.weight === "") delete appointmentData.weight;
          if (totalAmount === void 0) {
            appointmentData.paymentstatus = "pending";
          } else {
            appointmentData.paymentstatus = "paid";
          }
          const result = await this._appointmentRepo.create(
            {
              ...appointmentData,
              bookedBy: new Types23.ObjectId(patientId),
              tokenNumber,
              visitTime,
              slotStartTime: visitTime,
              slotEndTime,
              status: "pending" /* PENDING */
            },
            mongoSession
          );
          await this._userRepo.addHospital(
            patientId,
            hospitalId.toString(),
            mongoSession
          );
          await mongoSession.commitTransaction();
          logger_default.info(`[PatientService] Appointment successfully booked with Token: ${tokenNumber}`);
          return;
        } catch (error) {
          await mongoSession.abortTransaction();
          if (error instanceof MongoServerError && error.code === 11e3) {
            console.log("Token conflict, retrying...");
            continue;
          }
          throw error;
        }
      }
      ApiResponse.throwError(409 /* CONFLICT */, "High traffic, please try again");
    } finally {
      mongoSession.endSession();
    }
  }
  async checkDuplicateAppointment(doctorId, date, patient) {
    const dateObj = new Date(date);
    const result = await this._appointmentRepo.findDuplicate(doctorId, dateObj, patient);
    return result ? this._appointmentMapper.toDTO(result) : null;
  }
  async getAppoimentHistory(patientId, query) {
    const result = await this._appointmentRepo.findPatientAppointments(patientId, query);
    return {
      data: result.appointments.map((a) => this._appointmentMapper.toDTO(a)),
      total: result.total
    };
  }
  async getTodayAppointments(patientId, date) {
    const result = await this._appointmentRepo.findPatientAppointmentsToday(patientId, date);
    return result.map((a) => this._appointmentMapper.toDTO(a));
  }
  async cancelAppointment(data) {
    const updated = await this._appointmentRepo.update(data.id, {
      status: "processing" /* PROCESSING */,
      cancelRequest: true,
      cancelReason: data.reason
    });
    if (!updated) {
      ApiResponse.throwError(404 /* NOT_FOUND */, "Appointment not found");
    }
  }
  async checkAppointmentStatus(sessionId) {
    const appointment = await this._appointmentRepo.findByPaymentId(sessionId);
    return !!appointment;
  }
  async getWallet(patientId) {
    const wallet = await this._walletRepository.findOne({
      ownerId: new Types23.ObjectId(patientId)
    });
    if (!wallet) {
      return {
        balance: 0,
        totalenrnings: 0,
        totalwithdrawn: 0,
        Transaction: []
      };
    }
    return {
      balance: wallet.balance,
      totalenrnings: wallet.totalearnings || 0,
      totalwithdrawn: wallet.totalwithdrawn || 0,
      Transaction: (wallet.Transaction || []).map((tx) => ({
        amount: tx.amount,
        type: tx.type,
        date: tx.date.toISOString()
      }))
    };
  }
  async addToWallet(patientId, amount) {
    await this._walletRepository.creditWallet(patientId, amount);
  }
  async withdrawFromWallet(patientId, amount) {
    const wallet = await this._walletRepository.findOne({ ownerId: new Types23.ObjectId(patientId) });
    if (!wallet) {
      ApiResponse.throwError(404 /* NOT_FOUND */, MESSAGES.WALLET.NOT_FOUND);
    }
    await this._walletRepository.debitWallet(patientId, amount);
  }
  async getLocations() {
    const locations = await this._hospitalRepo.findWithPagination({
      page: 1,
      limit: 1e3,
      search: "",
      searchFields: ["address"],
      filter: { isActive: true, reviewStatus: "approved" }
    });
    const uniqueLocations = Array.from(new Set(locations.data.map((h) => h.address).filter(Boolean)));
    return uniqueLocations;
  }
};

// src/services/patient/implementations/livetoken.service.ts
import { Types as Types24 } from "mongoose";
var LiveTokenService = class {
  constructor(_appointmentRepo, _liveTokenMapper) {
    this._appointmentRepo = _appointmentRepo;
    this._liveTokenMapper = _liveTokenMapper;
  }
  async getPatientLiveToken(patientId, doctorId) {
    let targetDoctorId = doctorId;
    if (!targetDoctorId) {
      targetDoctorId = await this._appointmentRepo.findDoctorByPatientToday(patientId) || void 0;
    }
    if (!targetDoctorId) {
      return null;
    }
    const liveAppointment = await this._appointmentRepo.findLiveToken(targetDoctorId);
    const patientAppointments = await this._appointmentRepo.findPatientAppointmentsToday(patientId);
    const patientAppointment = patientAppointments.find((app2) => {
      const docId = app2.doctorId instanceof Types24.ObjectId ? app2.doctorId.toString() : app2.doctorId._id.toString();
      return docId === targetDoctorId;
    });
    if (!patientAppointment) {
      return null;
    }
    const doctor = patientAppointment.doctorId;
    const data = {
      currentLiveToken: liveAppointment ? liveAppointment.tokenNumber : 0,
      patientTokenNumber: patientAppointment.tokenNumber,
      doctorName: doctor.name || "Unknown Doctor",
      appointmentId: patientAppointment._id.toString()
    };
    return this._liveTokenMapper.toDTO(data);
  }
};

// src/dto/patient/livetoken-response.dto.ts
import { z as z15 } from "zod";
var LiveTokenResponseSchema = z15.object({
  currentLiveToken: z15.number(),
  patientTokenNumber: z15.number(),
  doctorName: z15.string(),
  appointmentId: z15.string()
});

// src/mappers/livetoken.mapper.ts
var LiveTokenMapper = class {
  toDTO(data) {
    return LiveTokenResponseSchema.parse(data);
  }
};

// src/models/subscription.ts
import mongoose17, { Schema as Schema15 } from "mongoose";
var SubscriptionSchema = new Schema15(
  {
    planName: {
      type: String,
      required: true
    },
    duration: {
      type: Number,
      required: true
    },
    durationUnit: {
      type: String,
      enum: ["months", "years"],
      default: "months"
    },
    description: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ["active", "expired", "cancelled"],
      default: "active"
    }
  },
  {
    timestamps: true
  }
);
var SubscriptionModel = mongoose17.model(
  "Subscription",
  SubscriptionSchema
);

// src/repositories/superAdmin/subscription/implements/subscription.repository.ts
var SubscriptionRepository = class extends BaseRepository {
  constructor() {
    super(SubscriptionModel);
  }
  buildQuery(search, status) {
    const query = {};
    if (search && search.trim() !== "") {
      query.$or = [
        { planName: { $regex: search, $options: "i" } }
      ];
    }
    if (status && status !== "All") {
      const normalizedStatus = status.toLowerCase();
      if (normalizedStatus === "active") {
        query.status = "active";
      } else if (normalizedStatus === "inactive") {
        query.status = { $in: ["expired", "cancelled"] };
      } else if (normalizedStatus === "expired" || normalizedStatus === "cancelled") {
        query.status = normalizedStatus;
      }
    }
    return query;
  }
  async findAllWithPagination(skip, limit, search, status) {
    const query = this.buildQuery(search, status);
    return await SubscriptionModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }).exec();
  }
  async count(search, status) {
    const query = this.buildQuery(search, status);
    return await SubscriptionModel.countDocuments(query).exec();
  }
  async updateById(id, updateData) {
    return await SubscriptionModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).exec();
  }
  async findByPlanName(planName) {
    return await SubscriptionModel.findOne({
      planName: { $regex: new RegExp(`^${planName}$`, "i") },
      status: "active"
    }).exec();
  }
  async updateExpiredSubscription() {
    const now = /* @__PURE__ */ new Date();
    await HospitalModel.updateMany(
      {
        "subscription.endDate": { $lt: now },
        "subscription.status": "active"
      },
      {
        $set: { "subscription.status": "expired" }
      }
    );
  }
  async findHospitalWithSubscrib(skip, limit, search, filter) {
    await this.updateExpiredSubscription();
    const query = { ...filter, reviewStatus: "approved" };
    if (search && search.trim() !== "") {
      query.hospitalName = { $regex: search, $options: "i" };
    }
    return HospitalModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }).exec();
  }
};

// src/controllers/patient/LiveToken.controller.ts
var LiveTokenController = class {
  constructor(_liveTokenService) {
    this._liveTokenService = _liveTokenService;
    this.getToken = async (req, res, next) => {
      try {
        const user = req.user;
        const patientId = user?.userId;
        const doctorId = req.query.doctorId;
        if (!patientId) {
          return ApiResponse.unauthorized(res, "Patient not authenticated");
        }
        const liveToken2 = await this._liveTokenService.getPatientLiveToken(patientId, doctorId);
        console.log(liveToken2);
        if (!liveToken2) {
          return ApiResponse.success(
            res,
            "No active consultation found for you today",
            null,
            200 /* OK */
          );
        }
        return ApiResponse.success(
          res,
          "Live token fetched successfully",
          liveToken2,
          200 /* OK */
        );
      } catch (error) {
        next(error);
      }
    };
  }
};

// src/di/patient.di.ts
var patientContainer = () => {
  const tokenService2 = new TokenService();
  const userRepository = new UserRepository(Patient);
  const hospitalRepository = new HospitalRepository(HospitalModel);
  const departmentRepository = new DepartmentRepository(department_model_default);
  const doctorRepository = new DoctorRepository(DoctorModel);
  const appointmentRepository = new AppointmentRepository();
  const qualificationRepository = new QualificationRepository(qualification_model_default);
  const specializationRepository = new SpecializationRepository();
  const subscriptionRepository = new SubscriptionRepository();
  const liveTokenMapper = new LiveTokenMapper();
  const patientMapper = new PatientMapper();
  const hospitalMapper = new HospitalMapper();
  const doctorMapper = new DoctorMapper();
  const walletRepository = new WalletRepository(Wallet);
  const appointmentMapper = new AppointmentMapper();
  const prescriptionMapper = new PrescriptionMapper();
  const priscriptionRepo = new PrescriptionRepository(prescription_model_default);
  const slotReppo = new SlotRepository(DoctorScheduleModel);
  const slotmapper = new SlotMapper();
  const HospitalDoctorConfigRepo = new HospitalDoctorConfigRepository();
  const patientService = new PatientService(
    userRepository,
    hospitalRepository,
    departmentRepository,
    doctorRepository,
    appointmentRepository,
    qualificationRepository,
    specializationRepository,
    subscriptionRepository,
    patientMapper,
    hospitalMapper,
    doctorMapper,
    appointmentMapper,
    priscriptionRepo,
    prescriptionMapper,
    slotReppo,
    slotmapper,
    HospitalDoctorConfigRepo,
    walletRepository
  );
  const patientController2 = new Patient_controller_default(patientService);
  const patientAuthMiddleware3 = new PatientAuthMiddleware(tokenService2, userRepository);
  const liveTokenService = new LiveTokenService(appointmentRepository, liveTokenMapper);
  const liveToken2 = new LiveTokenController(liveTokenService);
  return {
    tokenService: tokenService2,
    patientController: patientController2,
    patientService,
    patientAuthMiddleware: patientAuthMiddleware3,
    liveToken: liveToken2
  };
};

// src/services/hospital/subscription/implementation/subscription.service.ts
import { Types as Types25 } from "mongoose";
var HospitalSubscriptionService = class {
  constructor(subscriptionRepository, hospitalRepository, doctorRepository, departmentRepository, userRepository, subscriptionMapper) {
    this.subscriptionRepository = subscriptionRepository;
    this.hospitalRepository = hospitalRepository;
    this.doctorRepository = doctorRepository;
    this.departmentRepository = departmentRepository;
    this.userRepository = userRepository;
    this.subscriptionMapper = subscriptionMapper;
  }
  async getActiveSubscriptions(page, limit, search) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.subscriptionRepository.findAllWithPagination(skip, limit, search, "active"),
      this.subscriptionRepository.count(search, "active")
    ]);
    return {
      data: data.map(
        (s) => this.subscriptionMapper.toDTO(s)
      ),
      total
    };
  }
  async checkSubscriptionLimit(hospitalId, type) {
    const hospital = await this.hospitalRepository.findById(hospitalId);
    console.log(type);
    if (!hospital) {
      ApiResponse.throwError(404 /* NOT_FOUND */, "Hospital not found");
    }
    const subscription = hospital.subscription;
    if (!subscription || !subscription.plan) {
      ApiResponse.throwError(402 /* PAYMENT_REQUIRED */, "No active subscription plan found. Please subscribe to continue.");
    }
    const currentDate = /* @__PURE__ */ new Date();
    const isExpiredStatus = subscription.status === "expired";
    const isPastEndDate = subscription.endDate && new Date(subscription.endDate) < currentDate;
    if (isExpiredStatus || isPastEndDate) {
      ApiResponse.throwError(402 /* PAYMENT_REQUIRED */, "Your subscription has expired. Please renew your plan to continue.");
    }
    const planName = subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1);
    const planDetails = await this.subscriptionRepository.findByPlanName(planName);
    console.log(planDetails);
  }
  async protection(hospitalId) {
    const hospital = await this.hospitalRepository.findById(hospitalId);
    if (!hospital) {
      ApiResponse.throwError(404, "Hospital not found");
    }
    const subscription = hospital.subscription;
    if (!subscription) return false;
    if (!subscription.endDate) return false;
    const now = /* @__PURE__ */ new Date();
    const endDate = new Date(subscription.endDate);
    if (subscription.status !== "active") return false;
    if (now > endDate) return false;
    return true;
  }
  async getCurrentSubscription(hospitalId) {
    const hospital = await this.hospitalRepository.findById(hospitalId);
    if (!hospital) {
      ApiResponse.throwError(404 /* NOT_FOUND */, "Hospital not found");
    }
    const subscription = hospital.subscription;
    if (!subscription) {
      return null;
    }
    if (subscription.endDate && /* @__PURE__ */ new Date() > new Date(subscription.endDate) && subscription.status === "active") {
      subscription.status = "expired";
    }
    return subscription;
  }
  async downgradeSubscription(hospitalId, newPlanId) {
    const hospital = await this.hospitalRepository.findById(hospitalId);
    if (!hospital) {
      ApiResponse.throwError(404 /* NOT_FOUND */, "Hospital not found");
    }
    const newPlan = await this.subscriptionRepository.findById(newPlanId);
    if (!newPlan) {
      ApiResponse.throwError(404 /* NOT_FOUND */, "Subscription plan not found");
    }
    if (!hospital.subscription || hospital.subscription.status !== "active") {
      ApiResponse.throwError(400 /* BAD_REQUEST */, "Cannot downgrade inactive subscription");
    }
    await this.hospitalRepository.update(hospitalId, {
      subscription: {
        ...hospital.subscription,
        pendingPlanId: new Types25.ObjectId(newPlanId),
        pendingPlanName: newPlan.planName,
        pendingActivationDate: hospital.subscription.endDate,
        upgradeType: "downgrade"
      }
    });
  }
};

// src/controllers/hospital/subscription/implementation/subscription.controller.ts
var HospitalSubscriptionController = class {
  constructor(subscriptionService) {
    this.subscriptionService = subscriptionService;
  }
  async getActiveSubscriptions(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 6;
      const search = req.query.search || "";
      const result = await this.subscriptionService.getActiveSubscriptions(page, limit, search);
      ApiResponse.success(res, "success", result);
    } catch (error) {
      next(error);
    }
  }
  async protection(req, res, next) {
    try {
      const hospitalId = req.user?.userId;
      if (!hospitalId) {
        ApiResponse.unauthorized(res, "Hospital ID not found");
        return;
      }
      const result = await this.subscriptionService.protection(hospitalId);
      ApiResponse.success(res, "Subscription status fetched", result);
    } catch (error) {
      next(error);
    }
  }
  async downgradeSubscription(req, res, next) {
    try {
      const hospitalId = req.user?.userId;
      const { newPlanId } = req.body;
      if (!hospitalId) {
        ApiResponse.unauthorized(res, "Hospital ID not found");
        return;
      }
      if (!newPlanId) {
        ApiResponse.error(res, "New Plan ID is required", null, 400);
        return;
      }
      await this.subscriptionService.downgradeSubscription(hospitalId, newPlanId);
      ApiResponse.success(res, "Subscription downgrade scheduled successfully");
    } catch (error) {
      next(error);
    }
  }
  async getCurrentSubscription(req, res, next) {
    try {
      const hospitalId = req.user?.userId;
      if (!hospitalId) {
        ApiResponse.unauthorized(res, "Hospital ID not found");
        return;
      }
      const subscription = await this.subscriptionService.getCurrentSubscription(hospitalId);
      ApiResponse.success(res, "Current subscription retrieved", subscription);
    } catch (error) {
      next(error);
    }
  }
};

// src/services/hospital/qualification/implementations/qualification.service.ts
import { Types as Types26 } from "mongoose";
var QualificationService = class {
  constructor(_qualificationRepo, _imageService, _qualificationMapper) {
    this._qualificationRepo = _qualificationRepo;
    this._imageService = _imageService;
    this._qualificationMapper = _qualificationMapper;
  }
  async getQualifications(hospitalId, page, limit, search, filter) {
    const query = { hospital_id: new Types26.ObjectId(hospitalId) };
    if (filter === "active") {
      query.isActive = true;
    } else if (filter === "blocked") {
      query.isActive = false;
    }
    const result = await this._qualificationRepo.findWithPagination({
      page,
      limit,
      search,
      searchFields: ["name", "abbreviation", "description"],
      filter: query
    });
    return {
      ...result,
      data: result.data.map((q) => this._qualificationMapper.toDTO(q))
    };
  }
  async createQualification(hospitalId, data, file) {
    const qualificationData = {
      ...data,
      hospital_id: new Types26.ObjectId(hospitalId)
    };
    if (file) {
      qualificationData.image = await this._imageService.uploadImage(file.buffer, "hospital/qualifications");
    } else if (data.image && data.image.startsWith("data:image")) {
      qualificationData.image = await this._imageService.uploadImage(data.image, "hospital/qualifications");
    }
    const created = await this._qualificationRepo.create(qualificationData);
    return this._qualificationMapper.toDTO(created);
  }
  async updateQualification(id, data, file) {
    const qualification = await this._qualificationRepo.findById(id);
    if (!qualification) return null;
    const updateData = { ...data };
    if (file) {
      if (qualification.image) await this._imageService.deleteImage(qualification.image);
      updateData.image = await this._imageService.uploadImage(file.buffer, "hospital/qualifications");
    } else if (data.image && data.image.startsWith("data:image")) {
      if (qualification.image) await this._imageService.deleteImage(qualification.image);
      updateData.image = await this._imageService.uploadImage(data.image, "hospital/qualifications");
    } else if (data.image === "" && qualification.image) {
      await this._imageService.deleteImage(qualification.image);
      updateData.image = "";
    }
    const updated = await this._qualificationRepo.update(id, updateData);
    return updated ? this._qualificationMapper.toDTO(updated) : null;
  }
  async toggleStatus(id) {
    const qualification = await this._qualificationRepo.findById(id);
    if (!qualification) return null;
    const updated = await this._qualificationRepo.update(id, { isActive: !qualification.isActive });
    return updated ? this._qualificationMapper.toDTO(updated) : null;
  }
};

// src/services/hospital/specialization/implementations/specialization.service.ts
import { Types as Types27 } from "mongoose";
var SpecializationService = class {
  constructor(_specializationRepo, _imageService, _specializationMapper) {
    this._specializationRepo = _specializationRepo;
    this._imageService = _imageService;
    this._specializationMapper = _specializationMapper;
  }
  async getSpecializations(hospitalId, params) {
    const { page, limit, search, filter } = params;
    const query = { hospital_id: new Types27.ObjectId(hospitalId) };
    if (filter === "active") {
      query.isActive = true;
    } else if (filter === "blocked") {
      query.isActive = false;
    }
    const result = await this._specializationRepo.findWithPagination({
      page,
      limit,
      search,
      searchFields: ["name", "description"],
      filter: query
    });
    return {
      ...result,
      data: result.data.map((s) => this._specializationMapper.toDTO(s))
    };
  }
  async createSpecialization(hospitalId, specializationData, file) {
    const data = {
      ...specializationData,
      hospital_id: new Types27.ObjectId(hospitalId)
    };
    if (file) {
      data.image = await this._imageService.uploadImage(file.buffer, "hospital/specializations");
    } else if (specializationData.image && specializationData.image.startsWith("data:image")) {
      data.image = await this._imageService.uploadImage(specializationData.image, "hospital/specializations");
    }
    const created = await this._specializationRepo.create(data);
    return this._specializationMapper.toDTO(created);
  }
  async updateSpecialization(id, specializationData, file) {
    const specialization = await this._specializationRepo.findById(id);
    if (!specialization) return null;
    const updateData = { ...specializationData };
    if (file) {
      if (specialization.image) await this._imageService.deleteImage(specialization.image);
      updateData.image = await this._imageService.uploadImage(file.buffer, "hospital/specializations");
    } else if (specializationData.image && specializationData.image.startsWith("data:image")) {
      if (specialization.image) await this._imageService.deleteImage(specialization.image);
      updateData.image = await this._imageService.uploadImage(specializationData.image, "hospital/specializations");
    } else if (specializationData.image === "" && specialization.image) {
      await this._imageService.deleteImage(specialization.image);
      updateData.image = "";
    }
    const updated = await this._specializationRepo.update(id, updateData);
    return updated ? this._specializationMapper.toDTO(updated) : null;
  }
  async toggleStatus(id) {
    const specialization = await this._specializationRepo.findById(id);
    if (!specialization) return null;
    const updated = await this._specializationRepo.update(id, { isActive: !specialization.isActive });
    return updated ? this._specializationMapper.toDTO(updated) : null;
  }
};

// src/controllers/hospital/hospital/implementation/dashbord.controller.ts
var Dashbord = class {
  constructor(_dashbord) {
    this._dashbord = _dashbord;
    this.getDoctorStatus = async (req, res, next) => {
      try {
        const hospitalId = req.user?.userId;
        if (!hospitalId) {
          ApiResponse.unauthorized(res, "Hospital ID not found in token");
          return;
        }
        const status = await this._dashbord.getDoctorStatus(hospitalId);
        ApiResponse.success(res, "Doctor status fetched successfully", status);
      } catch (error) {
        next(error);
      }
    };
    this.getKycStats = async (req, res, next) => {
      try {
        const hospitalId = req.user?.userId;
        if (!hospitalId) {
          ApiResponse.unauthorized(res, "Hospital ID not found in token");
          return;
        }
        const kycStats = await this._dashbord.getKycStats(hospitalId);
        ApiResponse.success(res, "KYC stats fetched successfully", kycStats);
      } catch (error) {
        next(error);
      }
    };
    this.getCommonStats = async (req, res, next) => {
      try {
        const hospitalId = req.user?.userId;
        const type = req.query.type;
        if (!hospitalId) {
          ApiResponse.unauthorized(res, "Hospital ID not found in token");
          return;
        }
        const stats = await this._dashbord.getCommonStats(hospitalId, type);
        ApiResponse.success(res, "Common stats fetched successfully", { stats });
      } catch (error) {
        next(error);
      }
    };
    this.getWallet = async (req, res, next) => {
      try {
        const hospitalId = req.user?.userId;
        if (!hospitalId) {
          ApiResponse.unauthorized(res, "Hospital ID not found in token");
          return;
        }
        const wallet = await this._dashbord.getWallet(hospitalId);
        ApiResponse.success(res, "Wallet details fetched successfully", wallet);
      } catch (error) {
        next(error);
      }
    };
    this.withdraw = async (req, res, next) => {
      try {
        const hospitalId = req.user?.userId;
        if (!hospitalId) {
          ApiResponse.unauthorized(res, "Hospital ID not found in token");
          return;
        }
        const { amount } = req.body;
        const withdrawal = await this._dashbord.withdraw(hospitalId, amount);
        ApiResponse.success(res, "Withdrawal processed successfully", withdrawal);
      } catch (error) {
        next(error);
      }
    };
    this.getReqcancalation = async (req, res, next) => {
      try {
        const hospitalId = req.user?.userId;
        if (!hospitalId) {
          ApiResponse.unauthorized(res, "Hospital ID not found in token");
          return;
        }
        const result = await this._dashbord.getReqcancalation(hospitalId);
        ApiResponse.success(res, "data featched successfully", result);
      } catch (error) {
        next(error);
      }
    };
    this.approvecancellation = async (req, res, next) => {
      try {
        const { id } = req.params;
        const hospitalId = req.user?.userId;
        if (!hospitalId) {
          ApiResponse.unauthorized(res, "Hospital ID not found in token");
          return;
        }
        const result = await this._dashbord.approvecancellation(id, hospitalId);
        ApiResponse.success(res, "approve success", result);
      } catch (error) {
        next(error);
      }
    };
    this.rejectcancellation = async (req, res, next) => {
      try {
        const { id } = req.params;
        const { reason } = req.body;
        const result = await this._dashbord.rejectcancellation(id, reason);
        ApiResponse.success(res, "success the reject", result);
      } catch (error) {
        next(error);
      }
    };
  }
  async getstatus(req, res, next) {
    try {
      const hospitalId = req.user?.userId;
      if (!hospitalId) {
        ApiResponse.unauthorized(res, "Hospital ID not found in token");
        return;
      }
      const stats = await this._dashbord.getDashboardStats(hospitalId);
      ApiResponse.success(res, MESSAGES.DASHBOARD_STATS_FETCHED, stats);
    } catch (error) {
      next(error);
    }
  }
};

// src/services/hospital/hospital/implementations/dashbord.service.ts
import { Types as Types28 } from "mongoose";

// src/constants/Comments/Comment.ts
var COMMENT_TYPES = {
  PATIENT_MANAGEMENT: "patient-management",
  DEPARTMENT: "department",
  QUALIFICATION: "qualification",
  SPECIALIZATION: "specialization"
};

// src/services/hospital/hospital/implementations/dashbord.service.ts
var DashbordService = class {
  constructor(_doctorRepo, _userRepo, _departmentRepo, _specializationRepo, _qualificationRepo, _walletRepo, _appoiments, _appoimentmapper, _hospitaldoctorcnfigRepo) {
    this._doctorRepo = _doctorRepo;
    this._userRepo = _userRepo;
    this._departmentRepo = _departmentRepo;
    this._specializationRepo = _specializationRepo;
    this._qualificationRepo = _qualificationRepo;
    this._walletRepo = _walletRepo;
    this._appoiments = _appoiments;
    this._appoimentmapper = _appoimentmapper;
    this._hospitaldoctorcnfigRepo = _hospitaldoctorcnfigRepo;
    this.getWallet = async (hospitalId) => {
      const wallet = await this._walletRepo.findOne({
        ownerId: new Types28.ObjectId(hospitalId)
      });
      if (!wallet) {
        return {
          balance: 0,
          totalenrnings: 0,
          totalwithdrawn: 0,
          transactions: []
        };
      }
      return {
        balance: wallet.balance,
        totalenrnings: wallet.totalearnings || 0,
        totalwithdrawn: wallet.totalwithdrawn || 0,
        transactions: (wallet.Transaction || []).map((tx) => ({
          amount: tx.amount,
          type: tx.type,
          date: tx.date,
          description: tx.type === "credit" ? "Earning from appointment" : "Withdrawal"
        }))
      };
    };
    this.withdraw = async (hospitalId, amount) => {
      const wallet = await this._walletRepo.findOne({ ownerId: new Types28.ObjectId(hospitalId) });
      if (!wallet) {
        return { success: false, message: "Wallet not found" };
      }
      if (wallet.balance < amount) {
        return { success: false, message: "Insufficient balance" };
      }
      await this._walletRepo.debitWallet(hospitalId, amount);
      return { success: true, message: "Withdrawal successful" };
    };
    this.getReqcancalation = async (hospitalId) => {
      const appointments = await this._appoiments.findByFilter({
        cancelRequest: true,
        hospitalId
      });
      return appointments.map(
        (appointment) => this._appoimentmapper.toDTO(appointment)
      );
    };
    this.approvecancellation = async (id, hospitalId) => {
      const result = await this._appoiments.update(id, {
        cancelRequest: false,
        status: "cancelled" /* CANCELLED */
      });
      console.log(result);
      const finduser = await this._appoiments.findById(id);
      if (!finduser) {
        return false;
      }
      const patient = finduser.bookedBy;
      const doctor = finduser.doctorId;
      let patientwallet = await this._walletRepo.findOne({
        ownerId: patient
      });
      if (!patientwallet) {
        patientwallet = await this._walletRepo.create({
          ownerId: patient
        });
      }
      const hospitalwallet = await this._walletRepo.findOne({
        ownerId: hospitalId
      });
      const hospitalbalance = hospitalwallet?.balance ?? 0;
      const hospitalDoctorConfig = await this._hospitaldoctorcnfigRepo.findByFilter({
        hospitalId,
        doctorId: doctor
      });
      const amount = hospitalDoctorConfig[0]?.doctorFee ?? 0;
      if (amount <= hospitalbalance) {
        await this._walletRepo.debitWallet(
          hospitalId.toString(),
          amount
        );
        await this._walletRepo.creditWallet(
          patient.toString(),
          amount
        );
      }
      return true;
    };
  }
  async getDashboardStats(hospitalId) {
    const totalDoctors = await this._doctorRepo.countDocuments({ hospital_id: new Types28.ObjectId(hospitalId) });
    const activeDoctors = await this._doctorRepo.countActiveDoctor(hospitalId);
    const totalPatients = await this._userRepo.countDocuments();
    console.log(totalDoctors, activeDoctors, totalPatients);
    return {
      totalDoctors,
      activeDoctors,
      totalPatients
    };
  }
  async getDoctorStatus(hospitalId) {
    const total = await this._doctorRepo.countDocuments({ hospital_id: new Types28.ObjectId(hospitalId) });
    const active = await this._doctorRepo.countActiveDoctor(hospitalId);
    const blocked = await this._doctorRepo.countBlockedDoctor(hospitalId);
    const pending = await this._doctorRepo.countPendingDoctor(hospitalId);
    return {
      total,
      active,
      blocked,
      pending
    };
  }
  async getKycStats(hospitalId) {
    const total = await this._doctorRepo.countDocuments({ hospital_id: new Types28.ObjectId(hospitalId), reviewStatus: { $in: ["pending", "rejected", "revision"] } });
    const pending = await this._doctorRepo.countDocuments({ hospital_id: new Types28.ObjectId(hospitalId), reviewStatus: "pending" });
    const rejected = await this._doctorRepo.countDocuments({ hospital_id: new Types28.ObjectId(hospitalId), reviewStatus: "rejected" });
    const revision = await this._doctorRepo.countDocuments({ hospital_id: new Types28.ObjectId(hospitalId), reviewStatus: "revision" });
    return {
      total,
      pending,
      rejected,
      revision
    };
  }
  async getCommonStats(hospitalId, type) {
    const hospitalObjectId = new Types28.ObjectId(hospitalId);
    if (type === COMMENT_TYPES.PATIENT_MANAGEMENT) {
      const total = await this._userRepo.countDocuments({ hospital_id: hospitalObjectId });
      const active = await this._userRepo.countDocuments({ hospital_id: hospitalObjectId, isActive: true });
      const blocked = await this._userRepo.countDocuments({ hospital_id: hospitalObjectId, isActive: false });
      return { total, active, blocked };
    } else if (type === COMMENT_TYPES.DEPARTMENT) {
      const total = await this._departmentRepo.countDocuments({ hospital_id: hospitalObjectId });
      const active = await this._departmentRepo.countDocuments({ hospital_id: hospitalObjectId, isActive: true });
      const blocked = await this._departmentRepo.countDocuments({ hospital_id: hospitalObjectId, isActive: false });
      return { total, active, blocked };
    } else if (type === COMMENT_TYPES.SPECIALIZATION) {
      const total = await this._specializationRepo.countDocuments({ hospital_id: hospitalObjectId });
      const active = await this._specializationRepo.countDocuments({ hospital_id: hospitalObjectId, isActive: true });
      const blocked = await this._specializationRepo.countDocuments({ hospital_id: hospitalObjectId, isActive: false });
      return { total, active, blocked };
    } else if (type === COMMENT_TYPES.QUALIFICATION) {
      const total = await this._qualificationRepo.countDocuments({ hospital_id: hospitalObjectId });
      const active = await this._qualificationRepo.countDocuments({ hospital_id: hospitalObjectId, isActive: true });
      const blocked = await this._qualificationRepo.countDocuments({ hospital_id: hospitalObjectId, isActive: false });
      return { total, active, blocked };
    }
    return { total: 0, active: 0, blocked: 0 };
  }
  async rejectcancellation(id, reason) {
    const result = await this._appoiments.update(id, {
      cancelRequest: false,
      rejectionReason: reason,
      status: "rejected" /* REJECTED */
    });
    return !!result;
  }
};

// src/services/hospital/doctor/implementations/doctor.salary.service.ts
import { Types as Types29 } from "mongoose";
var DoctorSalaryservice = class {
  constructor(_IsalaryRepository, _IDoctorRepository, _IHospitalDoctorConfigRepository) {
    this._IsalaryRepository = _IsalaryRepository;
    this._IDoctorRepository = _IDoctorRepository;
    this._IHospitalDoctorConfigRepository = _IHospitalDoctorConfigRepository;
  }
  async getDoctorSalaryRequests(hospital_id, page, limit, search, status) {
    const { salaryRequests, totalItems } = await this._IsalaryRepository.findDoctorSalaryRequests({
      hospital_id,
      page: page || 1,
      limit: limit || 5,
      search: search || "",
      status: status || "ALL"
    });
    const totalPages = Math.ceil(totalItems / (limit || 5));
    return {
      data: salaryRequests,
      total: totalItems,
      totalPages
    };
  }
  async updateSalaryRequestStatus(id, hospital_id, status, data) {
    if (status === "APPROVED") {
      const doctorObjectId = new Types29.ObjectId(data.doctorId);
      const hospitalObjectId = new Types29.ObjectId(hospital_id);
      const existingConfig = await this._IHospitalDoctorConfigRepository.findOne({
        doctorId: doctorObjectId,
        hospitalId: hospitalObjectId
      });
      if (existingConfig) {
        await this._IHospitalDoctorConfigRepository.update(
          existingConfig._id.toString(),
          {
            hospitalCommission: data.hospitalCommission,
            doctorFee: data.approvedAmount
          }
        );
      } else {
        await this._IHospitalDoctorConfigRepository.create({
          doctorId: doctorObjectId,
          hospitalId: hospitalObjectId,
          hospitalCommission: data.hospitalCommission ?? 0,
          doctorFee: data.approvedAmount ?? 0
        });
      }
    }
    return await this._IsalaryRepository.updateSalaryRequestStatus(
      id,
      status,
      data
    );
  }
};

// src/controllers/hospital/doctor/implementations/doctor.salary.controller.ts
var DoctorSalaryController = class {
  constructor(_doctorSalaryService) {
    this._doctorSalaryService = _doctorSalaryService;
  }
  async getDoctorSalaryRequests(req, res, next) {
    try {
      const hospital = req.user;
      const hospital_id = hospital?.userId;
      if (!hospital_id) {
        throw new Error("Hospital ID not found");
      }
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 5;
      const search = req.query.search;
      const statusFilter = req.query.status;
      const { data, total, totalPages } = await this._doctorSalaryService.getDoctorSalaryRequests(hospital_id, page, limit, search, statusFilter);
      ApiResponse.success(
        res,
        "Doctor salary requests fetched successfully",
        data,
        200,
        {
          page,
          limit,
          totalItems: total,
          totalPages,
          currentPage: page
        }
      );
    } catch (error) {
      console.error("Controller: Error fetching doctor salary requests", error);
      next(error);
    }
  }
  async updateSalaryRequestStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, approvedAmount, note, hospitalCommission, doctorId } = req.body;
      const hospital = req.user;
      const hospital_id = hospital?.userId;
      if (!hospital_id) {
        throw new Error("Hospital ID not found");
      }
      if (!status || !note) {
        throw new Error("Status and note are required");
      }
      const result = await this._doctorSalaryService.updateSalaryRequestStatus(id, hospital_id, status, { approvedAmount, note, hospitalCommission, doctorId });
      ApiResponse.success(
        res,
        `Doctor salary request ${status.toLowerCase()} successfully`,
        result
      );
    } catch (error) {
      console.error("Controller: Error updating doctor salary request status", error);
      next(error);
    }
  }
};

// src/di/hospital.di.ts
var hospitalContainer = () => {
  const hospitalRepo = new HospitalRepository(HospitalModel);
  const userRepo = new UserRepository(Patient);
  const tokenService2 = new TokenService();
  const doctorRepo = new DoctorRepository(DoctorModel);
  const doctorMapper = new DoctorMapper();
  const doctorLeaveMapper = new DoctorLeaveMapper();
  const patientMapper = new PatientMapper();
  const departmentRepo = new DepartmentRepository(department_model_default);
  const leaveRepo = new LeaveRepository();
  const appointmentRepo = new AppointmentRepository();
  const subscriptionRepo = new SubscriptionRepository();
  const subscriptionMapper = new SubscriptionMapper();
  const qualificationRepo = new QualificationRepository(qualification_model_default);
  const qualificationMapper = new QualificationMapper();
  const specializationRepo = new SpecializationRepository();
  const HospitalDoctorConfigRepo = new HospitalDoctorConfigRepository();
  const specializationMapper = new SpecializationMapper();
  const salaryRequestRepo = new SalaryrequestRepository(SalaryRequestModel);
  const doctorSalaryService = new DoctorSalaryservice(salaryRequestRepo, doctorRepo, HospitalDoctorConfigRepo);
  const doctorSalaryController2 = new DoctorSalaryController(doctorSalaryService);
  const WalletRepo = new WalletRepository(Wallet);
  const appoimentmapper = new AppointmentMapper();
  const hospitalMapper = new HospitalMapper();
  const hospitalSubscriptionService = new HospitalSubscriptionService(
    subscriptionRepo,
    hospitalRepo,
    doctorRepo,
    departmentRepo,
    userRepo,
    subscriptionMapper
  );
  const hospitalSubscriptionController2 = new HospitalSubscriptionController(hospitalSubscriptionService);
  const hospitalAuthService = new HospitalAuthService(
    hospitalRepo,
    tokenService2,
    hospitalMapper
  );
  const hospitalAuthController2 = new HospitalAuthController(hospitalAuthService);
  const imageService = new CloudinaryImageService();
  const { patientService } = patientContainer();
  const hospitalService = new HospitalService(
    hospitalRepo,
    hospitalMapper,
    imageService,
    patientService,
    doctorRepo,
    departmentRepo,
    userRepo,
    subscriptionRepo
  );
  const hospitalController3 = new HospitalController(hospitalService);
  const doctorManagementService = new DoctorManagementService(
    doctorRepo,
    doctorMapper,
    departmentRepo,
    leaveRepo,
    hospitalSubscriptionService,
    doctorLeaveMapper,
    specializationRepo,
    qualificationRepo
  );
  const doctorManagement2 = new DoctorManagementController(
    doctorManagementService
  );
  const patientManagementService = new PatientManagementService(
    userRepo,
    patientMapper,
    appointmentRepo,
    hospitalSubscriptionService
  );
  const patientManagement2 = new PatientManagementController(
    patientManagementService
  );
  const qualificationService = new QualificationService(
    qualificationRepo,
    imageService,
    qualificationMapper
  );
  const specializationService = new SpecializationService(
    specializationRepo,
    imageService,
    specializationMapper
  );
  const hospitalAuthMiddleware3 = new HospitalAuthMiddleware(
    tokenService2,
    hospitalRepo
  );
  const dashbordservice = new DashbordService(doctorRepo, userRepo, departmentRepo, specializationRepo, qualificationRepo, WalletRepo, appointmentRepo, appoimentmapper, HospitalDoctorConfigRepo);
  const dashbordController2 = new Dashbord(dashbordservice);
  return {
    tokenService: tokenService2,
    hospitalAuthController: hospitalAuthController2,
    hospitalController: hospitalController3,
    doctorManagement: doctorManagement2,
    doctorManagementService,
    hospitalRepo,
    patientManagement: patientManagement2,
    patientManagementService,
    hospitalAuthMiddleware: hospitalAuthMiddleware3,
    hospitalSubscriptionController: hospitalSubscriptionController2,
    qualificationService,
    specializationService,
    dashbordController: dashbordController2,
    doctorSalaryController: doctorSalaryController2
  };
};

// src/middleware/multer.middleware.ts
import multer from "multer";
var storage = multer.memoryStorage();
var upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

// src/controllers/superAdmin/hospital/implementation/hospital.controller.ts
var SuperAdminHospitalController = class {
  constructor(service) {
    this.service = service;
    this.hospitalManagement = async (req, res, next) => {
      try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 8;
        const search = req.query.search;
        const status = req.query.status;
        let isActive;
        if (status === "Active") isActive = true;
        else if (status === "Inactive") isActive = false;
        const result = await this.service.hospitalManagement({ page, limit, search, isActive });
        ApiResponse.success(res, "Hospital management data fetched successfully", result.data, 200 /* OK */, {
          page,
          limit,
          totalItems: result.total,
          totalPages: Math.ceil(result.total / limit)
        });
      } catch (error) {
        next(error);
      }
    };
    this.setActive = async (req, res, next) => {
      try {
        const { id, isActive } = req.body;
        if (!id || isActive === void 0) {
          ApiResponse.validationError(res, "Missing required parameters: id and isActive");
          return;
        }
        const result = await this.service.setActive(id, isActive);
        ApiResponse.success(res, "Hospital status updated successfully", result);
      } catch (error) {
        next(error);
      }
    };
    this.hospitalStatus = async (req, res, next) => {
      try {
        const { id, status } = req.params;
        const { rejectionReason } = req.body;
        const result = await this.service.updateHospitalStatus(id, status, rejectionReason);
        ApiResponse.success(res, "Hospital status updated successfully", result);
      } catch (error) {
        next(error);
      }
    };
    this.addHospital = async (req, res, next) => {
      try {
        const hospitalData = req.body;
        const files = req.files;
        const result = await this.service.addHospital(hospitalData, {
          logo: files?.logo?.[0],
          licence: files?.licence?.[0]
        });
        ApiResponse.success(res, "Hospital created successfully", result, 201 /* CREATED */);
      } catch (error) {
        next(error);
      }
    };
    this.editHospital = async (req, res, next) => {
      try {
        const { id } = req.params;
        const updateData = req.body;
        const files = req.files;
        if (updateData && updateData.subscription && typeof updateData.subscription === "string") {
          try {
            updateData.subscription = JSON.parse(updateData.subscription);
          } catch (e) {
            logger_default.error("Failed to parse subscription", e);
          }
        }
        const result = await this.service.editHospital(id, updateData, {
          logo: files?.logo?.[0],
          licence: files?.licence?.[0]
        });
        ApiResponse.success(res, "Hospital updated successfully", result);
      } catch (error) {
        next(error);
      }
    };
  }
};

// src/services/superAdmin/hospital/implementation/hospital.service.ts
import bcrypt8 from "bcryptjs";
var SuperAdminHospitalService = class {
  constructor(kycRepo, hospitalRepo, hospitalMapper, subscriptionRepo, _doctorRepo) {
    this.kycRepo = kycRepo;
    this.hospitalRepo = hospitalRepo;
    this.hospitalMapper = hospitalMapper;
    this.subscriptionRepo = subscriptionRepo;
    this._doctorRepo = _doctorRepo;
  }
  async hospitalManagement(options) {
    const { page, limit, search, isActive } = options;
    const filter = {
      reviewStatus: "approved"
    };
    if (isActive !== void 0) {
      filter.isActive = isActive;
    }
    const result = await this.kycRepo.findWithPagination({
      page,
      limit,
      search,
      searchFields: ["hospitalName", "email"],
      filter
    });
    return {
      data: result.data.map((h) => this.hospitalMapper.toDTO(h)),
      total: result.total,
      page: result.page,
      limit: result.limit
    };
  }
  async setActive(id, isActive) {
    const updatedHospital = await this.kycRepo.update(id, { isActive });
    if (!updatedHospital) {
      ApiResponse.throwError(404 /* NOT_FOUND */, "Hospital not found");
    }
    return HospitalStatusUpdateResponseSchema.parse({
      ...this.hospitalMapper.toDTO(updatedHospital),
      message: `Hospital successfully ${isActive ? "activated" : "deactivated"}`
    });
  }
  async updateHospitalStatus(id, status, reason) {
    const updateData = {
      reviewStatus: status
    };
    if (reason) {
      updateData.rejectionReason = reason;
    } else {
      updateData.rejectionReason = void 0;
    }
    const updated = await this.kycRepo.update(id, updateData);
    return updated ? this.hospitalMapper.toDTO(updated) : null;
  }
  async addHospital(data, files) {
    const { email, password, hospitalName, address, phone, since } = data;
    if (!email || !password || !hospitalName || !address || !phone || !since) {
      ApiResponse.throwError(400 /* BAD_REQUEST */, "Missing required fields");
    }
    const existing = await this.hospitalRepo.findByEmail(email);
    if (existing) {
      ApiResponse.throwError(409 /* CONFLICT */, "Hospital with this email already exists");
    }
    let logoUrl = "";
    let licenceUrl = "";
    if (files?.logo) {
      logoUrl = await uploadBufferToCloudinary(files.logo.buffer, "hospitals/logos");
    }
    if (files?.licence) {
      licenceUrl = await uploadBufferToCloudinary(files.licence.buffer, "hospitals/licences");
    }
    const hashedPassword = await bcrypt8.hash(password, 10);
    if (data.subscription && data.subscription.plan) {
      const planDetails = await this.subscriptionRepo.findByPlanName(data.subscription.plan);
      if (planDetails) {
        const startDate = data.subscription.startDate ? new Date(data.subscription.startDate) : /* @__PURE__ */ new Date();
        const duration = planDetails.duration || 1;
        const durationUnit = planDetails.durationUnit || "months";
        data.subscription.startDate = startDate;
        data.subscription.endDate = this.calculateSubscriptionEndDate(startDate, duration, durationUnit);
      }
    }
    const createdData = {
      ...data,
      since: Number(since),
      password: hashedPassword,
      logo: logoUrl || data.logo,
      licence: licenceUrl || data.licence,
      isActive: true
    };
    const created = await this.hospitalRepo.create(createdData);
    return this.hospitalMapper.toDTO(created);
  }
  async editHospital(id, updateData = {}, files) {
    const hospital = await this.hospitalRepo.findById(id);
    if (!hospital) {
      ApiResponse.throwError(404 /* NOT_FOUND */, "Hospital not found");
    }
    if (files?.logo) {
      updateData.logo = await uploadBufferToCloudinary(files.logo.buffer, "hospitals/logos");
    }
    if (files?.licence) {
      updateData.licence = await uploadBufferToCloudinary(files.licence.buffer, "hospitals/licences");
    }
    if (updateData.since) {
      updateData.since = Number(updateData.since);
    }
    if (updateData.subscription && updateData.subscription.plan) {
      const planDetails = await this.subscriptionRepo.findByPlanName(updateData.subscription.plan);
      if (planDetails) {
        const startDate = updateData.subscription.startDate ? new Date(updateData.subscription.startDate) : /* @__PURE__ */ new Date();
        const duration = planDetails.duration || 1;
        const durationUnit = planDetails.durationUnit || "months";
        updateData.subscription.startDate = startDate;
        updateData.subscription.endDate = this.calculateSubscriptionEndDate(startDate, duration, durationUnit);
      }
    }
    const updated = await this.hospitalRepo.update(id, updateData);
    return updated ? this.hospitalMapper.toDTO(updated) : null;
  }
  calculateSubscriptionEndDate(startDate, duration, unit) {
    const endDate = new Date(startDate);
    switch (unit) {
      case "days":
        endDate.setDate(endDate.getDate() + duration);
        break;
      case "months":
        endDate.setMonth(endDate.getMonth() + duration);
        break;
      case "years":
        endDate.setFullYear(endDate.getFullYear() + duration);
        break;
      default:
        endDate.setMonth(endDate.getMonth() + duration);
    }
    return endDate;
  }
};

// src/controllers/superAdmin/dashboard/implementation/dashboard.controller.ts
var SuperAdminDashboardController = class {
  constructor(service) {
    this.service = service;
    this.getDashboardStats = async (req, res, next) => {
      try {
        const stats = await this.service.getDashboardStats();
        ApiResponse.success(res, "Dashboard stats fetched successfully", stats);
      } catch (error) {
        next(error);
      }
    };
    this.getme = async (req, res, next) => {
      try {
        const user = req.user;
        const superAdminId = user?.userId;
        if (!superAdminId) {
          ApiResponse.throwError(401 /* UNAUTHORIZED */, "Unauthorized");
          return;
        }
        const superAdmin = await this.service.getme(superAdminId);
        ApiResponse.success(res, "Super admin details fetched successfully", superAdmin);
      } catch (error) {
        next(error);
      }
    };
    this.getWallet = async (req, res, next) => {
      try {
        const user = req.user;
        const superAdminId = user?.userId;
        if (!superAdminId) {
          ApiResponse.throwError(401 /* UNAUTHORIZED */, "Unauthorized");
          return;
        }
        const walletData = await this.service.getWallet(superAdminId);
        ApiResponse.success(res, "Wallet data fetched successfully", walletData);
      } catch (error) {
        next(error);
      }
    };
    this.withdraw = async (req, res, next) => {
      try {
        const { amount } = req.body;
        const user = req.user;
        const superAdminId = user?.userId;
        if (!superAdminId) {
          ApiResponse.throwError(401 /* UNAUTHORIZED */, "Unauthorized");
          return;
        }
        const result = await this.service.withdraw(superAdminId, amount);
        ApiResponse.success(res, "Withdrawal successful", result);
      } catch (error) {
        next(error);
      }
    };
  }
};

// src/services/superAdmin/dashboard/implementation/dashboard.service.ts
import { Types as Types30 } from "mongoose";
var SuperAdminDashboardService = class {
  constructor(superAdminRepo, kycRepo, doctorRepo, patientRepo, _walletRepo) {
    this.superAdminRepo = superAdminRepo;
    this.kycRepo = kycRepo;
    this.doctorRepo = doctorRepo;
    this.patientRepo = patientRepo;
    this._walletRepo = _walletRepo;
  }
  async getDashboardStats() {
    const totalHospitals = await this.kycRepo.countDocuments();
    const activeHospitals = await this.kycRepo.countDocuments({ isActive: true });
    const totalDoctors = await this.doctorRepo.countDocuments();
    const activeDoctors = await this.doctorRepo.countDocuments({ isActive: true });
    const totalPatients = await this.patientRepo.countDocuments();
    return {
      totalHospitals,
      activeHospitals,
      totalDoctors,
      activeDoctors,
      totalPatients
    };
  }
  async getme(id) {
    return await this.superAdminRepo.findById(id);
  }
  async getWallet(superAdminId) {
    let superAdmin = await this._walletRepo.findOne({ ownerId: new Types30.ObjectId(superAdminId) });
    if (!superAdmin) {
      superAdmin = await this._walletRepo.create({ ownerId: new Types30.ObjectId(superAdminId) });
    }
    return {
      balance: superAdmin.balance,
      totalenrnings: superAdmin.totalearnings || 0,
      totalwithdrawn: superAdmin.totalwithdrawn || 0,
      transactions: (superAdmin.Transaction || []).map((tx) => ({
        amount: tx.amount,
        type: tx.type,
        date: tx.date,
        description: tx.type === "credit" ? "Earning from appointment" : "Withdrawal"
      }))
    };
  }
  async withdraw(superAdminId, amount) {
    const wallet = await this._walletRepo.findOne({ ownerId: new Types30.ObjectId(superAdminId) });
    if (!wallet) {
      return { success: false, message: "Wallet not found" };
    }
    if (wallet.balance < amount) {
      return { success: false, message: "Insufficient balance" };
    }
    wallet.balance -= amount;
    wallet.Transaction = wallet.Transaction || [];
    wallet.Transaction.push({
      amount,
      type: "debit",
      date: /* @__PURE__ */ new Date()
    });
    await this._walletRepo.update(wallet._id.toString(), wallet);
    return { success: true, message: "Withdrawal successful" };
  }
};

// src/controllers/superAdmin/kycManagement/implementation/kyc.controller.ts
var SuperAdminKycController = class {
  constructor(service) {
    this.service = service;
    this.hospitals = async (req, res, next) => {
      try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 8;
        const search = req.query.search;
        const filterStr = req.query.filter;
        let filter = {};
        if (filterStr && filterStr !== "all") {
          filter = { reviewStatus: filterStr };
        } else {
          filter = { reviewStatus: { $in: ["pending", "revision", "rejected"] } };
        }
        const result = await this.service.hospitals({ page, limit, search, filter });
        ApiResponse.success(res, "Hospitals fetched successfully", result.data, 200 /* OK */, {
          page,
          limit,
          totalItems: result.total,
          totalPages: Math.ceil(result.total / limit)
        });
      } catch (error) {
        next(error);
      }
    };
  }
};

// src/services/superAdmin/kycManagement/implementation/kyc.service.ts
var SuperAdminKycService = class {
  constructor(kycRepo, kycHospitalMapper) {
    this.kycRepo = kycRepo;
    this.kycHospitalMapper = kycHospitalMapper;
  }
  async hospitals(options) {
    const { page, limit, search, filter } = options;
    const result = await this.kycRepo.findWithPagination({
      page,
      limit,
      search,
      searchFields: ["hospitalName", "email"],
      filter
    });
    return {
      data: result.data.map((h) => this.kycHospitalMapper.toDTO(h)),
      total: result.total,
      page: result.page,
      limit: result.limit
    };
  }
};

// src/services/superAdmin/patient/implementations/patient.management.service.ts
import bcrypt9 from "bcryptjs";
import { Types as Types31 } from "mongoose";
var SuperAdminPatientManagementService = class {
  constructor(_userRepo, _patientMapper) {
    this._userRepo = _userRepo;
    this._patientMapper = _patientMapper;
  }
  async getAllPatients(options) {
    const { page, limit, search, status } = options;
    const filter = {};
    if (status?.toLowerCase() === "active") {
      filter.isActive = true;
    } else if (status?.toLowerCase() === "inactive") {
      filter.isActive = false;
    }
    const result = await this._userRepo.findWithPagination({
      page,
      limit,
      search,
      searchFields: ["name", "email"],
      filter
    });
    return {
      data: result.data.map((p) => this._patientMapper.toDTO(p)),
      total: result.total,
      page: result.page,
      limit: result.limit
    };
  }
  async togglePatientActive(id, isActive) {
    const patient = await this._userRepo.findById(id);
    if (!patient) {
      ApiResponse.throwError(404 /* NOT_FOUND */, "Patient not found");
    }
    const updated = await this._userRepo.update(id, { isActive });
    return updated ? this._patientMapper.toDTO(updated) : null;
  }
  async addPatient(data, hospital_id, file) {
    const existingPatient = await this._userRepo.findByEmail(data.email);
    if (existingPatient) {
      ApiResponse.throwError(409 /* CONFLICT */, "Patient already exists with this email");
    }
    let imageUrl = "";
    if (file) {
      imageUrl = await uploadBufferToCloudinary(file.buffer, "patients/profile");
    }
    const hashedPassword = data.password ? await bcrypt9.hash(data.password, 10) : "";
    const patientData = {
      ...data,
      password: hashedPassword,
      hospital_id: [new Types31.ObjectId(hospital_id)],
      image: imageUrl,
      isActive: true,
      isProfileComplete: true
    };
    const created = await this._userRepo.create(patientData);
    return this._patientMapper.toDTO(created);
  }
  async updatePatient(id, data, file) {
    const patient = await this._userRepo.findById(id);
    if (!patient) {
      ApiResponse.throwError(404 /* NOT_FOUND */, "Patient not found");
    }
    let imageUrl = patient.image || "";
    const shouldRemoveImage = data.willRemoveImage === "true" || data.willRemoveImage === true;
    if (file || shouldRemoveImage) {
      if (patient.image) {
        await deleteFromCloudinary(patient.image);
      }
      imageUrl = "";
    }
    if (file) {
      imageUrl = await uploadBufferToCloudinary(file.buffer, "patients/profile");
    }
    const updateData = { ...data };
    delete updateData.willRemoveImage;
    const updated = await this._userRepo.update(id, {
      ...updateData,
      image: imageUrl
    });
    return updated ? this._patientMapper.toDTO(updated) : null;
  }
};

// src/controllers/superAdmin/patient/implementation/patient.management.controller.ts
var SuperAdminPatientManagementController = class {
  constructor(_patientService) {
    this._patientService = _patientService;
    this.getPatients = async (req, res, next) => {
      try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const search = req.query.search || "";
        const status = req.query.status || "All";
        const result = await this._patientService.getAllPatients({ page, limit, search, status });
        return ApiResponse.success(res, MESSAGES.PATIENT.FETCH_SUCCESS, result.data, 200 /* OK */, {
          page,
          limit,
          totalItems: result.total,
          totalPages: Math.ceil(result.total / limit)
        });
      } catch (error) {
        next(error);
      }
    };
    this.togglePatientActive = async (req, res, next) => {
      try {
        const { id, isActive } = req.body;
        if (!id) {
          return ApiResponse.throwError(400 /* BAD_REQUEST */, "Patient ID is required");
        }
        const result = await this._patientService.togglePatientActive(id, isActive);
        return ApiResponse.success(res, "Patient status updated successfully", result);
      } catch (error) {
        next(error);
      }
    };
  }
  async addPatient(req, res, next) {
    try {
      const hospital = req.user;
      const hospital_id = hospital?.userId;
      if (!hospital_id) {
        return ApiResponse.throwError(401 /* UNAUTHORIZED */, "Hospital ID not found");
      }
      const patientData = req.body;
      const patientFile = req.file;
      const result = await this._patientService.addPatient(patientData, hospital_id, patientFile);
      return ApiResponse.created(res, "Patient added successfully", result);
    } catch (error) {
      next(error);
    }
  }
  async updatePatient(req, res, next) {
    try {
      const { id } = req.params;
      const patientData = req.body;
      const patientFile = req.file;
      const result = await this._patientService.updatePatient(id, patientData, patientFile);
      return ApiResponse.success(res, "Patient updated successfully", result);
    } catch (error) {
      next(error);
    }
  }
};

// src/services/superAdmin/subscription/implementation/subscription.service.ts
var SubscriptionService = class {
  constructor(subscriptionRepository, subscriptionMapper, _hospitalMapper) {
    this.subscriptionRepository = subscriptionRepository;
    this.subscriptionMapper = subscriptionMapper;
    this._hospitalMapper = _hospitalMapper;
  }
  async createSubscription(data) {
    const startDate = /* @__PURE__ */ new Date();
    const endDate = new Date(startDate);
    switch (data.durationUnit) {
      case "months":
        endDate.setMonth(endDate.getMonth() + data.duration);
        break;
      case "years":
        endDate.setFullYear(endDate.getFullYear() + data.duration);
        break;
      default:
        throw new Error("Invalid duration unit");
    }
    const result = await this.subscriptionRepository.create({
      planName: data.planName,
      description: data.description,
      duration: data.duration,
      durationUnit: data.durationUnit,
      amount: data.amount,
      startDate,
      endDate
    });
    return result;
  }
  async getAllSubscriptions(page, limit, search = "", status = "All") {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.subscriptionRepository.findAllWithPagination(skip, limit, search, status),
      this.subscriptionRepository.count(search, status)
    ]);
    return {
      data: data.map((s) => this.subscriptionMapper.toDTO(s)),
      total
    };
  }
  async toggleSubscription(id, isActive) {
    const status = isActive ? "active" : "cancelled";
    const updated = await this.subscriptionRepository.updateById(
      id,
      { status }
    );
    return updated ? this.subscriptionMapper.toDTO(updated) : null;
  }
  async updateSubscription(id, updateData) {
    const updated = await this.subscriptionRepository.updateById(id, updateData);
    return updated ? this.subscriptionMapper.toDTO(updated) : null;
  }
  async subscribeHospital(page, limit, search, filter) {
    const skip = (page - 1) * limit;
    const qury = {};
    if (filter === "active") {
      qury.isActive = true;
    } else if (filter === "expired") {
      qury.isActive = false;
    }
    const hospital = await this.subscriptionRepository.findHospitalWithSubscrib(skip, limit, search, qury);
    const mappedHospitals = hospital.map((h) => this._hospitalMapper.toDTO(h));
    return mappedHospitals;
  }
};

// src/controllers/superAdmin/subscription/implementation/subscription.controller.ts
var SubscriptionController = class {
  constructor(subscriptionService) {
    this.subscriptionService = subscriptionService;
  }
  async addSubscription(req, res, next) {
    try {
      const subscription = await this.subscriptionService.createSubscription({
        ...req.body
      });
      ApiResponse.success(res, MESSAGES.UPDATION.ADDED, subscription);
    } catch (error) {
      next(error);
    }
  }
  async getSubscriptions(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || "";
      const status = req.query.status || "All";
      const { data, total } = await this.subscriptionService.getAllSubscriptions(page, limit, search, status);
      res.status(200).json({
        success: true,
        message: "Subscriptions fetched successfully",
        data,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total
        }
      });
    } catch (error) {
      next(error);
    }
  }
  async toggleSubscription(req, res, next) {
    try {
      const { id, isActive } = req.body;
      const updatedSubscription = await this.subscriptionService.toggleSubscription(id, isActive);
      res.status(200).json({
        success: true,
        message: "Subscription status updated successfully",
        data: updatedSubscription
      });
    } catch (error) {
      next(error);
    }
  }
  async updateSubscription(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const updatedSubscription = await this.subscriptionService.updateSubscription(id, updateData);
      if (!updatedSubscription) {
        res.status(404).json({ success: false, message: "Subscription not found" });
        return;
      }
      res.status(200).json({
        success: true,
        message: "Subscription updated successfully",
        data: updatedSubscription
      });
    } catch (error) {
      next(error);
    }
  }
  async subscribeHospital(req, res, next) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 5;
      const search = req.query.search || "";
      const filter = req.query.filter || void 0;
      const result = await this.subscriptionService.subscribeHospital(page, limit, search, filter);
      ApiResponse.success(res, "sucess", result);
    } catch (error) {
      next(error);
    }
  }
};

// src/models/superAdmin.model.ts
import mongoose18, { Schema as Schema16 } from "mongoose";
var SuperAdminSchema = new Schema16(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      select: false
    },
    role: {
      type: String,
      enum: Object.values(Role),
      default: "superadmin" /* SUPER_ADMIN */
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);
var SuperAdminModel = mongoose18.model(
  "SuperAdmin",
  SuperAdminSchema
);

// src/repositories/superAdmin/implements/superAdminKyc.repository.ts
var KycRepository = class extends BaseRepository {
};

// src/services/auth/superAdmin/superAdmin.service.ts
import bcrypt10 from "bcryptjs";
var SuperAdminAuthService = class {
  constructor(_SuperAdminRepo, tokenService2, _superAdminMapper) {
    this._SuperAdminRepo = _SuperAdminRepo;
    this.tokenService = tokenService2;
    this._superAdminMapper = _superAdminMapper;
  }
  async login(email, password) {
    const superAdmin = await this._SuperAdminRepo.findByEmailWithPassword(email);
    if (!superAdmin) {
      ApiResponse.throwError(401 /* UNAUTHORIZED */, MESSAGES.AUTH.LOGIN_FAILED);
    }
    const isMatch = await bcrypt10.compare(password, superAdmin.password);
    if (!isMatch) {
      ApiResponse.throwError(400 /* BAD_REQUEST */, MESSAGES.AUTH.LOGIN_FAILED);
    }
    const payload = {
      userId: superAdmin._id.toString(),
      email: superAdmin.email,
      role: "superadmin"
    };
    const accessToken = this.tokenService.generateAccessToken(payload);
    const refreshToken = this.tokenService.generateRefreshToken(payload);
    return {
      accessToken,
      refreshToken,
      user: this._superAdminMapper.toDTO(superAdmin)
    };
  }
};

// src/controllers/auth/superAdmin/superAdmin.auth.controller.ts
var SuperAdminAuthController = class {
  constructor(_SuperadminAuthService) {
    this._SuperadminAuthService = _SuperadminAuthService;
    this.login = async (req, res, next) => {
      try {
        const { email, password } = req.body;
        logger_default.debug(`Login attempt for email: ${email}`);
        if (!email || !password) {
          ApiResponse.throwError(400 /* BAD_REQUEST */, MESSAGES.VALIDATION.REQUIRED_FIELD);
        }
        const result = await this._SuperadminAuthService.login(email, password);
        res.cookie("refreshToken", result.refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          maxAge: Number(process.env.MAX_AGE_REFRESH_TOKEN) || 7 * 24 * 60 * 60 * 1e3,
          path: "/"
        });
        res.cookie("accessToken", result.accessToken, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          maxAge: Number(process.env.MAX_AGE_ACCESS_TOKEN) || 15 * 60 * 1e3,
          path: "/"
        });
        return ApiResponse.success(res, MESSAGES.AUTH.LOGIN_SUCCESS, {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          user: result.user
        });
      } catch (error) {
        next(error);
      }
    };
  }
};

// src/dto/superAdmin/superAdmin-response.dto.ts
import { z as z16 } from "zod";
var SuperAdminResponseSchema = z16.object({
  id: z16.string(),
  email: z16.string().email(),
  isActive: z16.boolean(),
  role: z16.literal("superadmin"),
  createdAt: z16.union([z16.date(), z16.string()]),
  updatedAt: z16.union([z16.date(), z16.string()])
});

// src/mappers/superAdmin.mapper.ts
var SuperAdminMapper = class {
  toDTO(superAdmin) {
    const dto = {
      id: superAdmin._id.toString(),
      email: superAdmin.email,
      isActive: superAdmin.isActive,
      role: "superadmin",
      createdAt: superAdmin.createdAt || /* @__PURE__ */ new Date(),
      updatedAt: superAdmin.updatedAt || /* @__PURE__ */ new Date()
    };
    return SuperAdminResponseSchema.parse(dto);
  }
};

// src/dto/superAdmin/kyc/kyc-hospital-response.dto.ts
import { z as z17 } from "zod";
var KycHospitalResponseSchema = z17.object({
  id: z17.string(),
  hospitalName: z17.string(),
  email: z17.string().email(),
  phone: z17.string(),
  since: z17.number(),
  licence: z17.string().optional(),
  address: z17.string(),
  reviewStatus: z17.enum(["pending", "approved", "revision", "rejected"]),
  createdAt: z17.union([z17.date(), z17.string()])
});

// src/mappers/kyc-hospital.mapper.ts
var KycHospitalMapper = class {
  toDTO(hospital) {
    const dto = {
      id: hospital._id.toString(),
      hospitalName: hospital.hospitalName,
      email: hospital.email,
      phone: hospital.phone,
      since: hospital.since,
      licence: hospital.licence,
      address: hospital.address,
      reviewStatus: hospital.reviewStatus,
      createdAt: hospital.createdAt
    };
    return KycHospitalResponseSchema.parse(dto);
  }
};

// src/repositories/superAdmin/implements/superAdmin.repository.ts
var SuperAdminRepository = class extends BaseRepository {
};

// src/di/superAdmin.di.ts
var superAdminContainer = () => {
  const superAdminRepo = new SuperAdminRepository(SuperAdminModel);
  const tokenService2 = new TokenService();
  const kycRepo = new KycRepository(HospitalModel);
  const hospitalRepo = new HospitalRepository(HospitalModel);
  const subscriptionRepo = new SubscriptionRepository();
  const doctorRepo = new DoctorRepository(DoctorModel);
  const patientRepo = new UserRepository(Patient);
  const hospitalMapper = new HospitalMapper();
  const kycHospitalMapper = new KycHospitalMapper();
  const subscriptionMapper = new SubscriptionMapper();
  const WalletRepo = new WalletRepository(Wallet);
  const dashboardService = new SuperAdminDashboardService(superAdminRepo, kycRepo, doctorRepo, patientRepo, WalletRepo);
  const dashboardController2 = new SuperAdminDashboardController(dashboardService);
  const hospitalService = new SuperAdminHospitalService(kycRepo, hospitalRepo, hospitalMapper, subscriptionRepo, doctorRepo);
  const hospitalController3 = new SuperAdminHospitalController(hospitalService);
  const kycService = new SuperAdminKycService(kycRepo, kycHospitalMapper);
  const kycController2 = new SuperAdminKycController(kycService);
  const superAdminMapper = new SuperAdminMapper();
  const superAdminAuthService = new SuperAdminAuthService(superAdminRepo, tokenService2, superAdminMapper);
  const superAdminAuthController2 = new SuperAdminAuthController(superAdminAuthService);
  const patientMapper = new PatientMapper();
  const patientManagementService = new SuperAdminPatientManagementService(patientRepo, patientMapper);
  const patientManagementController2 = new SuperAdminPatientManagementController(patientManagementService);
  const subscriptionService = new SubscriptionService(subscriptionRepo, subscriptionMapper, hospitalMapper);
  const subscriptionController2 = new SubscriptionController(subscriptionService);
  return {
    tokenService: tokenService2,
    dashboardController: dashboardController2,
    hospitalController: hospitalController3,
    kycController: kycController2,
    superAdminAuthController: superAdminAuthController2,
    patientManagementController: patientManagementController2,
    subscriptionController: subscriptionController2
  };
};

// src/routes/auth.routes.ts
import passport from "passport";

// src/middleware/validate.middleware.ts
var validate = (schema) => {
  return async (req, res, next) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      });
      return next();
    } catch (error) {
      return next(error);
    }
  };
};

// src/validators/auth.validator.ts
import { z as z18 } from "zod";

// src/constants/frontend.messages.ts
var AUTH_MESSAGES = {
  COMMON: {
    UNEXPECTED_ERROR: "An unexpected error occurred",
    OTP_SENT: "OTP sent to your email",
    OTP_EXPIRED: "OTP has expired! Please resend OTP.",
    INVALID_OTP: "Invalid OTP. Please try again.",
    OTP_EXPIRED_CLICK_RESEND: "OTP has expired! Please click Resend OTP.",
    RESEND_SUCCESS: "OTP resent successfully!",
    RESEND_FAILED: "Failed to resend OTP. Please try again.",
    PASSWORD_LENGTH: "Password must be at least 6 characters",
    PASSWORDS_NOT_MATCH: "Passwords do not match",
    BACK_TO_LOGIN: "\u2190 Back to Login",
    LOGGING_IN: "Logging in...",
    LOGIN: "Login",
    SIGNUP: "Sign Up",
    SIGNING_UP: "Signing Up...",
    EMAIL: "Email",
    PASSWORD: "Password",
    CONFIRM_PASSWORD: "Confirm Password",
    COMPLETING_LOGIN: "Completing your login...",
    SOMETHING_WENT_WRONG: "Something went wrong",
    PLEASE_SELECT_HOSPITAL: "select a hospital please"
  },
  OTP: {
    TITLE: "Enter OTP",
    SUBTITLE: "We sent an OTP to",
    SUBTITLE_CONTINUE: ". Please enter the code to verify your account.",
    TIME_REMAINING: "Time remaining:",
    EXPIRED_TITLE: "OTP Expired",
    EXPIRED_HINT: 'Please click "Resend OTP" to receive a new code',
    CONFIRM_BUTTON: "Confirm",
    VERIFYING_BUTTON: "Verifying...",
    RESEND_IN: "Resend in",
    RESEND_BUTTON: "Resend OTP",
    VERIFY_SUCCESS: "OTP Verified! Please set your new password.",
    ENTER_ALL_DIGITS: "Please enter all 6 digits",
    UNKNOWN_ROLE: "Unknown role"
  },
  SIGNUP: {
    PATIENT_TITLE: "Sign Up",
    HOSPITAL_TITLE: "Hospital Registration",
    HOSPITAL_SUBTITLE: "Join MedSync and streamline your healthcare operations",
    USERNAME_PLACEHOLDER: "Username",
    EMAIL_PLACEHOLDER: "Email",
    PHONE_PLACEHOLDER: "Phone Number",
    PASSWORD_PLACEHOLDER: "Password",
    CONFIRM_PASSWORD_PLACEHOLDER: "Confirm Password",
    ALREADY_HAVE_ACCOUNT: "Already have an account?",
    LOGIN_LINK: "Login",
    NAME_MIN_LENGTH: "Name must be at least 3 characters",
    INVALID_EMAIL: "Invalid email address",
    PHONE_TEN_DIGITS: "Phone number must be 10 digits",
    CONFIRM_PASSWORD_REQUIRED: "Confirm password is required",
    SUCCESS: "Account created successfully!",
    FAILED: "Failed to create account",
    HOSPITAL_SUCCESS: "Hospital signup successful",
    HOSPITAL_FAILED_PREFIX: "Registration failed:",
    HOSPITAL_NAME_REQUIRED: "Hospital name is required",
    HOSPITAL_PHONE_MIN: "Phone number must be at least 10 digits",
    ADDRESS_REQUIRED: "Address is required",
    ABOUT_REQUIRED: "About is required",
    PINCODE_MIN: "Pincode must be at least 6 digits",
    YEAR_REQUIRED: "Year is required",
    HOSPITAL_DETAILS: "Hospital Details",
    HOSPITAL_NAME_LABEL: "Hospital Name",
    ADDRESS_LABEL: "Address",
    PINCODE_LABEL: "Pincode",
    ESTABLISHED_YEAR_LABEL: "Established Year",
    ABOUT_LABEL: "About Hospital",
    DOCUMENTS: "Documents",
    HOSPITAL_LOGO: "Hospital Logo",
    CHANGE_LOGO: "Change logo",
    UPLOAD_LOGO: "Upload logo",
    FILE_SIZE_HINT: "PNG, JPG or GIF (max 5MB)",
    HOSPITAL_LICENCE: "Hospital Licence",
    CHANGE_LICENCE: "Change licence",
    UPLOAD_LICENCE: "Upload licence",
    CREATE_ACCOUNT: "Create Account",
    CREATING_ACCOUNT: "Creating account...",
    SIGN_IN_LINK: "Sign in",
    TERMS_PRIVACY: "By signing up, you agree to our Terms of Service and Privacy Policy",
    DOCTOR_TITLE: "Doctor Registration",
    DOCTOR_SUBTITLE: "Fill in your details to create an account.",
    NAME_LABEL: "Full Name",
    PHONE_LABEL: "Phone Number",
    ADDRESS_LABEL_HOSPITAL: "Clinic / Hospital Address",
    PERSONAL_INFO: "Personal Information",
    PROFESSIONAL_DETAILS: "Professional Details",
    QUALIFICATION_LABEL: "Qualification",
    SELECT: "Select",
    EXPERIENCE_LABEL: "Years of Experience",
    DEPARTMENT_LABEL: "Department",
    SPECIALIZATION_LABEL: "Specialization",
    ABOUT_YOU: "About You",
    ABOUT_EXPERTISE_HINT: "Brief professional summary, expertise, achievements...",
    PROFILE_PHOTO: "Profile Photo",
    PHOTO_PLACEHOLDER: "Photo",
    UPLOAD: "Upload",
    MEDICAL_LICENSE: "Medical License",
    CLICK_TO_UPLOAD_LICENSE: "Click to upload license",
    ACCOUNT_SECURITY: "Account Security",
    PASSWORD_HINT: "Min. 6 characters",
    CONFIRM_PASSWORD_HINT: "Re-enter password",
    SUBMITTING: "Submitting...",
    DOCTOR_NAME_REQUIRED: "Doctor name is required",
    QUALIFICATION_REQUIRED: "Qualification is required",
    EXPERIENCE_REQUIRED: "Experience is required",
    DEPARTMENT_REQUIRED: "Department is required",
    SPECIALIZATION_REQUIRED: "Specialization is required",
    REGISTRATION_SUCCESS_LOGIN: "Registration successful! Please login."
  },
  LOGIN: {
    DOCTOR_TITLE: "Doctor Login",
    PATIENT_TITLE: "Patient Login",
    HOSPITAL_TITLE: "Hospital Login",
    SUPERADMIN_TITLE: "Super Admin Login",
    BLOCKED_ERROR: "Your account is currently blocked. Please contact the hospital admin.",
    SUCCESS: "Login successful",
    FAILED: "Login failed",
    EMAIL_REQUIRED: "Username or email is required",
    EMAIL_LABEL: "Email",
    EMAIL_PLACEHOLDER: "example@gmail.com",
    PASSWORD_LABEL: "Password",
    PASSWORD_PLACEHOLDER: "Enter Your Password",
    FORGOT_PASSWORD: "Forgot Password?",
    OR_WITH: "Or With",
    GOOGLE_LOGIN: "Login with Google",
    DONT_HAVE_ACCOUNT: "Don't have an account?"
  },
  FORGOT_PASSWORD: {
    TITLE: "Forgot Password",
    SUBTITLE: "Enter your email to receive OTP",
    INVALID_EMAIL: "Please enter a valid email address",
    SENDING: "Sending...",
    SEND_BUTTON: "Send OTP",
    EMAIL_LABEL: "Email Address",
    EMAIL_PLACEHOLDER: "your@email.com"
  },
  RESET_PASSWORD: {
    TITLE: "Set New Password",
    SUBTITLE: "Resetting password for",
    SUCCESS: "Password reset successfully!",
    FAILED_PREFIX: "reset password failed:",
    NEW_PASSWORD_LABEL: "New Password",
    UPDATE_BUTTON: "Update Password",
    UPDATING_BUTTON: "Updating..."
  }
};

// src/validators/auth.validator.ts
var loginSchema = z18.object({
  body: z18.object({
    email: z18.string().min(1, AUTH_MESSAGES.LOGIN.EMAIL_REQUIRED),
    password: z18.string().min(6, AUTH_MESSAGES.COMMON.PASSWORD_LENGTH),
    role: z18.string().optional()
  })
});
var patientSignupSchema = z18.object({
  body: z18.object({
    name: z18.string().min(3, AUTH_MESSAGES.SIGNUP.NAME_MIN_LENGTH),
    email: z18.string().email(AUTH_MESSAGES.SIGNUP.INVALID_EMAIL),
    phone: z18.string().regex(/^[0-9]{10}$/, AUTH_MESSAGES.SIGNUP.PHONE_TEN_DIGITS),
    password: z18.string().min(6, AUTH_MESSAGES.COMMON.PASSWORD_LENGTH),
    confirmPassword: z18.string().min(6, AUTH_MESSAGES.SIGNUP.CONFIRM_PASSWORD_REQUIRED)
  }).refine((data) => data.password === data.confirmPassword, {
    message: AUTH_MESSAGES.COMMON.PASSWORDS_NOT_MATCH,
    path: ["confirmPassword"]
  })
});
var doctorSignupSchema = z18.object({
  body: z18.object({
    name: z18.string().min(1, AUTH_MESSAGES.SIGNUP.DOCTOR_NAME_REQUIRED),
    email: z18.string().email(AUTH_MESSAGES.SIGNUP.INVALID_EMAIL),
    password: z18.string().min(6, AUTH_MESSAGES.COMMON.PASSWORD_LENGTH),
    phone: z18.string().min(10, AUTH_MESSAGES.SIGNUP.HOSPITAL_PHONE_MIN),
    address: z18.string().min(1, AUTH_MESSAGES.SIGNUP.ADDRESS_REQUIRED),
    qualification: z18.string().min(1, AUTH_MESSAGES.SIGNUP.QUALIFICATION_REQUIRED),
    experience: z18.string().min(1, AUTH_MESSAGES.SIGNUP.EXPERIENCE_REQUIRED),
    department: z18.string().min(1, AUTH_MESSAGES.SIGNUP.DEPARTMENT_REQUIRED),
    specialization: z18.string().min(1, AUTH_MESSAGES.SIGNUP.SPECIALIZATION_REQUIRED),
    about: z18.string().min(1, AUTH_MESSAGES.SIGNUP.ABOUT_REQUIRED),
    hospital_id: z18.string().optional()
  })
});
var hospitalSignupSchema = z18.object({
  body: z18.object({
    hospitalName: z18.string().min(1, AUTH_MESSAGES.SIGNUP.HOSPITAL_NAME_REQUIRED),
    email: z18.string().email(AUTH_MESSAGES.SIGNUP.INVALID_EMAIL),
    phone: z18.string().min(10, AUTH_MESSAGES.SIGNUP.HOSPITAL_PHONE_MIN),
    address: z18.string().min(1, AUTH_MESSAGES.SIGNUP.ADDRESS_REQUIRED),
    about: z18.string().min(1, AUTH_MESSAGES.SIGNUP.ABOUT_REQUIRED),
    pincode: z18.string().min(6, AUTH_MESSAGES.SIGNUP.PINCODE_MIN),
    since: z18.string().min(4, AUTH_MESSAGES.SIGNUP.YEAR_REQUIRED),
    password: z18.string().min(6, AUTH_MESSAGES.COMMON.PASSWORD_LENGTH)
  })
});
var forgotPasswordSchema = z18.object({
  body: z18.object({
    email: z18.string().email(AUTH_MESSAGES.FORGOT_PASSWORD.INVALID_EMAIL),
    role: z18.string().optional(),
    purpose: z18.string().optional()
  })
});
var resetPasswordSchema = z18.object({
  body: z18.object({
    email: z18.string().email(AUTH_MESSAGES.SIGNUP.INVALID_EMAIL).optional(),
    password: z18.string().min(6, AUTH_MESSAGES.COMMON.PASSWORD_LENGTH)
  })
});

// src/routes/auth.routes.ts
var { superAdminAuthController } = superAdminContainer();
var { doctorAuthController } = doctorContainer();
var { authController, otpController } = userContainer();
var { hospitalAuthController } = hospitalContainer();
var { googleAuthController } = userContainer();
var router = Router();
router.post("/send-otp", otpController.sendOtp.bind(otpController));
router.post("/RegistorDoctor", upload.fields([
  { name: "profileImage", maxCount: 1 },
  { name: "license", maxCount: 1 }
]), validate(doctorSignupSchema), doctorAuthController.registerDoctor.bind(doctorAuthController));
router.post("/superadmin/login", validate(loginSchema), superAdminAuthController.login.bind(superAdminAuthController));
router.post("/hospital/login", validate(loginSchema), hospitalAuthController.loginHospital.bind(hospitalAuthController));
router.post("/hospital/signup", upload.fields([{ name: "logo", maxCount: 1 }, { name: "licence", maxCount: 1 }]), validate(hospitalSignupSchema), hospitalAuthController.signup.bind(hospitalAuthController));
router.post("/verify-otp", otpController.verifyOtp.bind(otpController));
router.post("/signup", validate(patientSignupSchema), authController.signup.bind(authController));
router.post("/login", validate(loginSchema), authController.login.bind(authController));
router.post("/refresh", authController.refresh.bind(authController));
router.post("/reset-password", validate(resetPasswordSchema), authController.resetPassword.bind(authController));
router.post("/logout", authController.logout.bind(authController));
router.post("/doctor/login", validate(loginSchema), doctorAuthController.loginDoctor.bind(doctorAuthController));
router.get("/google", (req, res, next) => {
  const { role } = req.query;
  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: role,
    prompt: "select_account"
  })(req, res, next);
});
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || "http://localhost:5173"}/login?error=auth_failed`
  }),
  googleAuthController.handleCallback.bind(googleAuthController)
);
router.get("/selectHospitals", doctorAuthController.selectHospitals.bind(doctorAuthController));
router.get("/hospitals/:hospitalId/departments", doctorAuthController.getHospitalDepartments.bind(doctorAuthController));
router.get("/hospitals/:hospitalId/qualifications", doctorAuthController.getHospitalQualifications.bind(doctorAuthController));
router.get("/hospitals/:hospitalId/specializations", doctorAuthController.getHospitalSpecializations.bind(doctorAuthController));
var auth_routes_default = router;

// src/routes/patient.routes.ts
import { Router as Router2 } from "express";

// src/validators/patient.validator.ts
import { z as z19 } from "zod";
var patientProfileSchema = z19.object({
  body: z19.object({
    name: z19.string().min(1, "Name is required"),
    email: z19.string().email("Invalid email format"),
    phone: z19.union([z19.string(), z19.number()]).transform((val) => val.toString()).refine((val) => /^\d{10}$/.test(val), "Phone must be 10 digits"),
    currentPassword: z19.string().optional(),
    newPassword: z19.string().optional(),
    confirmNewPassword: z19.string().optional(),
    // Additional fields that might be sent in the profile payload
    fatherName: z19.string().optional(),
    gender: z19.string().optional(),
    dateOfBirth: z19.union([z19.string(), z19.date()]).optional(),
    address: z19.string().optional(),
    bloodGroup: z19.string().optional(),
    age: z19.union([z19.string(), z19.number()]).optional(),
    willRemoveImage: z19.boolean().optional(),
    image: z19.string().optional()
  }).refine((data) => {
    if (data.currentPassword || data.newPassword || data.confirmNewPassword) {
      if (!data.currentPassword) return false;
      if (data.newPassword && data.newPassword.length < 6) return false;
      if (data.newPassword !== data.confirmNewPassword) return false;
    }
    return true;
  }, {
    message: "Password validation failed",
    path: ["currentPassword"]
  })
});

// src/routes/patient.routes.ts
var { patientController, liveToken } = patientContainer();
var router2 = Router2();
router2.get("/me", patientController.getMe.bind(patientController));
router2.get("/hospitals", patientController.getHospitals.bind(patientController));
router2.get("/patients", patientController.getAllPatient.bind(patientController));
router2.patch("/patients", validate(patientProfileSchema), patientController.updatePatient.bind(patientController));
router2.patch("/patients/password", patientController.changePassword.bind(patientController));
router2.get("/hospitals/:id", patientController.selectedHospital.bind(patientController));
router2.get("/departments", patientController.getdepartments.bind(patientController));
router2.get("/departments/:id/doctors", patientController.getDoctorDepartment.bind(patientController));
router2.get("/doctors/:id", patientController.getDoctorById.bind(patientController));
router2.get("/doctors/:doctorId/slots", patientController.getAvailableSlots.bind(patientController));
router2.post("/appointments/check-duplicate", patientController.checkDuplicateAppointment.bind(patientController));
router2.post("/appointments", patientController.bookAppointment.bind(patientController));
router2.get("/patients/appointments", patientController.getAppoimentHistory.bind(patientController));
router2.get("/appointments/today", patientController.getTodayAppointments.bind(patientController));
router2.patch("/appointments/:id/cancel", patientController.appoinmentCancel.bind(patientController));
router2.get("/appointments/status/:sessionId", patientController.checkAppointmentStatus.bind(patientController));
router2.get("/livetoken", liveToken.getToken.bind(liveToken));
router2.get("/prescriptions", patientController.getPrescriptions.bind(patientController));
router2.get("/doctors/:doctorId/fee", patientController.getDoctorFee.bind(patientController));
router2.get("/wallet", patientController.getWallet.bind(patientController));
router2.post("/wallet/add", patientController.addToWallet.bind(patientController));
router2.post("/wallet/withdraw", patientController.withdrawFromWallet.bind(patientController));
router2.get("/locations", patientController.getLocations.bind(patientController));
var patient_routes_default = router2;

// src/routes/doctor.routes.ts
import { Router as Router3 } from "express";

// src/validators/doctor.validator.ts
import { z as z20 } from "zod";
var doctorUpdateSchema = z20.object({
  body: z20.object({
    name: z20.string().min(1, "Doctor name is required"),
    email: z20.string().email("Invalid email address"),
    phone: z20.string().min(10, "Phone number must be at least 10 digits"),
    address: z20.string().min(1, "Address is required"),
    qualification: z20.string().min(1, "Qualification is required"),
    experience: z20.string().min(1, "Experience is required"),
    department: z20.string().min(1, "Department is required"),
    specialization: z20.string().min(1, "Specialization is required"),
    about: z20.string().min(1, "About is required"),
    consultationTime: z20.union([
      z20.string(),
      z20.object({
        start: z20.string().min(1, "Start time is required"),
        end: z20.string().min(1, "End time is required")
      })
    ]).optional(),
    payment: z20.union([
      z20.string(),
      z20.object({
        type: z20.enum(["commission", "fixed"]),
        commissionPercentage: z20.string().optional(),
        fixedSalary: z20.string().optional(),
        payoutCycle: z20.enum(["weekly", "monthly"]),
        patientsPerDayLimit: z20.string().min(1, "Limit is required").refine((val) => {
          const num = parseInt(val);
          return !isNaN(num) && num >= 1 && num <= 20;
        }, {
          message: "Maximum 20 patients per day allowed"
        })
      })
    ]).optional(),
    currentPassword: z20.string().optional(),
    newPassword: z20.string().optional(),
    confirmPassword: z20.string().optional()
  }).refine((data) => {
    if (data.newPassword && data.newPassword.length > 0 && data.newPassword.length < 6) return false;
    return true;
  }, {
    message: "New password must be at least 6 characters",
    path: ["newPassword"]
  }).refine((data) => {
    if (data.newPassword && !data.currentPassword) return false;
    return true;
  }, {
    message: "Current password is required to change password",
    path: ["currentPassword"]
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  })
});
var leaveSchema = z20.object({
  body: z20.object({
    startDate: z20.string().min(1, "Start date is required"),
    endDate: z20.string().min(1, "End date is required"),
    leaveSession: z20.string().optional(),
    reason: z20.string().optional(),
    photo: z20.string().optional()
    // For base64 encoded photo if sent via body
  }).refine((data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.endDate) >= new Date(data.startDate);
    }
    return true;
  }, {
    message: "End date must be after start date",
    path: ["endDate"]
  })
});
var prescriptionSchema = z20.object({
  body: z20.object({
    medicines: z20.array(
      z20.object({
        name: z20.string().min(2, "Medicine name must be at least 2 characters"),
        dosage: z20.string().min(1, "Dosage is required"),
        duration: z20.string().min(1, "Duration is required")
      })
    ).min(1, "At least one medicine is required"),
    notes: z20.string().optional()
  })
});

// src/routes/doctor.routes.ts
var { doctorcontroller, appoimentController, consultation, slotcontroller, doctorDashboard } = doctorContainer();
var router3 = Router3();
router3.get("/me", doctorcontroller.getme.bind(doctorcontroller));
router3.patch("/reapply/:id", doctorcontroller.reapplyDoctor.bind(doctorcontroller));
router3.patch("/profile", upload.fields([
  { name: "profileImage", maxCount: 1 },
  { name: "license", maxCount: 1 }
]), validate(doctorUpdateSchema), doctorcontroller.updateDoctor.bind(doctorcontroller));
router3.post("/leaves", upload.single("photo"), validate(leaveSchema), doctorcontroller.applyLeave.bind(doctorcontroller));
router3.get("/leaves", doctorcontroller.getDoctorLeaves.bind(doctorcontroller));
router3.get("/appointments/upcoming", appoimentController.getUpcomingAppointments.bind(appoimentController));
router3.get("/consultation", consultation.getConsultation.bind(consultation));
router3.patch("/consultation/:id/status", consultation.markAsCompleted.bind(consultation));
router3.post("/prescription", validate(prescriptionSchema), consultation.prescription.bind(consultation));
router3.post("/schedules", slotcontroller.createDoctorSchedule.bind(slotcontroller));
router3.get("/schedules", slotcontroller.getDoctorSchedules.bind(slotcontroller));
router3.put("/schedules/:id", slotcontroller.updateDoctorSchedule.bind(slotcontroller));
router3.patch("/schedules/:id", slotcontroller.deleteDoctorSchedule.bind(slotcontroller));
router3.post("/salary-increase-request", doctorDashboard.SALARY_INCREASE_REQUEST.bind(doctorDashboard));
router3.get("/salary-increase-request", doctorDashboard.GET_SALARY_INCREASE_REQUEST.bind(doctorDashboard));
router3.get("/wallet", doctorDashboard.GET_WALLET.bind(doctorDashboard));
router3.post("/withdraw/wallet", doctorDashboard.WITHDRAW.bind(doctorDashboard));
var doctor_routes_default = router3;

// src/routes/hospital.routes.ts
import express from "express";

// src/controllers/hospital/department/implementation/department.controller.ts
var DepartmentManagementController = class {
  constructor(_departmentService) {
    this._departmentService = _departmentService;
  }
  async getDepartments(req, res, next) {
    try {
      const hospitalId = req.user?.userId;
      if (!hospitalId) {
        return ApiResponse.unauthorized(res, "Hospital ID not found in token");
      }
      const { page = 1, limit = 10, search = "", filter } = req.query;
      logger_default.debug(`Fetching departments with filter: ${filter}`);
      const paginatedDepartments = await this._departmentService.getDepartments(
        hospitalId,
        Number(page),
        Number(limit),
        search,
        filter
      );
      return ApiResponse.success(res, "Departments fetched successfully", paginatedDepartments, 200 /* OK */);
    } catch (error) {
      next(error);
    }
  }
  async createDepartment(req, res, next) {
    try {
      const hospitalId = req.user?.userId;
      if (!hospitalId) {
        return ApiResponse.unauthorized(res, "Hospital ID not found in token");
      }
      const departmentData = req.body;
      const file = req.file;
      const department = await this._departmentService.createDepartment(hospitalId, departmentData, file);
      return ApiResponse.success(res, "Department created successfully", department, 201 /* CREATED */);
    } catch (error) {
      next(error);
    }
  }
  async updateDepartment(req, res, next) {
    try {
      const { id } = req.params;
      const departmentData = req.body;
      const file = req.file;
      const department = await this._departmentService.updateDepartment(id, departmentData, file);
      if (!department) {
        return ApiResponse.notFound(res, "Department not found");
      }
      return ApiResponse.success(res, "Department updated successfully", department, 200 /* OK */);
    } catch (error) {
      next(error);
    }
  }
  async toggleStatus(req, res, next) {
    try {
      const { id } = req.params;
      const department = await this._departmentService.toggleStatus(id);
      if (!department) {
        return ApiResponse.notFound(res, "Department not found");
      }
      return ApiResponse.success(res, "Status toggled successfully", department, 200 /* OK */);
    } catch (error) {
      next(error);
    }
  }
};

// src/services/hospital/department/implementations/department.service.ts
import { Types as Types32 } from "mongoose";
var DepartmentService = class {
  constructor(_departmentRepo, _imageService, _subscriptionService, _departmentMapper) {
    this._departmentRepo = _departmentRepo;
    this._imageService = _imageService;
    this._subscriptionService = _subscriptionService;
    this._departmentMapper = _departmentMapper;
  }
  async getDepartments(hospitalId, page, limit, search, filter) {
    const query = {
      hospital_id: new Types32.ObjectId(hospitalId)
    };
    if (filter === "active") {
      query.isActive = true;
    } else if (filter === "blocked") {
      query.isActive = false;
    }
    const res = await this._departmentRepo.findWithPagination({
      page,
      limit,
      search,
      searchFields: ["departmentName", "description"],
      filter: query
    });
    return {
      ...res,
      data: res.data.map((dept) => this._departmentMapper.toDTO(dept))
    };
  }
  async createDepartment(hospitalId, data, file) {
    await this._subscriptionService.checkSubscriptionLimit(hospitalId, "maxDepartments");
    const departmentData = {
      ...data,
      hospital_id: new Types32.ObjectId(hospitalId)
    };
    if (file) {
      departmentData.image = await this._imageService.uploadImage(file.buffer, "hospital/departments");
    } else if (data.image && data.image.startsWith("data:image")) {
      departmentData.image = await this._imageService.uploadImage(data.image, "hospital/departments");
    }
    const created = await this._departmentRepo.create(departmentData);
    return this._departmentMapper.toDTO(created);
  }
  async updateDepartment(id, data, file) {
    const department = await this._departmentRepo.findById(id);
    if (!department) return null;
    const updateData = { ...data };
    if (file) {
      if (department.image) await this._imageService.deleteImage(department.image);
      updateData.image = await this._imageService.uploadImage(file.buffer, "hospital/departments");
    } else if (data.image && data.image.startsWith("data:image")) {
      if (department.image) await this._imageService.deleteImage(department.image);
      updateData.image = await this._imageService.uploadImage(data.image, "hospital/departments");
    } else if (data.image === "" && department.image) {
      await this._imageService.deleteImage(department.image);
      updateData.image = "";
    }
    const updated = await this._departmentRepo.update(id, updateData);
    return updated ? this._departmentMapper.toDTO(updated) : null;
  }
  async toggleStatus(id) {
    const department = await this._departmentRepo.findById(id);
    if (!department) return null;
    const updated = await this._departmentRepo.update(id, { isActive: !department.isActive });
    return updated ? this._departmentMapper.toDTO(updated) : null;
  }
};

// src/di/department.di.ts
var departmentContiner = () => {
  const departmentRepo = new DepartmentRepository(department_model_default);
  const hospitalRepo = new HospitalRepository(HospitalModel);
  const subscriptionRepo = new SubscriptionRepository();
  const doctorRepo = new DoctorRepository(DoctorModel);
  const userRepo = new UserRepository(Patient);
  const subscriptionMapper = new SubscriptionMapper();
  const subscriptionService = new HospitalSubscriptionService(
    subscriptionRepo,
    hospitalRepo,
    doctorRepo,
    departmentRepo,
    userRepo,
    subscriptionMapper
  );
  const imageService = new CloudinaryImageService();
  const departmentMapper = new DepartmentMapper();
  const departmentService = new DepartmentService(departmentRepo, imageService, subscriptionService, departmentMapper);
  const departmentManagement2 = new DepartmentManagementController(departmentService);
  return {
    departmentManagement: departmentManagement2
  };
};

// src/controllers/hospital/qualification/implementation/qualification.controller.ts
var QualificationManagementController = class {
  constructor(_qualificationService) {
    this._qualificationService = _qualificationService;
  }
  async getQualifications(req, res, next) {
    try {
      const hospitalId = req.user?.userId;
      if (!hospitalId) {
        return ApiResponse.unauthorized(res, "Hospital ID not found in token");
      }
      const { page = 1, limit = 10, search = "", filter } = req.query;
      const paginatedQualifications = await this._qualificationService.getQualifications(
        hospitalId,
        Number(page),
        Number(limit),
        search,
        filter
      );
      return ApiResponse.success(res, "Qualifications fetched successfully", paginatedQualifications, 200 /* OK */);
    } catch (error) {
      next(error);
    }
  }
  async createQualification(req, res, next) {
    try {
      const hospitalId = req.user?.userId;
      if (!hospitalId) {
        return ApiResponse.unauthorized(res, "Hospital ID not found in token");
      }
      const qualificationData = req.body;
      const file = req.file;
      const qualification = await this._qualificationService.createQualification(hospitalId, qualificationData, file);
      return ApiResponse.success(res, "Qualification created successfully", qualification, 201 /* CREATED */);
    } catch (error) {
      next(error);
    }
  }
  async updateQualification(req, res, next) {
    try {
      const { id } = req.params;
      const qualificationData = req.body;
      const file = req.file;
      const qualification = await this._qualificationService.updateQualification(id, qualificationData, file);
      if (!qualification) {
        return ApiResponse.notFound(res, "Qualification not found");
      }
      return ApiResponse.success(res, "Qualification updated successfully", qualification, 200 /* OK */);
    } catch (error) {
      next(error);
    }
  }
  async toggleStatus(req, res, next) {
    try {
      const { id } = req.params;
      const qualification = await this._qualificationService.toggleStatus(id);
      if (!qualification) {
        return ApiResponse.notFound(res, "Qualification not found");
      }
      return ApiResponse.success(res, "Status toggled successfully", qualification, 200 /* OK */);
    } catch (error) {
      next(error);
    }
  }
};

// src/di/qualification.di.ts
var qualificationContainer = () => {
  const qualificationRepository = new QualificationRepository(qualification_model_default);
  const qualificationMapper = new QualificationMapper();
  const imageService = new CloudinaryImageService();
  const qualificationService = new QualificationService(qualificationRepository, imageService, qualificationMapper);
  const qualificationManagement2 = new QualificationManagementController(qualificationService);
  return {
    qualificationManagement: qualificationManagement2
  };
};

// src/controllers/hospital/specialization/implementation/specialization.controller.ts
var SpecializationManagementController = class {
  constructor(_specializationService) {
    this._specializationService = _specializationService;
  }
  async getSpecializations(req, res, next) {
    try {
      const hospitalId = req.user?.userId;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search;
      const filterStatus = req.query.filter;
      if (!hospitalId) {
        return ApiResponse.unauthorized(res, "Hospital ID not found");
      }
      const result = await this._specializationService.getSpecializations(hospitalId, { page, limit, search, filter: filterStatus });
      return ApiResponse.success(res, "Specializations fetched successfully", result, 200 /* OK */);
    } catch (error) {
      next(error);
    }
  }
  async createSpecialization(req, res, next) {
    try {
      const hospitalId = req.user?.userId;
      const specializationData = req.body;
      const file = req.file;
      if (!hospitalId) {
        return ApiResponse.unauthorized(res, "Hospital ID not found");
      }
      const specialization = await this._specializationService.createSpecialization(hospitalId, specializationData, file);
      return ApiResponse.success(res, "Specialization created successfully", specialization, 201 /* CREATED */);
    } catch (error) {
      next(error);
    }
  }
  async updateSpecialization(req, res, next) {
    try {
      const { id } = req.params;
      const specializationData = req.body;
      logger_default.debug(`Updating specialization ${id} with data: ${JSON.stringify(specializationData)}`);
      const file = req.file;
      const specialization = await this._specializationService.updateSpecialization(id, specializationData, file);
      if (!specialization) {
        return ApiResponse.error(res, "Specialization not found", 404 /* NOT_FOUND */);
      }
      return ApiResponse.success(res, "Specialization updated successfully", specialization, 200 /* OK */);
    } catch (error) {
      next(error);
    }
  }
  async toggleStatus(req, res, next) {
    try {
      const { id } = req.params;
      const specialization = await this._specializationService.toggleStatus(id);
      if (!specialization) {
        return ApiResponse.error(res, "Specialization not found", 404 /* NOT_FOUND */);
      }
      return ApiResponse.success(res, "Specialization status toggled", specialization, 200 /* OK */);
    } catch (error) {
      next(error);
    }
  }
};

// src/di/specialization.di.ts
var specializationContainer = () => {
  const specializationRepo = new SpecializationRepository();
  const specilizationMaper = new SpecializationMapper();
  const imageService = new CloudinaryImageService();
  const specializationService = new SpecializationService(specializationRepo, imageService, specilizationMaper);
  const specializationManagement2 = new SpecializationManagementController(specializationService);
  return {
    specializationManagement: specializationManagement2
  };
};

// src/validators/hospital.validator.ts
import { z as z21 } from "zod";
var hospitalEditSchema = z21.object({
  body: z21.object({
    hospitalName: z21.string().min(1, "Hospital name is required"),
    email: z21.string().email("Invalid email format"),
    phone: z21.string().min(1, "Phone is required"),
    pincode: z21.string().min(1, "Pincode is required"),
    address: z21.string().min(1, "Address is required"),
    since: z21.union([z21.string(), z21.number()]).transform((v) => Number(v)).refine((v) => v >= 1900 && v <= (/* @__PURE__ */ new Date()).getFullYear(), "Invalid year"),
    password: z21.string().optional(),
    confirmPassword: z21.string().optional(),
    about: z21.string().optional(),
    isActive: z21.union([z21.boolean(), z21.string()]).transform((v) => v === "true" || v === true).optional(),
    logo: z21.string().optional(),
    licence: z21.string().optional(),
    subscription: z21.string().optional(),
    // Often stringified JSON
    images: z21.string().optional()
    // Often stringified JSON
  }).refine((data) => {
    if (data.password) {
      if (data.password.length < 6) return false;
      if (data.password !== data.confirmPassword) return false;
    }
    return true;
  }, {
    message: "Password validation failed",
    path: ["password"]
  })
});
var addPatientSchema = z21.object({
  body: z21.object({
    name: z21.string().min(1, "Name is required"),
    email: z21.string().email("Invalid email format"),
    phone: z21.string().regex(/^\d{10}$/, "Phone number must be 10 digits"),
    password: z21.string().min(6, "Password must be at least 6 characters"),
    fatherName: z21.string().optional(),
    gender: z21.enum(["male", "female", "other", ""]).optional(),
    dateOfBirth: z21.string().optional(),
    address: z21.string().optional(),
    bloodGroup: z21.string().optional(),
    isActive: z21.union([z21.boolean(), z21.string()]).transform((v) => v === "true" || v === true).optional(),
    image: z21.string().optional()
  })
});
var addDoctorSchema = z21.object({
  body: z21.object({
    name: z21.string().min(1, "Doctor name is required"),
    email: z21.string().email("Invalid email address"),
    password: z21.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z21.string(),
    phone: z21.string().min(10, "Phone number must be at least 10 digits"),
    address: z21.string().min(1, "Address is required"),
    qualification: z21.string().min(1, "Qualification is required"),
    experience: z21.string().min(1, "Experience is required"),
    department: z21.string().min(1, "Department is required"),
    specialization: z21.string().min(1, "Specialization is required"),
    about: z21.string().min(1, "About is required"),
    profileImage: z21.string().optional(),
    license: z21.string().optional()
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
  })
});

// src/routes/hospital.routes.ts
var router4 = express.Router();
var { specializationManagement } = specializationContainer();
var { qualificationManagement } = qualificationContainer();
var { departmentManagement } = departmentContiner();
var { doctorManagement, patientManagement, hospitalController, hospitalSubscriptionController, dashbordController, doctorSalaryController } = hospitalContainer();
router4.get("/me", hospitalController.getHospitalProfile.bind(hospitalController));
router4.get("/hospitals/:id", hospitalController.getSelectedHospital.bind(hospitalController));
router4.patch("/reapply", hospitalController.reapply.bind(hospitalController));
router4.patch("/hospitals", upload.fields([
  { name: "logo", maxCount: 1 },
  { name: "licence", maxCount: 1 },
  { name: "landscape", maxCount: 3 },
  { name: "medicalTeam", maxCount: 3 },
  { name: "patientCare", maxCount: 3 },
  { name: "services", maxCount: 3 }
]), validate(hospitalEditSchema), hospitalController.updateHospital.bind(hospitalController));
router4.get("/doctors", doctorManagement.getAllDoctors.bind(doctorManagement));
router4.patch("/doctors/:id", upload.fields([
  { name: "profileImage", maxCount: 1 },
  { name: "license", maxCount: 1 }
]), validate(doctorUpdateSchema), doctorManagement.updateDoctor.bind(doctorManagement));
router4.get("/doctors/kyc", doctorManagement.getAllKycDoctors.bind(doctorManagement));
router4.get("/doctors/leaves", doctorManagement.getLeaveDoctors.bind(doctorManagement));
router4.get("/doctors/:id", doctorManagement.getDoctorDetails.bind(doctorManagement));
router4.patch("/doctors/:id/toggle", doctorManagement.doctorsToggle.bind(doctorManagement));
router4.patch("/doctors/:id/accept", doctorManagement.acceptDoctor.bind(doctorManagement));
router4.patch("/doctors/:id/reject", doctorManagement.rejectDoctor.bind(doctorManagement));
router4.patch("/doctors/:id/revision", doctorManagement.requestRevisionDoctor.bind(doctorManagement));
router4.patch("/leaves/:id/status", doctorManagement.updateLeaveStatus.bind(doctorManagement));
router4.get("/getdepsepquly", doctorManagement.getDeptSpecs.bind(doctorManagement));
router4.post("/doctors", upload.fields([
  { name: "profileImage", maxCount: 1 },
  { name: "license", maxCount: 1 }
]), validate(addDoctorSchema), doctorManagement.registerDoctor.bind(doctorManagement));
router4.patch("/patients/:id/toggle", patientManagement.patientsToggle.bind(patientManagement));
router4.get("/patients", patientManagement.getAllPatient.bind(patientManagement));
router4.post("/patients", upload.single("image"), validate(addPatientSchema), patientManagement.addPatient.bind(patientManagement));
router4.patch("/patients/:id", upload.single("image"), validate(addPatientSchema), patientManagement.updatePatient.bind(patientManagement));
router4.post("/departments", upload.single("image"), departmentManagement.createDepartment.bind(departmentManagement));
router4.get("/departments", departmentManagement.getDepartments.bind(departmentManagement));
router4.patch("/departments/:id/toggle", departmentManagement.toggleStatus.bind(departmentManagement));
router4.patch("/departments/:id", upload.single("image"), departmentManagement.updateDepartment.bind(departmentManagement));
router4.get("/qualifications", qualificationManagement.getQualifications.bind(qualificationManagement));
router4.post("/qualifications", upload.single("image"), qualificationManagement.createQualification.bind(qualificationManagement));
router4.patch("/qualifications/:id/toggle", qualificationManagement.toggleStatus.bind(qualificationManagement));
router4.patch("/qualifications/:id", upload.single("image"), qualificationManagement.updateQualification.bind(qualificationManagement));
router4.get("/specializations", specializationManagement.getSpecializations.bind(specializationManagement));
router4.post("/specializations", upload.single("image"), specializationManagement.createSpecialization.bind(specializationManagement));
router4.patch("/specializations/:id/toggle", specializationManagement.toggleStatus.bind(specializationManagement));
router4.patch("/specializations/:id", upload.single("image"), specializationManagement.updateSpecialization.bind(specializationManagement));
router4.get("/subscription", hospitalSubscriptionController.getActiveSubscriptions.bind(hospitalSubscriptionController));
router4.get("/subscription/protection", hospitalSubscriptionController.protection.bind(hospitalSubscriptionController));
router4.get("/subscription/current", hospitalSubscriptionController.getCurrentSubscription.bind(hospitalSubscriptionController));
router4.post("/subscription/downgrade", hospitalSubscriptionController.downgradeSubscription.bind(hospitalSubscriptionController));
router4.get("/dashboard-stats", dashbordController.getstatus.bind(dashbordController));
router4.get("/getdoctorstatus", dashbordController.getDoctorStatus.bind(dashbordController));
router4.get("/kyc-stats", dashbordController.getKycStats.bind(dashbordController));
router4.get("/common-stats", dashbordController.getCommonStats.bind(dashbordController));
router4.get("/doctors-salary-requests", doctorSalaryController.getDoctorSalaryRequests.bind(doctorSalaryController));
router4.patch("/doctors-salary-requests/:id/status", doctorSalaryController.updateSalaryRequestStatus.bind(doctorSalaryController));
router4.get("/wallet", dashbordController.getWallet.bind(dashbordController));
router4.post("/wallet/withdraw", dashbordController.withdraw.bind(dashbordController));
router4.get("/REQCansation", dashbordController.getReqcancalation.bind(dashbordController));
router4.patch("/:id/REQCansation", dashbordController.approvecancellation.bind(dashbordController));
router4.post("/:id/REQCansation", dashbordController.rejectcancellation.bind(dashbordController));
var hospital_routes_default = router4;

// src/routes/superAdmin.routes.ts
import express2 from "express";

// src/validators/superAdmin.validator.ts
import { z as z22 } from "zod";
var subscriptionSchema = z22.object({
  body: z22.object({
    planName: z22.string().min(1, "Plan name is required."),
    description: z22.string().min(1, "Description is required."),
    duration: z22.union([z22.string(), z22.number()]).transform((v) => Number(v)).refine((v) => !isNaN(v) && v >= 1, "Duration must be a positive number."),
    durationUnit: z22.enum(["months", "years"]),
    amount: z22.union([z22.string(), z22.number()]).transform((v) => Number(v)).refine((v) => !isNaN(v) && v >= 0, "Amount must be a positive number.")
  })
});
var hospitalEditSchema2 = z22.object({
  body: z22.object({
    hospitalName: z22.string().min(1, "Hospital name is required"),
    email: z22.string().email("Invalid email format"),
    phone: z22.string().min(1, "Phone is required"),
    pincode: z22.string().min(1, "Pincode is required"),
    address: z22.string().min(1, "Address is required"),
    since: z22.union([z22.string(), z22.number()]).transform((v) => Number(v)).refine((v) => v >= 1900 && v <= (/* @__PURE__ */ new Date()).getFullYear(), "Invalid year"),
    about: z22.string().optional(),
    isActive: z22.union([z22.boolean(), z22.string()]).transform((v) => v === "true" || v === true).optional(),
    logo: z22.string().optional(),
    licence: z22.string().optional(),
    subscription: z22.string().optional()
  })
});
var patientEditSchema = z22.object({
  body: z22.object({
    name: z22.string().min(1, "Name is required"),
    email: z22.string().email("Invalid email format"),
    phone: z22.string().regex(/^\d{10}$/, "Phone must be exactly 10 digits"),
    fatherName: z22.string().optional(),
    gender: z22.string().optional(),
    dateOfBirth: z22.string().optional(),
    address: z22.string().optional(),
    bloodGroup: z22.string().optional(),
    isActive: z22.union([z22.boolean(), z22.string()]).transform((v) => v === "true" || v === true).optional(),
    willRemoveImage: z22.union([z22.boolean(), z22.string()]).transform((v) => v === "true" || v === true).optional()
  })
});

// src/routes/superAdmin.routes.ts
var router5 = express2.Router();
var { dashboardController, hospitalController: hospitalController2, kycController, patientManagementController, subscriptionController } = superAdminContainer();
router5.get("/dashboard/stats", dashboardController.getDashboardStats.bind(dashboardController));
router5.get("/me", dashboardController.getme.bind(dashboardController));
router5.get("/hospitals", hospitalController2.hospitalManagement.bind(hospitalController2));
router5.patch("/hospitals/active", hospitalController2.setActive.bind(hospitalController2));
router5.post("/hospitals", upload.fields([{ name: "logo", maxCount: 1 }, { name: "licence", maxCount: 1 }]), validate(hospitalSignupSchema), hospitalController2.addHospital.bind(hospitalController2));
router5.patch("/hospitals/:id", upload.fields([{ name: "logo", maxCount: 1 }, { name: "licence", maxCount: 1 }]), validate(hospitalEditSchema2), hospitalController2.editHospital.bind(hospitalController2));
router5.patch("/hospitals/:id/status/:status", hospitalController2.hospitalStatus.bind(hospitalController2));
router5.get("/kyc", kycController.hospitals.bind(kycController));
router5.get("/patients", patientManagementController.getPatients.bind(patientManagementController));
router5.patch("/patients/active", patientManagementController.togglePatientActive.bind(patientManagementController));
router5.post("/patients", upload.single("image"), validate(addPatientSchema), patientManagementController.addPatient.bind(patientManagementController));
router5.patch("/patients/:id", upload.single("image"), validate(patientEditSchema), patientManagementController.updatePatient.bind(patientManagementController));
router5.get("/subscription", subscriptionController.getSubscriptions.bind(subscriptionController));
router5.get("/subscribeHospital", subscriptionController.subscribeHospital.bind(subscriptionController));
router5.post("/subscription", validate(subscriptionSchema), subscriptionController.addSubscription.bind(subscriptionController));
router5.patch("/subscription/toggle", subscriptionController.toggleSubscription.bind(subscriptionController));
router5.patch("/subscription/:id", validate(subscriptionSchema), subscriptionController.updateSubscription.bind(subscriptionController));
router5.get("/wallet", dashboardController.getWallet.bind(dashboardController));
router5.post("/wallet/withdraw", dashboardController.withdraw.bind(dashboardController));
var superAdmin_routes_default = router5;

// src/middleware/superAdmin.auth.middleware.ts
var { tokenService } = superAdminContainer();
function superAdminAuthMiddleware(req, res, next) {
  try {
    const token = req.cookies?.accessToken;
    if (!token) {
      return res.status(401 /* UNAUTHORIZED */).json({ message: "Access token missing" });
    }
    const payload = tokenService.verifyAccessToken(token);
    if (payload.role !== "superadmin") {
      logger_default.warn(`Attempted superAdmin access by user with role: ${payload.role}`);
      return res.status(403 /* FORBIDDEN */).json({ message: "Insufficient permissions" });
    }
    req.user = payload;
    next();
  } catch (error) {
    logger_default.error("SuperAdmin auth middleware error:", error);
    return res.status(401 /* UNAUTHORIZED */).json({ message: "Invalid or expired token" });
  }
}

// src/middleware/error.middleware.ts
import { ZodError } from "zod";
function errorHandler(err, req, res, _next) {
  if (err instanceof ZodError) {
    return ApiResponse.validationError(res, MESSAGES.VALIDATION.INVALID_INPUT, err.issues);
  }
  if (err.name === "MulterError" && err.code === "LIMIT_FILE_SIZE") {
    return ApiResponse.error(res, "The uploaded file is too large. Please ensure the file size is within the allowed limit.", null, 413 /* PAYLOAD_TOO_LARGE */);
  }
  if (err.type === "entity.too.large") {
    return ApiResponse.error(res, "The request payload is too large. Please ensure data size is within the allowed limit.", null, 413 /* PAYLOAD_TOO_LARGE */);
  }
  let statusCode = 500 /* INTERNAL_SERVER_ERROR */;
  if ("statusCode" in err && typeof err.statusCode === "number") {
    statusCode = err.statusCode;
  } else if ("status" in err && typeof err.status === "number") {
    statusCode = err.status;
  }
  const message = err.message || MESSAGES.SERVER.ERROR;
  if (err instanceof AppError) {
    if (err.isOperational) {
      logger_default.error(err.message);
      return ApiResponse.error(res, message, null, statusCode);
    }
    logger_default.error(`Unexpected error: ${err.message}`);
    return ApiResponse.error(res, MESSAGES.SERVER.ERROR, null, 500 /* INTERNAL_SERVER_ERROR */);
  }
  logger_default.error(`Unhandled error: ${err.message}`);
  return ApiResponse.error(res, message, null, statusCode);
}
var error_middleware_default = errorHandler;

// src/routes/payment.routes.ts
import express3 from "express";

// src/services/payment/implementation/payment.service.ts
import { Types as Types33 } from "mongoose";

// src/config/stripe.ts
import Stripe from "stripe";
var stripe = new Stripe(process.env.STRIPE_SECRET_KEY.trim());
var stripe_default = stripe;

// src/services/payment/implementation/payment.service.ts
var PaymentService = class {
  constructor(subscriptionRepository, hospitalRepository, patientService, paymentMapper, _WalletRepository) {
    this.subscriptionRepository = subscriptionRepository;
    this.hospitalRepository = hospitalRepository;
    this.patientService = patientService;
    this.paymentMapper = paymentMapper;
    this._WalletRepository = _WalletRepository;
  }
  async createCheckoutSession(planId, hospitalId, upgradeType) {
    const plan = await this.subscriptionRepository.findById(planId);
    if (!plan) {
      ApiResponse.throwError(404 /* NOT_FOUND */, "Subscription plan not found");
    }
    const hospital = await this.hospitalRepository.findById(hospitalId);
    if (!hospital) {
      ApiResponse.throwError(404 /* NOT_FOUND */, "Hospital not found");
    }
    let baseAmount = plan.amount;
    if (upgradeType === "upgrade" && hospital.subscription?.status === "active") {
      const currentSub = hospital.subscription;
      if (currentSub.startDate && currentSub.endDate && currentSub.amount > 0) {
        const totalDays = Math.max(1, (currentSub.endDate.getTime() - currentSub.startDate.getTime()) / (1e3 * 60 * 60 * 24));
        const remainingDays = Math.max(0, (currentSub.endDate.getTime() - (/* @__PURE__ */ new Date()).getTime()) / (1e3 * 60 * 60 * 24));
        const remainingCredit = currentSub.amount / totalDays * remainingDays;
        baseAmount = Math.max(0, baseAmount - remainingCredit);
      }
    }
    const taxRate = 0.1;
    const taxAmount = baseAmount * taxRate;
    const totalAmount = baseAmount + taxAmount;
    if (baseAmount === 0 || totalAmount === 0) {
      const startDate = /* @__PURE__ */ new Date();
      const endDate = /* @__PURE__ */ new Date();
      const duration = plan.duration || 1;
      const unit = plan.durationUnit || "months";
      if (unit === "months") endDate.setMonth(endDate.getMonth() + duration);
      else if (unit === "years") endDate.setFullYear(endDate.getFullYear() + duration);
      await this.hospitalRepository.update(hospitalId, {
        subscription: {
          plan: plan.planName,
          amount: 0,
          status: "active",
          startDate,
          endDate
        }
      });
      return { url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/hospital/payment-success?plan=free` };
    }
    logger_default.info(`[PaymentService] Creating Hospital Subscription Stripe session for plan: ${plan.planName}`);
    try {
      const session = await stripe_default.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "inr",
              product_data: {
                name: plan.planName,
                description: plan.description || `Subscription for ${plan.planName}`
              },
              unit_amount: Math.round(totalAmount * 100)
            },
            quantity: 1
          }
        ],
        metadata: {
          planId,
          hospitalId,
          upgradeType: upgradeType || "new"
        },
        success_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/hospital/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/hospital/subscription`
      });
      return this.paymentMapper.toCheckoutDTO(session.url);
    } catch (error) {
      logger_default.error(`[PaymentService] Hospital subscription session creation failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
  async createAppointmentCheckoutSession(appointmentData, patientId) {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const metadata = {
      type: "appointment",
      patientId: String(patientId),
      doctorId: String(appointmentData.doctorId),
      hospitalId: String(appointmentData.hospitalId),
      appointmentDate: String(appointmentData.appointmentDate),
      mode: appointmentData.mode,
      slotStartTime: appointmentData.slotStartTime,
      slotEndTime: appointmentData.slotEndTime,
      tokenNumber: String(appointmentData.tokenNumber),
      session: appointmentData.session || "",
      patientName: appointmentData.patientDetails.name,
      patientAge: String(appointmentData.patientDetails.age),
      patientPhone: appointmentData.patientDetails.phone,
      patientEmail: appointmentData.patientDetails.email || "",
      patientAddress: appointmentData.patientDetails.address || "",
      bloodPressure: appointmentData.bloodPressure || "",
      heartRate: appointmentData.heartRate || "",
      weight: appointmentData.weight || "",
      doctorName: appointmentData.doctorName || "",
      totalAmount: String(appointmentData.totalAmount || 0)
    };
    try {
      const session = await stripe_default.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "inr",
              product_data: {
                name: `Appointment with Dr. ${appointmentData.doctorName || "Doctor"}`,
                description: `Appointment on ${new Date(appointmentData.appointmentDate).toLocaleDateString()}`
              },
              unit_amount: Math.round(Number(metadata.totalAmount) * 100) || 0
            },
            quantity: 1
          }
        ],
        metadata,
        success_url: `${frontendUrl}/patient/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${frontendUrl}/patient/payment-failed`
      });
      return this.paymentMapper.toCheckoutDTO(session.url);
    } catch (error) {
      logger_default.error(`[PaymentService] Stripe session creation failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
  async handleWebhook(signature, payload) {
    let event;
    try {
      event = stripe_default.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET.trim()
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      ApiResponse.throwError(400 /* BAD_REQUEST */, `Webhook Error: ${message}`);
    }
    if (event && event.type === "checkout.session.completed") {
      const session = event.data.object;
      const metadata = session.metadata;
      if (!metadata) return;
      if (metadata.type === "appointment") {
        logger_default.info(`[PaymentService.handleWebhook] Processing appointment for patient: ${metadata.patientId}`);
        try {
          const appointmentData = {
            bookedBy: new Types33.ObjectId(metadata.patientId),
            doctorId: new Types33.ObjectId(metadata.doctorId),
            hospitalId: new Types33.ObjectId(metadata.hospitalId),
            appointmentDate: new Date(metadata.appointmentDate),
            mode: metadata.mode,
            status: "pending" /* PENDING */,
            slotStartTime: metadata.slotStartTime,
            slotEndTime: metadata.slotEndTime,
            tokenNumber: Number(metadata.tokenNumber),
            session: metadata.session,
            patientDetails: {
              name: metadata.patientName,
              age: Number(metadata.patientAge),
              phone: metadata.patientPhone,
              email: metadata.patientEmail,
              address: metadata.patientAddress
            },
            bloodPressure: metadata.bloodPressure,
            heartRate: metadata.heartRate,
            weight: metadata.weight,
            paymentId: session.id,
            totalAmount: Number(metadata.totalAmount)
          };
          await this.patientService.bookAppointment(metadata.patientId, appointmentData);
          logger_default.info(`[PaymentService.handleWebhook] Appointment successfully processed via webhook`);
        } catch (error) {
          logger_default.error(`[PaymentService.handleWebhook] ERROR during webhook appointment processing: ${error instanceof Error ? error.message : String(error)}`);
          throw error;
        }
        return;
      }
      const { planId, hospitalId, upgradeType } = metadata;
      if (planId && hospitalId) {
        const plan = await this.subscriptionRepository.findById(planId);
        const hospital = await this.hospitalRepository.findById(hospitalId);
        if (plan && hospital) {
          const duration = plan.duration || 1;
          const unit = plan.durationUnit || "months";
          const startDate = /* @__PURE__ */ new Date();
          const endDate = /* @__PURE__ */ new Date();
          if (unit === "months") endDate.setMonth(endDate.getMonth() + duration);
          else if (unit === "years") endDate.setFullYear(endDate.getFullYear() + duration);
          const newSubscription = {
            planId: new Types33.ObjectId(planId),
            plan: plan.planName,
            amount: plan.amount,
            status: "active",
            startDate,
            endDate
          };
          await this.hospitalRepository.update(hospitalId, {
            subscription: {
              ...hospital.subscription,
              ...newSubscription,
              upgradeType: upgradeType || "new",
              ...upgradeType === "upgrade" || upgradeType === "new" || upgradeType === "activate_downgrade" ? { pendingPlanId: void 0, pendingPlanName: void 0, pendingActivationDate: void 0 } : {}
            }
          });
          const amountPaid = (session.amount_total || 0) / 100;
          if (amountPaid > 0) {
            const superAdminId = process.env.SUPER_ADMIN_ID;
            await this._WalletRepository.creditWallet(superAdminId, amountPaid);
          }
        }
      }
    }
  }
};

// src/controllers/payment/implementation/payment.controller.ts
var PaymentController = class {
  constructor(paymentService, _token) {
    this.paymentService = paymentService;
    this._token = _token;
  }
  async checkoutPayment(req, res) {
    try {
      const { planId } = req.body;
      const { accessToken } = req.cookies;
      const decoded = this._token.verifyAccessToken(accessToken);
      const hospitalId = decoded.userId;
      if (!planId) {
        ApiResponse.error(res, "Plan ID is required", null, 400 /* BAD_REQUEST */);
        return;
      }
      console.log("Initiating checkout with planId:", planId, "and hospitalId:", hospitalId);
      const result = await this.paymentService.createCheckoutSession(planId, hospitalId);
      console.log("Created Stripe Checkout Session:", result);
      res.status(200 /* OK */).json({
        success: true,
        url: result.url
      });
    } catch (error) {
      logger_default.error("Checkout session creation failed:", error);
      const statusCode = error instanceof AppError ? error.statusCode : 500 /* INTERNAL_SERVER_ERROR */;
      const message = error instanceof Error ? error.message : "Payment failed";
      res.status(statusCode).json({
        success: false,
        message
      });
    }
  }
  async appointmentCheckout(req, res) {
    try {
      const { bookingData } = req.body;
      const { accessToken } = req.cookies;
      const decoded = this._token.verifyAccessToken(accessToken);
      const patientId = decoded.userId;
      if (!bookingData) {
        ApiResponse.error(res, "Booking data is required", null, 400 /* BAD_REQUEST */);
        return;
      }
      const result = await this.paymentService.createAppointmentCheckoutSession(bookingData, patientId);
      res.status(200 /* OK */).json({
        success: true,
        url: result.url
      });
    } catch (error) {
      logger_default.error("Appointment checkout failed:", error);
      const statusCode = error instanceof AppError ? error.statusCode : 500 /* INTERNAL_SERVER_ERROR */;
      const message = error instanceof Error ? error.message : "Payment failed";
      res.status(statusCode).json({
        success: false,
        message
      });
    }
  }
  async upgradeSubscription(req, res) {
    try {
      const { newPlanId } = req.body;
      const { accessToken } = req.cookies;
      const decoded = this._token.verifyAccessToken(accessToken);
      const hospitalId = decoded.userId;
      if (!newPlanId) {
        ApiResponse.error(res, "New Plan ID is required", null, 400 /* BAD_REQUEST */);
        return;
      }
      console.log("Initiating upgrade checkout with newPlanId:", newPlanId, "and hospitalId:", hospitalId);
      const result = await this.paymentService.createCheckoutSession(newPlanId, hospitalId, "upgrade");
      res.status(200 /* OK */).json({
        success: true,
        url: result.url
      });
    } catch (error) {
      logger_default.error("Upgrade checkout session creation failed:", error);
      const statusCode = error instanceof AppError ? error.statusCode : 500 /* INTERNAL_SERVER_ERROR */;
      const message = error instanceof Error ? error.message : "Payment failed";
      res.status(statusCode).json({
        success: false,
        message
      });
    }
  }
  async activateDowngradeSubscription(req, res) {
    try {
      const { planId } = req.body;
      const { accessToken } = req.cookies;
      const decoded = this._token.verifyAccessToken(accessToken);
      const hospitalId = decoded.userId;
      if (!planId) {
        ApiResponse.error(res, "Plan ID is required", null, 400 /* BAD_REQUEST */);
        return;
      }
      console.log("Initiating activate_downgrade checkout with planId:", planId, "and hospitalId:", hospitalId);
      const result = await this.paymentService.createCheckoutSession(planId, hospitalId, "activate_downgrade");
      res.status(200 /* OK */).json({
        success: true,
        url: result.url
      });
    } catch (error) {
      logger_default.error("Activate downgrade checkout session creation failed:", error);
      const statusCode = error instanceof AppError ? error.statusCode : 500 /* INTERNAL_SERVER_ERROR */;
      const message = error instanceof Error ? error.message : "Payment failed";
      res.status(statusCode).json({
        success: false,
        message
      });
    }
  }
  async handleWebhook(req, res) {
    try {
      const sig = req.headers["stripe-signature"];
      logger_default.info(`[PaymentController.handleWebhook] Received webhook with signature: ${sig}`);
      await this.paymentService.handleWebhook(sig, req.body);
      res.status(200 /* OK */).json({ received: true });
    } catch (error) {
      logger_default.error(`[PaymentController.handleWebhook] Webhook handling failed:`, error);
      const statusCode = error instanceof AppError ? error.statusCode : 400 /* BAD_REQUEST */;
      const message = error instanceof Error ? error.message : "Unknown error";
      res.status(statusCode).send(`Webhook Error: ${message}`);
    }
  }
};

// src/dto/payment/checkout-response.dto.ts
import { z as z23 } from "zod";
var CheckoutResponseSchema = z23.object({
  url: z23.string().nullable()
});

// src/mappers/payment.mapper.ts
var PaymentMapper = class {
  toCheckoutDTO(url) {
    return CheckoutResponseSchema.parse({ url });
  }
};

// src/di/payment.di.ts
var paymentContainer = () => {
  const hospitalRepo = new HospitalRepository(HospitalModel);
  const subscriptionRepo = new SubscriptionRepository();
  const token = new TokenService();
  const { patientService } = patientContainer();
  const paymentMapper = new PaymentMapper();
  const WalletRepo = new WalletRepository(Wallet);
  const paymentService = new PaymentService(subscriptionRepo, hospitalRepo, patientService, paymentMapper, WalletRepo);
  const paymentController2 = new PaymentController(paymentService, token);
  return {
    paymentController: paymentController2,
    paymentService
  };
};

// src/routes/payment.routes.ts
var router6 = express3.Router();
var { paymentController } = paymentContainer();
var { hospitalAuthMiddleware } = hospitalContainer();
var { patientAuthMiddleware } = patientContainer();
router6.post("/checkout", hospitalAuthMiddleware.handle, paymentController.checkoutPayment.bind(paymentController));
router6.post("/appointment-checkout", patientAuthMiddleware.handle, paymentController.appointmentCheckout.bind(paymentController));
router6.post("/subscription/upgrade", hospitalAuthMiddleware.handle, paymentController.upgradeSubscription.bind(paymentController));
router6.post("/subscription/activate-downgrade", hospitalAuthMiddleware.handle, paymentController.activateDowngradeSubscription.bind(paymentController));
router6.post("/webhook", paymentController.handleWebhook.bind(paymentController));
var payment_routes_default = router6;

// src/config/google.strategy.ts
import passport2 from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import bcrypt11 from "bcryptjs";
var callbackURL = `${process.env.BACKEND_URL || "http://localhost:5000"}/api/auth/google/callback`;
console.log("Google Auth Callback URL:", callbackURL);
passport2.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL,
    passReqToCallback: true
  },
  async (req, _accessToken, _refreshToken, profile, done) => {
    try {
      const role = req.query.state || "patient" /* PATIENT */;
      const email = profile.emails?.[0].value;
      if (!email) {
        return done(new Error("No email found in Google profile"), void 0);
      }
      let user = null;
      if (role === "hospital" /* HOSPITAL */) {
        user = await HospitalModel.findOne({ email });
      } else if (role === "doctor" /* DOCTOR */) {
        user = await DoctorModel.findOne({ email });
      } else {
        user = await Patient.findOne({ email });
      }
      if (!user) {
        if (role === "patient" /* PATIENT */) {
          const hashedPlaceholder = await bcrypt11.hash("google-auth-placeholder", 10);
          user = await Patient.create({
            email,
            name: profile.displayName,
            isGoogleAuth: true,
            role: "patient" /* PATIENT */,
            password: hashedPlaceholder,
            phone: 0,
            isActive: true
          });
        } else if (role === "hospital" /* HOSPITAL */) {
          const hashedPlaceholder = await bcrypt11.hash("google-auth-placeholder", 10);
          user = await HospitalModel.create({
            hospitalName: profile.displayName,
            email,
            address: "Pending Google Auth",
            phone: "0000000000",
            since: (/* @__PURE__ */ new Date()).getFullYear(),
            pincode: "000000",
            password: hashedPlaceholder,
            reviewStatus: "pending"
          });
        } else if (role === "doctor" /* DOCTOR */) {
          const hashedPlaceholder = await bcrypt11.hash("google-auth-placeholder", 10);
          user = await DoctorModel.create({
            name: profile.displayName,
            email,
            password: hashedPlaceholder,
            phone: "0000000000",
            address: "Pending Google Auth",
            specialization: "Pending",
            qualification: "Pending",
            experience: "0",
            department: "Pending",
            licence: "Pending",
            profileImage: profile.photos?.[0].value || "",
            about: "Bio pending Google Auth",
            reviewStatus: "pending"
          });
        }
      }
      if (!user) {
        return done(new Error("User creation failed"), void 0);
      }
      return done(null, user);
    } catch (error) {
      return done(error, void 0);
    }
  }
));

// src/app.ts
var { patientAuthMiddleware: patientAuthMiddleware2 } = patientContainer();
var { hospitalAuthMiddleware: hospitalAuthMiddleware2 } = hospitalContainer();
var { doctorAuthMiddleware } = doctorContainer();
var app = express4();
app.set("trust proxy", 1);
app.use((req, _res, next) => {
  console.log(`${(/* @__PURE__ */ new Date()).toISOString()} - ${req.method} ${req.url} - Origin: ${req.headers.origin}`);
  next();
});
var allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "https://med-sync-org-72v5.vercel.app",
  "https://med-sync-org.vercel.app"
].filter(Boolean);
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const isAllowed = allowedOrigins.some(
      (allowed) => origin === allowed || allowed && origin.startsWith(allowed)
    ) || origin.endsWith(".vercel.app");
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`Origin ${origin} not allowed by CORS`);
      callback(null, true);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie", "X-Requested-With", "Accept"]
}));
app.use("/api/payment/webhook", express4.raw({ type: "*/*" }));
app.use((req, res, next) => {
  if (req.originalUrl.startsWith("/socket.io")) {
    return next();
  }
  express4.json({ limit: "10mb" })(req, res, next);
});
app.use((req, res, next) => {
  if (req.originalUrl.startsWith("/socket.io")) {
    return next();
  }
  express4.urlencoded({ limit: "10mb", extended: true })(req, res, next);
});
app.use(passport3.initialize());
app.use(cookieParser());
app.use("/api/auth", auth_routes_default);
app.use("/api/payment", payment_routes_default);
app.use("/api/patient", patientAuthMiddleware2.handle, patient_routes_default);
app.use("/api/doctor", doctorAuthMiddleware.handle, doctor_routes_default);
app.use("/api/hospital", hospitalAuthMiddleware2.handle, hospital_routes_default);
app.use("/api/superadmin", superAdminAuthMiddleware, superAdmin_routes_default);
app.use(error_middleware_default);
var app_default = app;

// src/socket/socket.ts
import { Server } from "socket.io";
var initSocket = (server2) => {
  console.log("Initializing Socket.io...");
  const io = new Server(server2, {
    cors: {
      origin: (origin, callback) => {
        const allowedOrigins2 = [
          process.env.FRONTEND_URL,
          "http://localhost:5173",
          "https://med-sync-org-72v5.vercel.app",
          "https://med-sync-org.vercel.app"
        ].filter(Boolean);
        if (!origin) return callback(null, true);
        const isAllowed = allowedOrigins2.some(
          (allowed) => origin === allowed || allowed && origin.startsWith(allowed)
        ) || origin.endsWith(".vercel.app") || origin.includes("localhost");
        if (isAllowed) {
          callback(null, true);
        } else {
          console.warn(`[Socket.io] Origin ${origin} not allowed by CORS matching logic`);
          callback(null, true);
        }
      },
      methods: ["GET", "POST"],
      credentials: true,
      allowedHeaders: ["content-type", "authorization", "cookie"]
    },
    transports: ["websocket", "polling"],
    allowEIO3: true,
    pingTimeout: 6e4,
    pingInterval: 25e3,
    connectTimeout: 45e3
  });
  io.engine.on("connection_error", (err) => {
    console.error("[Socket.io] Connection Error:", {
      code: err.code,
      message: err.message,
      context: err.context
    });
  });
  io.on("connection", (socket) => {
    console.log(`[Socket.io] New client connected: ${socket.id} from ${socket.handshake.headers.origin}`);
    socket.on("join-room", (roomId) => {
      console.log(`Socket ${socket.id} joining room: ${roomId}`);
      socket.join(roomId);
      socket.to(roomId).emit("user-joined", socket.id);
    });
    socket.on("offer", ({ roomId, offer }) => {
      console.log(`Relaying offer from ${socket.id} to room: ${roomId}`);
      socket.to(roomId).emit("offer", offer);
    });
    socket.on("answer", ({ roomId, answer }) => {
      console.log(`Relaying answer from ${socket.id} to room: ${roomId}`);
      socket.to(roomId).emit("answer", answer);
    });
    socket.on("ice-candidate", ({ roomId, candidate }) => {
      console.log(`Relaying ICE candidate from ${socket.id} to room: ${roomId}`);
      socket.to(roomId).emit("ice-candidate", candidate);
    });
    socket.on("disconnect", (reason) => {
      console.log(`Client disconnected (${socket.id}):`, reason);
    });
  });
};

// src/server.ts
import http from "http";
process.on("unhandledRejection", (reason, promise) => {
  logger_default.error("Unhandled Rejection at:", promise, "reason:", reason);
});
process.on("uncaughtException", (error) => {
  logger_default.error("Uncaught Exception:", error);
  process.exit(1);
});
connectDB();
var PORT = process.env.PORT || 5e3;
var server = http.createServer(app_default);
try {
  initSocket(server);
} catch (error) {
  logger_default.error("Failed to initialize Socket.io:", error);
}
server.listen(PORT, () => {
  logger_default.info(`Server running on http://localhost:${PORT}`);
});
