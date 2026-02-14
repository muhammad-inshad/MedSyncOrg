"use client"
import axios from "axios"
import type React from "react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import api from "../../../lib/api"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { Upload, AlertCircle } from "lucide-react"
import SuperAdminSidebar from "../components/SuperAdminsidebar"
import { SUPERADMIN_ROUTES } from "@/constants/frontend/superAdmin/superAdmin.routes"

const SuperAdminAddHospitalSchema = z
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

type SuperAdminAddHospitalFormData = z.infer<typeof SuperAdminAddHospitalSchema>

const SuperAdminAddHospital: React.FC = () => {
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
  } = useForm<SuperAdminAddHospitalFormData>({
    resolver: zodResolver(SuperAdminAddHospitalSchema),
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

  const onSubmit = async (data: SuperAdminAddHospitalFormData) => {
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
        toast.success("Hospital successfully created")
        navigate(SUPERADMIN_ROUTES.HOSPITALS)
        reset()
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
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SuperAdminSidebar />

      <div className="flex-1">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Add New Hospital</h1>
              <p className="text-gray-600 mt-1">Register a new hospital to the MedSync network.</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl px-8 py-10 mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 sm:p-10">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
              {/* Hospital Info Section */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold">1</div>
                  <h2 className="text-xl font-bold text-gray-900">Hospital Details</h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Hospital Name</label>
                    <input
                      {...register("hospitalName")}
                      type="text"
                      placeholder="Enter hospital name"
                      className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${errors.hospitalName ? "border-red-500 ring-2 ring-red-500/10" : "border-gray-200"
                        }`}
                    />
                    {errors.hospitalName && (
                      <p className="mt-1.5 text-xs font-medium text-red-500 flex items-center gap-1">
                        <AlertCircle size={14} /> {errors.hospitalName.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                      <input
                        {...register("email")}
                        type="email"
                        placeholder="hospital@example.com"
                        className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${errors.email ? "border-red-500 ring-2 ring-red-500/10" : "border-gray-200"
                          }`}
                      />
                      {errors.email && (
                        <p className="mt-1.5 text-xs font-medium text-red-500 flex items-center gap-1">
                          <AlertCircle size={14} /> {errors.email.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                      <input
                        {...register("phone")}
                        type="tel"
                        placeholder="10-digit mobile number"
                        className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${errors.phone ? "border-red-500 ring-2 ring-red-500/10" : "border-gray-200"
                          }`}
                      />
                      {errors.phone && (
                        <p className="mt-1.5 text-xs font-medium text-red-500 flex items-center gap-1">
                          <AlertCircle size={14} /> {errors.phone.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Address</label>
                    <textarea
                      {...register("address")}
                      placeholder="Street, City, State..."
                      rows={3}
                      className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none ${errors.address ? "border-red-500 ring-2 ring-red-500/10" : "border-gray-200"
                        }`}
                    />
                    {errors.address && (
                      <p className="mt-1.5 text-xs font-medium text-red-500 flex items-center gap-1">
                        <AlertCircle size={14} /> {errors.address.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Pincode</label>
                      <input
                        {...register("pincode")}
                        type="text"
                        placeholder="6-digit pincode"
                        className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${errors.pincode ? "border-red-500 ring-2 ring-red-500/10" : "border-gray-200"
                          }`}
                      />
                      {errors.pincode && (
                        <p className="mt-1.5 text-xs font-medium text-red-500 flex items-center gap-1">
                          <AlertCircle size={14} /> {errors.pincode.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Established Year</label>
                      <input
                        {...register("since")}
                        type="text"
                        placeholder="YYYY"
                        className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${errors.since ? "border-red-500 ring-2 ring-red-500/10" : "border-gray-200"
                          }`}
                      />
                      {errors.since && (
                        <p className="mt-1.5 text-xs font-medium text-red-500 flex items-center gap-1">
                          <AlertCircle size={14} /> {errors.since.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Hospital Bio / About</label>
                    <textarea
                      {...register("about")}
                      placeholder="Brief description of the hospital..."
                      rows={4}
                      className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none ${errors.about ? "border-red-500 ring-2 ring-red-500/10" : "border-gray-200"
                        }`}
                    />
                    {errors.about && (
                      <p className="mt-1.5 text-xs font-medium text-red-500 flex items-center gap-1">
                        <AlertCircle size={14} /> {errors.about.message}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* Documents Section */}
              <section className="pt-10 border-t border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold">2</div>
                  <h2 className="text-xl font-bold text-gray-900">Verification Documents</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Logo Upload */}
                  <div className="space-y-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Hospital Logo</label>
                    <label className="relative block group cursor-pointer">
                      <div className={`aspect-square border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 transition-all ${logoPreview ? "border-blue-500 bg-blue-50/30" : "border-gray-200 bg-gray-50 hover:border-blue-400"
                        }`}>
                        {logoPreview ? (
                          <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain" />
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-gray-400 mb-2 group-hover:text-blue-500 transition-colors" />
                            <span className="text-sm font-medium text-gray-600">Select Logo</span>
                            <span className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">JPG, PNG (Max 5MB)</span>
                          </>
                        )}
                        <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                      </div>
                    </label>
                  </div>

                  {/* Licence Upload */}
                  <div className="space-y-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Medical Licence</label>
                    <label className="relative block group cursor-pointer">
                      <div className={`aspect-square border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 transition-all ${licencePreview ? "border-blue-500 bg-blue-50/30" : "border-gray-200 bg-gray-50 hover:border-blue-400"
                        }`}>
                        {licencePreview ? (
                          <img src={licencePreview} alt="Licence preview" className="w-full h-full object-contain" />
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-gray-400 mb-2 group-hover:text-blue-500 transition-colors" />
                            <span className="text-sm font-medium text-gray-600">Upload Licence</span>
                            <span className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">PDF, JPG (Max 5MB)</span>
                          </>
                        )}
                        <input type="file" accept="image/*" onChange={handleLicenceChange} className="hidden" />
                      </div>
                    </label>
                  </div>
                </div>
              </section>

              {/* Security Section */}
              <section className="pt-10 border-t border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold">3</div>
                  <h2 className="text-xl font-bold text-gray-900">Account Access</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Initial Password</label>
                    <input
                      {...register("password")}
                      type="password"
                      placeholder="••••••••"
                      className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${errors.password ? "border-red-500 ring-2 ring-red-500/10" : "border-gray-200"
                        }`}
                    />
                    {errors.password && (
                      <p className="mt-1.5 text-xs font-medium text-red-500 flex items-center gap-1">
                        <AlertCircle size={14} /> {errors.password.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                    <input
                      {...register("confirmPassword")}
                      type="password"
                      placeholder="••••••••"
                      className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${errors.confirmPassword ? "border-red-500 ring-2 ring-red-500/10" : "border-gray-200"
                        }`}
                    />
                    {errors.confirmPassword && (
                      <p className="mt-1.5 text-xs font-medium text-red-500 flex items-center gap-1">
                        <AlertCircle size={14} /> {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* Submit Button */}
              <div className="pt-8">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 bg-gray-900 hover:bg-black disabled:bg-gray-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-gray-200 active:scale-[0.98] flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Creating Hospital...</span>
                    </>
                  ) : (
                    "Register Hospital"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SuperAdminAddHospital
