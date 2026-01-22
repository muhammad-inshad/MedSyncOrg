import { useEffect, useState } from 'react';
import { Search, Edit2, Circle } from 'lucide-react';
import SuperAdminSidebar from '@/modules/superAdmin/components/SuperAdminsidebar';
import api from '../../../lib/api';
import { useNavigate } from "react-router-dom";
import type { IAdmin } from '@/interfaces/IAdmin';

const HospitalManagement = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [hospitals, setHospitals] = useState<IAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const response = await api.get('/api/superadmin/hospitalManagement');
        setHospitals(response.data.hospitals || []);
      } catch (error) {
        console.error('Failed to fetch hospitals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHospitals();
  }, []);
  const getDisplayStatus = (hospital: IAdmin): string => {
    if (!hospital.isActive) return 'Inactive';
    if (hospital.subscription?.status === 'expired') return 'Inactive';
    if (hospital.subscription?.status === 'cancelled') return 'Inactive';
    if (hospital.subscription?.status === 'active') return 'Active';
    return 'Pending';
  };

  const toggleToActive = async (id: string, currentStatus: boolean) => {
    try {
      console.log(id,!currentStatus)
      const response = await api.patch('/api/superadmin/setActive', {
        id,
        isActive: !currentStatus
      });

      if (response.status === 200) {
        setHospitals((prevHospitals) =>
          prevHospitals.map((hospital) =>
            hospital._id === id ? { ...hospital, isActive: !currentStatus } : hospital
          )
        );
      }
    } catch (error) {
      console.error('Failed to toggle status:', error);
      alert('Failed to update hospital status');
    }
  };

  const handleEdit = (hospital:unknown) => {
  navigate("/admin/edit-hospital", {
    state: { hospital }
  });
};



  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-500';
      case 'Inactive':
        return 'bg-gray-400';
      case 'Pending':
        return 'bg-amber-600';
      default:
        return 'bg-gray-500';
    }
  };

  const filteredHospitals = hospitals.filter((hospital) => {
    const status = getDisplayStatus(hospital);
    const matchesTab = activeTab === 'All' || status === activeTab;

    const searchLower = searchQuery.toLowerCase();
    const nameMatch = hospital.hospitalName?.toLowerCase().includes(searchLower);
    const idMatch = hospital._id?.toString().toLowerCase().includes(searchLower);

    return matchesTab && (nameMatch || idMatch);
  });

  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return '—';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SuperAdminSidebar />

      <div className="flex-1">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Hospital Management</h1>
              <p className="text-gray-600 mt-1">
                Manage registered hospitals, monitor status, and track subscriptions.
              </p>
            </div>

            <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors">
              <Circle className="w-4 h-4 fill-current" />
              Add New Hospital
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-8 py-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Tabs + Search */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex gap-2">
                  {['All', 'Active', 'Inactive'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-5 py-2 rounded-md font-medium transition-colors ${activeTab === tab
                          ? 'bg-slate-700 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by hospital name or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-12 text-center text-gray-500">Loading hospitals...</div>
              ) : filteredHospitals.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  No hospitals found matching your criteria
                </div>
              ) : (
                <table className="w-full min-w-max">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Hospital
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Registered
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Sub. Start
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Sub. End
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200">
                    {filteredHospitals.map((hospital) => {
                      const status = getDisplayStatus(hospital);

                      return (
                        <tr key={hospital._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {/* Hospital Logo from Cloudinary */}
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                                {hospital.logo ? (
                                  <img
                                    src={hospital.logo}
                                    alt={`${hospital.hospitalName || 'Hospital'} logo`}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src =
                                        'https://via.placeholder.com/48/cccccc/666666?text=🏥';
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-3xl bg-linear-to-br from-blue-50 to-blue-100">
                                    🏥
                                  </div>
                                )}
                              </div>

                              <div className="min-w-0">
                                <div className="font-medium text-gray-900 truncate max-w-55">
                                  {hospital.hospitalName || 'Unnamed Hospital'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  ID: {hospital._id?.toString().slice(-8) || '—'}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(
                                status
                              )}`}
                            >
                              <Circle className="w-2.5 h-2.5 fill-current" />
                              {status}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-gray-700 text-sm">
                            {formatDate(hospital.createdAt)}
                          </td>

                          <td className="px-6 py-4 text-gray-700 text-sm">
                            {formatDate(hospital.subscription?.startDate)}
                          </td>

                          <td className="px-6 py-4 text-gray-700 text-sm">
                            {formatDate(hospital.subscription?.endDate)}
                          </td>

                          <td className="px-6 py-4 font-medium text-gray-900">
                            {hospital.subscription?.amount
                              ? `₹${hospital.subscription.amount}`
                              : '—'}
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => toggleToActive(hospital._id, !!hospital.isActive)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${hospital.isActive
                                    ? "bg-red-100 hover:bg-red-200 text-red-700"
                                    : "bg-green-100 hover:bg-green-200 text-green-700"
                                  }`}
                                title={hospital.isActive ? "Block Hospital" : "Activate Hospital"}
                              >
                                <Circle className={`w-4 h-4 ${hospital.isActive ? "fill-red-600" : "fill-green-600"}`} />
                              </button>

                              <button onClick={()=>handleEdit(hospital)}
                                className="text-blue-600 hover:text-blue-800 transition-colors"
                                title="Edit Hospital"
                              >
                                <Edit2 className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Simple static pagination placeholder */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between text-sm">
              <div className="text-gray-600">
                Showing <span className="font-medium">1</span>–<span className="font-medium">10</span> of{' '}
                <span className="font-medium">{hospitals.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50" disabled>
                  Previous
                </button>
                <button className="px-3 py-1.5 bg-gray-800 text-white rounded">1</button>
                <button className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded">2</button>
                <button className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50" disabled>
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalManagement;