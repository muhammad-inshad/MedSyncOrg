"use client"
import axios from "axios"
import type React from "react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import api from "../../../lib/api"
import logo from "../../../assets/images/logo.png"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { Upload, AlertCircle } from "lucide-react"

const adminSignupSchema = z
  .object({
    hospitalName: z.string().min(1, "Hospital name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    address: z.string().min(1, "Address is required"),
    about: z.string().min(1, "About is required"),
    pincode: z.string().min(6, "Pincode must be at least 6 digits"),
    since: z.string().min(4, "Year is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

type AdminSignupFormData = z.infer<typeof adminSignupSchema>

const AdminSignup: React.FC = () => {
  const [logoPreview, setLogoPreview] = useState<string>("")
  const [licencePreview, setLicencePreview] = useState<string>("")
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [licenceFile, setLicenceFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AdminSignupFormData>({
    resolver: zodResolver(adminSignupSchema),
  })

  const navigate = useNavigate()

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleLicenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLicenceFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLicencePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (data: AdminSignupFormData) => {
    setLoading(true)

    const formData = new FormData()

    formData.append("hospitalName", data.hospitalName)
    formData.append("email", data.email)
    formData.append("phone", data.phone)
    formData.append("address", data.address)
    formData.append("about", data.about)
    formData.append("pincode", data.pincode)
    formData.append("since", data.since)
    formData.append("password", data.password)
if (logoFile) {
  formData.append("logo", logoFile)
}

if (licenceFile) {
  formData.append("licence", licenceFile)
}

    try {
      const response = await api.post("/api/auth/admin/signup", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      if (response.status === 200 || response.status === 201) {
        toast.success("Admin signup successful")
        navigate("/login/admin")
        reset()
        setLogoPreview("")
        setLicencePreview("")
        setLogoFile(null)
        setLicenceFile(null)
      }
    } catch (error: unknown) {
      console.error('ERROR:', error);
      let errorMessage = 'An unexpected error occurred';
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(`Registration failed: ${errorMessage}`);
    }finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-200/20 rounded-full blur-3xl"></div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-2xl">
          {/* Header Section */}
          <div className="mb-10 text-center">
            <div className="mb-6 flex justify-center">
              <img src={logo || "/placeholder.svg"} alt="MedSync" className="h-16 w-auto" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Hospital Registration</h1>
            <p className="text-slate-600">Join MedSync and streamline your healthcare operations</p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Hospital Info Section */}
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                  <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full mr-3 text-sm font-bold">
                    1
                  </span>
                  Hospital Details
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Hospital Name</label>
                    <input
                      {...register("hospitalName")}
                      type="text"
                      placeholder="Enter hospital name"
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                        errors.hospitalName
                          ? "border-red-300 bg-red-50"
                          : "border-slate-200 bg-slate-50 hover:border-slate-300"
                      }`}
                    />
                    {errors.hospitalName && (
                      <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                        <AlertCircle size={16} />
                        {errors.hospitalName.message}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                      <input
                        {...register("email")}
                        type="email"
                        placeholder="hospital@example.com"
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                          errors.email
                            ? "border-red-300 bg-red-50"
                            : "border-slate-200 bg-slate-50 hover:border-slate-300"
                        }`}
                      />
                      {errors.email && (
                        <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                          <AlertCircle size={16} />
                          {errors.email.message}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                      <input
                        {...register("phone")}
                        type="tel"
                        placeholder="+91 XXXXX XXXXX"
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                          errors.phone
                            ? "border-red-300 bg-red-50"
                            : "border-slate-200 bg-slate-50 hover:border-slate-300"
                        }`}
                      />
                      {errors.phone && (
                        <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                          <AlertCircle size={16} />
                          {errors.phone.message}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
                    <textarea
                      {...register("address")}
                      placeholder="Enter hospital address"
                      rows={2}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none ${
                        errors.address
                          ? "border-red-300 bg-red-50"
                          : "border-slate-200 bg-slate-50 hover:border-slate-300"
                      }`}
                    />
                    {errors.address && (
                      <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                        <AlertCircle size={16} />
                        {errors.address.message}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Pincode</label>
                      <input
                        {...register("pincode")}
                        type="text"
                        placeholder="123456"
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                          errors.pincode
                            ? "border-red-300 bg-red-50"
                            : "border-slate-200 bg-slate-50 hover:border-slate-300"
                        }`}
                      />
                      {errors.pincode && (
                        <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                          <AlertCircle size={16} />
                          {errors.pincode.message}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Established Year</label>
                      <input
                        {...register("since")}
                        type="text"
                        placeholder="1990"
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                          errors.since
                            ? "border-red-300 bg-red-50"
                            : "border-slate-200 bg-slate-50 hover:border-slate-300"
                        }`}
                      />
                      {errors.since && (
                        <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                          <AlertCircle size={16} />
                          {errors.since.message}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">About Hospital</label>
                    <textarea
                      {...register("about")}
                      placeholder="Tell us about your hospital..."
                      rows={2}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none ${
                        errors.about
                          ? "border-red-300 bg-red-50"
                          : "border-slate-200 bg-slate-50 hover:border-slate-300"
                      }`}
                    />
                    {errors.about && (
                      <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                        <AlertCircle size={16} />
                        {errors.about.message}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Documents Section */}
              <div className="pt-6 border-t border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                  <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full mr-3 text-sm font-bold">
                    2
                  </span>
                  Documents
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Logo Upload */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">Hospital Logo</label>
                    <label className="block">
                      <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all text-center group">
                        <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                        <Upload
                          size={24}
                          className="mx-auto mb-2 text-slate-400 group-hover:text-blue-500 transition"
                        />
                        <p className="text-sm font-medium text-slate-600">
                          {logoPreview ? "Change logo" : "Upload logo"}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">PNG, JPG or GIF (max 5MB)</p>
                      </div>
                    </label>
                    {logoPreview && (
                      <div className="mt-4">
                        <img
                          src={logoPreview || "/placeholder.svg"}
                          alt="Logo Preview"
                          className="w-full h-24 object-contain rounded-lg border-2 border-slate-200 bg-slate-50"
                        />
                      </div>
                    )}
                  </div>

                  {/* Licence Upload */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">Hospital Licence</label>
                    <label className="block">
                      <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all text-center group">
                        <input type="file" accept="image/*" onChange={handleLicenceChange} className="hidden" />
                        <Upload
                          size={24}
                          className="mx-auto mb-2 text-slate-400 group-hover:text-blue-500 transition"
                        />
                        <p className="text-sm font-medium text-slate-600">
                          {licencePreview ? "Change licence" : "Upload licence"}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">PNG, JPG or GIF (max 5MB)</p>
                      </div>
                    </label>
                    {licencePreview && (
                      <div className="mt-4">
                        <img
                          src={licencePreview || "/placeholder.svg"}
                          alt="Licence Preview"
                          className="w-full h-24 object-contain rounded-lg border-2 border-slate-200 bg-slate-50"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Security Section */}
              <div className="pt-6 border-t border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                  <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full mr-3 text-sm font-bold">
                    3
                  </span>
                  Password
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                    <input
                      {...register("password")}
                      type="password"
                      placeholder="••••••••"
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                        errors.password
                          ? "border-red-300 bg-red-50"
                          : "border-slate-200 bg-slate-50 hover:border-slate-300"
                      }`}
                    />
                    {errors.password && (
                      <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                        <AlertCircle size={16} />
                        {errors.password.message}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Confirm Password</label>
                    <input
                      {...register("confirmPassword")}
                      type="password"
                      placeholder="••••••••"
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                        errors.confirmPassword
                          ? "border-red-300 bg-red-50"
                          : "border-slate-200 bg-slate-50 hover:border-slate-300"
                      }`}
                    />
                    {errors.confirmPassword && (
                      <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                        <AlertCircle size={16} />
                        {errors.confirmPassword.message}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Creating account...
                    </span>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </div>

              {/* Login Link */}
              <div className="text-center pt-4">
                <p className="text-slate-600">
                  Already have an account?{" "}
                  <a href="/admin/login" className="font-semibold text-blue-600 hover:text-blue-700 transition">
                    Sign in
                  </a>
                </p>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-slate-500">
            <p>By signing up, you agree to our Terms of Service and Privacy Policy</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminSignup
