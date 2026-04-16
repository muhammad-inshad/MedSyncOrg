import { useState, useEffect, useCallback } from "react";
import { Search, Plus, Edit2, Ban, User, Mail, ShieldCheck, ShieldAlert, Stethoscope, GraduationCap, Users, UserCheck, UserX, Clock } from "lucide-react";
import { hospitalApi } from "@/constants/backend/hospital/hospital.api";
import { HOSPITAL_ROUTES } from "@/constants/frontend/hospital/hospital.routes";
import { useNavigate } from "react-router-dom";
import type { IDoctor } from "@/interfaces/IDoctor";
import { showToast } from "@/utils/toastUtils";
import ConfirmationModal from "@/components/ConfirmationModal";
import Pagination from "@/components/Pagination";
import { StatsCards } from "../tables/StatsCards";
import { FilterTabs } from "../tables/FilterTabs";
import { DataTable, type TableColumn } from "../tables/DataTable";



const ITEMS_PER_PAGE = 5;

type FilterType = "all" | "active" | "blocked";

const HospitalDoctorManagement = () => {
  const [doctors, setDoctors] = useState<IDoctor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<{ id: string; name: string; isActive: boolean } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [totaldoctors, setTotalDoctors] = useState(0);
  const [activeDoctors, setActiveDoctors] = useState(0);
  const [blockedDoctors, setBlockedDoctors] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const navigate = useNavigate();

  const fetchDoctors = useCallback(async (page: number) => {
    try {
      setIsLoading(true);
      const response = await hospitalApi.getAllDoctors({
        page,
        limit: ITEMS_PER_PAGE,
        search: searchQuery,
        filter: filter === "all" ? undefined : filter, // 'active' or 'blocked'
        isKyc: false,
      });

      const { data, pagination } = response.data;
      setDoctors(Array.isArray(data) ? data : []);
      setTotalPages(pagination?.totalPages || 0);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      showToast.error("Failed to fetch doctors");
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, filter]);

  const fetchStaus = useCallback(async () => {
    try {
      const res = await hospitalApi.getDoctorStatus();
      console.log(res.data)
      setTotalDoctors(res.data.data.total);
      setActiveDoctors(res.data.data.active);
      setBlockedDoctors(res.data.data.blocked);
    } catch (error) {
      console.error("Failed to fetch doctor status:", error);
    }
  }, []);

  // Fetch doctors when page or filter changes
  useEffect(() => {
    fetchDoctors(currentPage);
  }, [currentPage, fetchDoctors]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchDoctors(currentPage);
    fetchStaus()
  }, [currentPage, fetchDoctors, fetchStaus]);

  const handleEdit = (doctor: IDoctor) => {
    navigate(HOSPITAL_ROUTES.HOSPITALDOCTOREDIT, { state: doctor.id });
  };

  const handleToggleStatusClick = (id: string, name: string, isActive: boolean) => {
    setModalConfig({ id, name, isActive });
    setIsModalOpen(true);
  };

  const handleConfirmToggle = async () => {
    if (!modalConfig) return;
    const { id, isActive } = modalConfig;
    const newStatus = !isActive;

    try {
      const response = await hospitalApi.toggleDoctor(id, { status: newStatus.toString() });

      if (response.status === 200) {
        setDoctors((prev) =>
          prev.map((d) => (d.id === id ? { ...d, isActive: newStatus } : d))
        );

        showToast.success(`Doctor ${newStatus ? "activated" : "blocked"} successfully`);

        if (filter !== "all") {
          fetchDoctors(currentPage);
        }
      }

    } catch (error) {
      console.error("Failed to toggle status:", error);
      showToast.error("Operation failed");
    } finally {
      setIsModalOpen(false);
      setModalConfig(null);
    }
  };

  const getStatusBadge = (reviewStatus?: string, isActive?: boolean) => {
    if (!isActive) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border bg-rose-50 text-rose-700 border-rose-100">
          <ShieldAlert className="w-3 h-3" /> Blocked
        </span>
      );
    }

    const colors: Record<string, string> = {
      approved: "bg-emerald-50 text-emerald-700 border-emerald-100",
      pending: "bg-blue-50 text-blue-700 border-blue-100",
      rejected: "bg-slate-50 text-slate-700 border-slate-100",
      revision: "bg-amber-50 text-amber-700 border-amber-100",
    };

    const labels: Record<string, string> = {
      approved: "Verified",
      pending: "Pending",
      rejected: "Rejected",
      revision: "Needs Revision",
    };

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
          colors[reviewStatus || "pending"] || ""
        }`}
      >
        {reviewStatus === "approved" ? <ShieldCheck className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
        {labels[reviewStatus || "pending"] || reviewStatus}
      </span>
    );
  };

  // Stats data
  const stats = [
    {
      label: "Total Doctors",
      value: totaldoctors,
      icon: Users,
      color: "text-slate-600",
      bg: "bg-slate-100",
    },
    {
      label: "Active Doctors",
      value: activeDoctors,
      icon: UserCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-100/50",
    },
    {
      label: "Blocked Doctors",
      value: blockedDoctors,
      icon: UserX,
      color: "text-rose-600",
      bg: "bg-rose-100/50",
    },
  ];

  // Filter tabs
  const filterTabs = [
    { key: "all", label: "All Doctors" },
    { key: "active", label: "Active" },
    { key: "blocked", label: "Blocked" },
  ];

  const handleFilterChange = (filterKey: string) => {
    setFilter(filterKey as FilterType);
    setCurrentPage(1);
  };

  const getFilterCount = (key: string) => {
    switch (key) {
      case "active":
        return activeDoctors;
      case "blocked":
        return blockedDoctors;
      default:
        return 0;
    }
  };

  const tableColumns: TableColumn[] = [
    { key: "details", label: "Doctor Details" },
    { key: "department", label: "Department & Exp" },
    { key: "status", label: "Status" },
    { key: "qualification", label: "Qualification" },
    { key: "actions", label: "Actions", className: "text-right" },
  ];

  const renderDoctorRow = (doctor: IDoctor) => (
    <>
      <td className="px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl overflow-hidden ring-2 ring-slate-100 group-hover:ring-blue-100 transition-all">
            {doctor.profileImage ? (
              <img src={doctor.profileImage} alt={doctor.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-slate-50 flex items-center justify-center">
                <User className="w-6 h-6 text-slate-300" />
              </div>
            )}
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600">
              Dr. {doctor.name}
            </div>
            <div className="text-xs font-medium text-slate-400 mt-0.5 flex items-center gap-1">
              <Mail className="w-3 h-3" /> {doctor.email}
            </div>
          </div>
        </div>
      </td>

      <td className="px-6 py-4">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <Stethoscope className="w-3.5 h-3.5 text-blue-500" />
            {doctor.department}
          </div>
          <div className="text-[10px] font-medium text-slate-400 pl-5">
            {doctor.experience} Years Experience
          </div>
        </div>
      </td>

      <td className="px-6 py-4">{getStatusBadge(doctor.reviewStatus, doctor.isActive)}</td>

      <td className="px-6 py-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
          <GraduationCap className="w-4 h-4 text-slate-400" />
          {doctor.qualification}
        </div>
      </td>

      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => handleEdit(doctor)}
            className="p-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
            title="Edit Profile"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleToggleStatusClick(doctor.id, doctor.name, doctor.isActive)}
            className={`p-2 rounded-lg shadow-sm transition-all ${
              doctor.isActive
                ? "bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white"
                : "bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white"
            }`}
            title={doctor.isActive ? "Block Doctor" : "Unblock Doctor"}
          >
            <Ban className="w-4 h-4" />
          </button>
        </div>
      </td>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 lg:p-10 font-inter">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Doctor Directory</h1>
            <p className="text-slate-500 mt-1">Manage hospital medical staff and their access status.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, dept, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full md:w-80 shadow-sm transition-all text-sm font-medium"
              />
            </div>

            <button
              onClick={() => navigate(HOSPITAL_ROUTES.HOSPITALDOCTORADD)}
              className="flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-black transition-all shadow-lg active:scale-95 whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              Add New Doctor
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <StatsCards stats={stats} />

        {/* Filter Tabs */}
        <FilterTabs
          tabs={filterTabs}
          activeFilter={filter}
          onFilterChange={handleFilterChange}
          getCount={getFilterCount}
        />

        {/* Table Section */}
        <div className="mb-8">
          <DataTable
            data={doctors}
            columns={tableColumns}
            renderRow={renderDoctorRow}
            isLoading={isLoading}
            emptyState={{
              title: "No doctors found",
              message: "Try adjusting your search or filter.",
              icon: <Search className="w-8 h-8 text-slate-300" />,
            }}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setModalConfig(null);
          }}
          onConfirm={handleConfirmToggle}
          title={modalConfig?.isActive ? "Block Doctor" : "Unblock Doctor"}
          message={
            <div className="space-y-4">
              <p className="text-slate-600">
                Are you sure you want to {modalConfig?.isActive ? "block" : "unblock"}{" "}
                <span className="font-bold text-slate-900">Dr. {modalConfig?.name}</span>?
              </p>
              <div
                className={`p-4 rounded-2xl border ${
                  modalConfig?.isActive ? "bg-rose-50 border-rose-100" : "bg-emerald-50 border-emerald-100"
                }`}
              >
                <p
                  className={`text-xs font-medium leading-relaxed ${
                    modalConfig?.isActive ? "text-rose-700" : "text-emerald-700"
                  }`}
                >
                  {modalConfig?.isActive
                    ? "Blocking this doctor will instantly revoke their access. They won't be able to manage appointments or consult patients."
                    : "All platform features will be instantly restored for this doctor."}
                </p>
              </div>
            </div>
          }
          confirmText={modalConfig?.isActive ? "Yes, Block Doctor" : "Yes, Unblock Doctor"}
          type={modalConfig?.isActive ? "warning" : "info"}
        />
      </div>
    </div>
  );
};

export default HospitalDoctorManagement;