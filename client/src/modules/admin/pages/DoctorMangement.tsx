import  { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Ban, ChevronLeft, ChevronRight, User } from 'lucide-react';
import AdminSidbar from '../components/AdminSidbar';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { ADMINROUTES } from '@/constants/routes/routes';
import { useNavigate } from 'react-router-dom';
import type{ IDoctor } from '@/interfaces/IDoctor';


const ITEMS_PER_PAGE = 10;

const DoctorManagement = () => {
  const [doctors, setDoctors] = useState<IDoctor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
useEffect(() => {
  const fetchDoctors = async () => {
    try {
      const response = await api.get("/api/admin/getalldoctors");
      setDoctors(response.data.data); 
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  fetchDoctors();
}, []); 

  const filteredDoctors = doctors.filter((doctor) =>
    doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.qualification.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const totalItems = filteredDoctors.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedDoctors = filteredDoctors.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleEdit = (doctor: IDoctor) => {
  navigate(ADMINROUTES.ADMINDOCTOREDIT, { state: { doctor } });
};

const handleToggleStatus = async (doctorId: string) => {
  try {
    const response = await api.patch(`/api/admin/doctorsToggle/${doctorId}`);

    if (response.status === 200) {
      setDoctors((prev) =>
        prev.map((doc) =>
          doc._id === doctorId ? { ...doc, isActive: !doc.isActive } : doc
        )
      );
      toast.success('Doctor status updated');
    }
  } catch (error) {
    console.error('Failed to toggle status:', error);
    toast.error('Failed to update status');
  }
};
  

  const handleAddDoctor = () => {
    navigate(ADMINROUTES.ADMINDOCTORADD)
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Fixed sidebar */}
      <AdminSidbar />

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">Doctor Management</h1>

            <div className="flex items-center gap-4">
              <div className="relative min-w-[260px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search doctors..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1); // Reset to page 1 on new search
                  }}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={handleAddDoctor}
                className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition shadow-sm whitespace-nowrap"
              >
                <Plus className="w-5 h-5" />
                Add Doctor
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                      Doctor
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                      Qualification
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedDoctors.length > 0 ? (
                    paginatedDoctors.map((doctor) => (
                      <tr key={doctor._id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {doctor.profileImage ? (
                              <img
                                src={doctor.profileImage}
                                alt={doctor.name}
                                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center border-2 border-gray-200">
                                <User className="w-5 h-5 text-white" />
                              </div>
                            )}
                            <span className="font-medium text-gray-900">{doctor.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{doctor.qualification}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{doctor.email}</td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-4">
                            <button
                              onClick={() => handleEdit(doctor)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Edit"
                            >
                              <Edit2 size={20} />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(doctor._id)}
                              className={doctor.isActive ? 'text-amber-600 hover:text-amber-800' : 'text-emerald-600 hover:text-emerald-800'}
                              title={doctor.isActive ? 'Deactivate' : 'Activate'}
                            >
                              <Ban size={20} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-16 text-center text-gray-500">
                        No doctors found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalItems > 0 && (
            <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-gray-600">
              <div>
                Showing {startIndex + 1}–{Math.min(startIndex + ITEMS_PER_PAGE, totalItems)} of {totalItems}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded border disabled:opacity-40"
                >
                  <ChevronLeft size={20} />
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded border ${
                        currentPage === page ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded border disabled:opacity-40"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorManagement;