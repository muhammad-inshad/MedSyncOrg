import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Search, Plus, Edit2, Ban, Building2, FileText, Users, CheckCircle2,
  XCircle, LayoutGrid, ShieldCheck, ShieldAlert, X, ImagePlus, Trash2
} from 'lucide-react';
import type { IDepartment } from '@/interfaces/IDepartment';
import { hospitalApi } from '@/constants/backend/hospital/hospital.api';

interface DepartmentForm {
  departmentName: string;
  description: string;
  image?: string;
  file?: File | null;
}

const EMPTY_FORM: DepartmentForm = { departmentName: '', description: '', image: '', file: null };

// ─────────────────────────────────────────────────────────────────────────────
// Defined OUTSIDE the parent component so React never remounts them on re-render
// ─────────────────────────────────────────────────────────────────────────────

const ImageUploadField = ({
  preview,
  onChange,
  label = 'Department Image',
}: {
  preview: string;
  onChange: (file: File | null, base64: string) => void;
  label?: string;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        onChange(file, reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
        <ImagePlus className="w-3.5 h-3.5" />
        {label}
        <span className="text-slate-300 font-medium normal-case tracking-normal ml-1">(optional)</span>
      </label>

      {preview ? (
        <div className="relative group w-full h-36 rounded-xl overflow-hidden border border-slate-200">
          <img src={preview} alt="preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="px-3 py-1.5 bg-white text-slate-800 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-slate-100"
            >
              <ImagePlus className="w-3.5 h-3.5" /> Change
            </button>
            <button
              type="button"
              onClick={() => onChange(null, '')}
              className="px-3 py-1.5 bg-rose-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-rose-600"
            >
              <Trash2 className="w-3.5 h-3.5" /> Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full h-36 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-blue-400 hover:bg-blue-50/30 transition-all group"
        >
          <div className="p-3 rounded-xl bg-slate-100 group-hover:bg-blue-100 transition-all">
            <ImagePlus className="w-6 h-6 text-slate-400 group-hover:text-blue-500 transition-all" />
          </div>
          <p className="text-xs font-bold text-slate-400 group-hover:text-blue-500 transition-all">Click to upload image</p>
          <p className="text-[10px] text-slate-300">PNG, JPG, WEBP up to 5MB</p>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────

const ModalForm = ({
  isOpen,
  onClose,
  title,
  subtitle,
  form,
  errors,
  isSubmitting,
  onTextChange,
  onImageChange,
  onSubmit,
  submitLabel,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  form: DepartmentForm;
  errors: Partial<DepartmentForm>;
  isSubmitting: boolean;
  onTextChange: (field: keyof DepartmentForm, value: string) => void;
  onImageChange: (file: File | null, base64: string) => void;
  onSubmit: () => void;
  submitLabel: string;
}) => (
  <div
    className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
  >
    <div
      className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      onClick={isOpen ? onClose : undefined}
    />

    <div
      className={`relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden transition-all duration-200 ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-50">
            <Building2 className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">{title}</p>
            <p className="text-xs text-slate-400">{subtitle}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body */}
      <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
        <ImageUploadField preview={form.image || ''} onChange={onImageChange} />

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5" />
            Department Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Cardiology"
            value={form.departmentName}
            onChange={(e) => onTextChange('departmentName', e.target.value)}
            className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm font-medium placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:bg-white transition-all ${errors.departmentName
              ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500'
              : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'
              }`}
          />
          {errors.departmentName && (
            <p className="text-xs font-bold text-rose-500">{errors.departmentName}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            Description <span className="text-slate-300 ml-1">(optional)</span>
          </label>
          <textarea
            rows={3}
            placeholder="Brief description of this department..."
            value={form.description}
            onChange={(e) => onTextChange('description', e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all resize-none"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-8 py-5 border-t border-slate-100 bg-slate-50/50">
        <button
          onClick={onClose}
          className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all"
        >
          Cancel
        </button>
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex items-center gap-2 bg-slate-900 text-white px-8 py-2.5 rounded-xl font-bold text-sm hover:bg-black transition-all shadow-lg active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Building2 className="w-4 h-4" />
              {submitLabel}
            </>
          )}
        </button>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState<IDepartment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addForm, setAddForm] = useState<DepartmentForm>(EMPTY_FORM);
  const [addErrors, setAddErrors] = useState<Partial<DepartmentForm>>({});
  const [isAddSubmitting, setIsAddSubmitting] = useState(false);

  const [editTarget, setEditTarget] = useState<IDepartment | null>(null);
  const [editForm, setEditForm] = useState<DepartmentForm>(EMPTY_FORM);
  const [editErrors, setEditErrors] = useState<Partial<DepartmentForm>>({});
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);

  const fetchDepartments = useCallback(async () => {
    try {
      const res = await hospitalApi.getDeparment();
      // res.data is the Axios body, res.data.data is the actual department array
      setDepartments(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const filtered = departments.filter((d) =>
    d.departmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleStatus = async (id: string) => {
    try {
      await hospitalApi.toggleDepartmentStatus(id);
      setDepartments((prev) =>
        prev.map((d) => (d._id === id ? { ...d, isActive: !d.isActive } : d))
      );
    } catch (error) {
      console.error('Failed to toggle status:', error);
    }
  };

  const openAdd = () => { setAddForm(EMPTY_FORM); setAddErrors({}); setIsAddOpen(true); };

  const handleAddChange = (field: keyof DepartmentForm, value: string) => {
    setAddForm((prev) => ({ ...prev, [field]: value }));
    if (addErrors[field]) setAddErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleAddImageChange = (file: File | null, base64: string) => {
    setAddForm((prev) => ({ ...prev, file, image: base64 }));
  };

  const handleAddSubmit = async () => {
    const errors: Partial<DepartmentForm> = {};
    if (!addForm.departmentName.trim()) errors.departmentName = 'Department name is required.';
    if (Object.keys(errors).length > 0) { setAddErrors(errors); return; }

    try {
      setIsAddSubmitting(true);
      const formData = new FormData();
      formData.append('departmentName', addForm.departmentName);
      formData.append('description', addForm.description || '');

      if (addForm.file) {
        formData.append('image', addForm.file);
      } else if (addForm.image && !addForm.image.startsWith('data:')) {
        // This case shouldn't happen for Add, but good for completeness
        formData.append('image', addForm.image);
      }

      const res = await hospitalApi.createDepartment(formData);
      // res.data.data is the newly created department object
      setDepartments((prev) => [res.data.data, ...prev]);
      setIsAddOpen(false);
      setAddForm(EMPTY_FORM);
    } catch (error) {
      console.error('Failed to create department:', error);
    } finally {
      setIsAddSubmitting(false);
    }
  };

  // ── Edit ──────────────────────────────────────────────────────────────────
  const openEdit = (dept: IDepartment) => {
    setEditTarget(dept);
    setEditForm({
      departmentName: dept.departmentName,
      description: dept.description || '',
      image: dept.image || '',
      file: null
    });
    setEditErrors({});
  };

  const handleEditChange = (field: keyof DepartmentForm, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
    if (editErrors[field]) setEditErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleEditImageChange = (file: File | null, base64: string) => {
    setEditForm((prev) => ({ ...prev, file, image: base64 }));
  };

  const handleEditSubmit = async () => {
    if (!editTarget) return;
    const errors: Partial<DepartmentForm> = {};
    if (!editForm.departmentName.trim()) errors.departmentName = 'Department name is required.';
    if (Object.keys(errors).length > 0) { setEditErrors(errors); return; }

    setIsEditSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('departmentName', editForm.departmentName);
      formData.append('description', editForm.description || '');

      if (editForm.file) {
        formData.append('image', editForm.file);
      } else if (editForm.image === '') {
        formData.append('image', ''); // Signal removal
      } else if (editForm.image && !editForm.image.startsWith('data:')) {
        formData.append('image', editForm.image);
      }

      // TODO: Real API call for edit
      // const res = await hospitalApi.updateDepartment(editTarget._id, formData);

      setDepartments((prev) =>
        prev.map((d) => d._id === editTarget._id ? { ...d, ...editForm } : d)
      );
      setEditTarget(null);
    } catch (err) {
      console.error('Failed to update:', err);
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const getStatusBadge = (isActive: boolean) =>
    isActive ? (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border bg-emerald-50 text-emerald-700 border-emerald-100">
        <ShieldCheck className="w-3 h-3" /> Active
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border bg-rose-50 text-rose-700 border-rose-100">
        <ShieldAlert className="w-3 h-3" /> Inactive
      </span>
    );

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 lg:p-10">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Department Directory</h1>
            <p className="text-slate-500 mt-1">Manage hospital departments, descriptions, and active status.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full md:w-80 shadow-sm text-sm font-medium"
              />
            </div>
            <button
              onClick={openAdd}
              className="flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-black transition-all shadow-lg whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              Add Department
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Total Departments', value: departments.length, icon: LayoutGrid, color: 'text-slate-600', bg: 'bg-slate-100' },
            { label: 'Active', value: departments.filter(d => d.isActive).length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100/50' },
            { label: 'Inactive', value: departments.filter(d => !d.isActive).length, icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-100/50' },
            { label: 'Total Doctors', value: departments.reduce((acc, d) => acc + (d.doctors?.length || 0), 0), icon: Users, color: 'text-blue-600', bg: 'bg-blue-100/50' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 hover:shadow-md transition-all">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <Search className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No departments found</h3>
              <p className="text-slate-500">Try adjusting your search criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Doctors</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((dept) => (
                    <tr key={dept._id} className="hover:bg-slate-50/50 transition-all group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl overflow-hidden ring-2 ring-slate-100 group-hover:ring-blue-100 flex-shrink-0">
                            {dept.image ? (
                              <img src={dept.image} alt={dept.departmentName} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-blue-50 flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-blue-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 uppercase">
                              {dept.departmentName}
                            </div>
                            <div className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-tight">
                              Department
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <div className="flex items-start gap-2 text-xs font-medium text-slate-600">
                          <FileText className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                          <span className="line-clamp-2">
                            {dept.description || <span className="text-slate-300 italic">No description</span>}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                          <Users className="w-3.5 h-3.5 text-blue-500" />
                          {dept.doctors?.length || 0} Doctors
                        </div>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(dept.isActive)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(dept)}
                            className="p-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(dept._id)}
                            className={`p-2 rounded-lg shadow-sm transition-all ${dept.isActive
                              ? 'bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white'
                              : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'
                              }`}
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ModalForm
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Department"
        subtitle="Fill in the information below"
        form={addForm}
        errors={addErrors}
        isSubmitting={isAddSubmitting}
        onTextChange={handleAddChange}
        onImageChange={handleAddImageChange}
        onSubmit={handleAddSubmit}
        submitLabel="Add Department"
      />

      <ModalForm
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="Edit Department"
        subtitle={editTarget ? `Editing: ${editTarget.departmentName.toUpperCase()}` : ''}
        form={editForm}
        errors={editErrors}
        isSubmitting={isEditSubmitting}
        onTextChange={handleEditChange}
        onImageChange={handleEditImageChange}
        onSubmit={handleEditSubmit}
        submitLabel="Save Changes"
      />
    </div>
  );
};

export default DepartmentManagement;