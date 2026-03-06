import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Search, Plus, Edit2, Ban, FileText, CheckCircle2, XCircle,
  ShieldCheck, ShieldAlert, X, Stethoscope, Building2, Layers, ImagePlus, Trash2
} from 'lucide-react';
import type { ISpecialization } from '@/interfaces/ISpecialization';
import { hospitalApi } from '@/constants/backend/hospital/hospital.api';
import Pagination from '@/components/Pagination';

interface SpecializationForm {
  name: string;
  department_id: string;
  description: string;
  image?: string;
  file?: File | null;
}

interface IDepartment {
  _id: string;
  departmentName: string;
}

const EMPTY_FORM: SpecializationForm = { name: '', department_id: '', description: '', image: '', file: null };

const ImageUploadField = ({
  preview,
  onChange,
  label = 'Specialization Image',
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

const ModalForm = ({
  isOpen,
  onClose,
  title,
  subtitle,
  form,
  errors,
  isSubmitting,
  departments,
  onTextChange,
  onImageChange,
  onSubmit,
  submitLabel,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  form: SpecializationForm;
  errors: Partial<SpecializationForm>;
  isSubmitting: boolean;
  departments: IDepartment[];
  onTextChange: (field: keyof SpecializationForm, value: string) => void;
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
      <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-50">
            <Stethoscope className="w-5 h-5 text-blue-500" />
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

      <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
        <ImageUploadField preview={form.image || ''} onChange={onImageChange} />

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5" />
            Department <span className="text-rose-500">*</span>
          </label>
          <select
            value={form.department_id}
            onChange={(e) => onTextChange('department_id', e.target.value)}
            className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:bg-white transition-all appearance-none ${errors.department_id
              ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500 text-rose-500'
              : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900'
              }`}
          >
            <option value="">Select a department</option>
            {departments.map((dept) => (
              <option key={dept._id} value={dept._id}>
                {dept.departmentName}
              </option>
            ))}
          </select>
          {errors.department_id && (
            <p className="text-xs font-bold text-rose-500">{errors.department_id}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Stethoscope className="w-3.5 h-3.5" />
            Specialization Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Interventional Cardiology"
            value={form.name}
            onChange={(e) => onTextChange('name', e.target.value)}
            className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm font-medium placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:bg-white transition-all ${errors.name
              ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500'
              : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'
              }`}
          />
          {errors.name && (
            <p className="text-xs font-bold text-rose-500">{errors.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            Description <span className="text-slate-300 ml-1">(optional)</span>
          </label>
          <textarea
            rows={3}
            placeholder="Brief description of this specialization..."
            value={form.description}
            onChange={(e) => onTextChange('description', e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all resize-none"
          />
        </div>
      </div>

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
              <Plus className="w-4 h-4" />
              {submitLabel}
            </>
          )}
        </button>
      </div>
    </div>
  </div>
);

const SpecializationManagement = () => {
  const [specializations, setSpecializations] = useState<ISpecialization[]>([]);
  const [departments, setDepartments] = useState<IDepartment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limit] = useState(5);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addForm, setAddForm] = useState<SpecializationForm>(EMPTY_FORM);
  const [addErrors, setAddErrors] = useState<Partial<SpecializationForm>>({});
  const [isAddSubmitting, setIsAddSubmitting] = useState(false);

  const [editTarget, setEditTarget] = useState<ISpecialization | null>(null);
  const [editForm, setEditForm] = useState<SpecializationForm>(EMPTY_FORM);
  const [editErrors, setEditErrors] = useState<Partial<SpecializationForm>>({});
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchSpecializations = useCallback(async () => {
    try {
      const res = await hospitalApi.getSpecializations({
        page: currentPage,
        limit,
        search: debouncedSearch
      });
      const { data, total, limit: resLimit } = res.data.data;
      setSpecializations(data || []);
      setTotalItems(total || 0);
      setTotalPages(Math.ceil((total || 0) / (resLimit || limit)) || 1);
    } catch (error) {
      console.error('Failed to fetch specializations:', error);
    }
  }, [currentPage, limit, debouncedSearch]);

  const fetchDepartments = useCallback(async () => {
    try {
      const res = await hospitalApi.getDeparment({ page: 1, limit: 100 });
      setDepartments(res.data.data.data || []);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }
  }, []);

  useEffect(() => {
    fetchSpecializations();
  }, [fetchSpecializations]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const handleToggleStatus = async (id: string) => {
    try {
      await hospitalApi.toggleSpecializationStatus(id);
      setSpecializations((prev) =>
        prev.map((s) => (s._id === id ? { ...s, isActive: !s.isActive } : s))
      );
    } catch (error) {
      console.error('Failed to toggle status:', error);
    }
  };

  const openAdd = () => { setAddForm(EMPTY_FORM); setAddErrors({}); setIsAddOpen(true); };

  const handleAddChange = (field: keyof SpecializationForm, value: string) => {
    setAddForm((prev) => ({ ...prev, [field]: value }));
    if (addErrors[field]) setAddErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleAddImageChange = (file: File | null, base64: string) => {
    setAddForm((prev) => ({ ...prev, file, image: base64 }));
  };

  const handleAddSubmit = async () => {
    const errors: Partial<SpecializationForm> = {};
    if (!addForm.department_id) errors.department_id = 'Department is required.';
    if (!addForm.name.trim()) errors.name = 'Specialization name is required.';
    if (Object.keys(errors).length > 0) { setAddErrors(errors); return; }

    try {
      setIsAddSubmitting(true);
      const formData = new FormData();
      formData.append('department_id', addForm.department_id);
      formData.append('name', addForm.name);
      formData.append('description', addForm.description || '');

      if (addForm.file) {
        formData.append('image', addForm.file);
      } else if (addForm.image && !addForm.image.startsWith('data:')) {
        formData.append('image', addForm.image);
      }

      await hospitalApi.createSpecialization(formData);
      fetchSpecializations();
      setIsAddOpen(false);
      setAddForm(EMPTY_FORM);
    } catch (error) {
      console.error('Failed to create specialization:', error);
    } finally {
      setIsAddSubmitting(false);
    }
  };

  const openEdit = (spec: ISpecialization) => {
    setEditTarget(spec);
    setEditForm({
      name: spec.name,
      department_id: spec.department_id,
      description: spec.description || '',
      image: spec.image || '',
      file: null
    });
    setEditErrors({});
  };

  const handleEditChange = (field: keyof SpecializationForm, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
    if (editErrors[field]) setEditErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleEditImageChange = (file: File | null, base64: string) => {
    setEditForm((prev) => ({ ...prev, file, image: base64 }));
  };

  const handleEditSubmit = async () => {
    if (!editTarget) return;
    const errors: Partial<SpecializationForm> = {};
    if (!editForm.department_id) errors.department_id = 'Department is required.';
    if (!editForm.name.trim()) errors.name = 'Specialization name is required.';
    if (Object.keys(errors).length > 0) { setEditErrors(errors); return; }

    setIsEditSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('department_id', editForm.department_id);
      formData.append('name', editForm.name);
      formData.append('description', editForm.description || '');

      if (editForm.file) {
        formData.append('image', editForm.file);
      } else if (editForm.image === '') {
        formData.append('image', '');
      } else if (editForm.image && !editForm.image.startsWith('data:')) {
        formData.append('image', editForm.image);
      }

      await hospitalApi.updateSpecialization(editTarget._id, formData);
      fetchSpecializations();
      setEditTarget(null);
    } catch (err) {
      console.error('Failed to update:', err);
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const getDepartmentName = (id: string) => {
    return departments.find(d => d._id === id)?.departmentName || 'Unknown Department';
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
    <div className="min-h-screen bg-slate-50/50 p-6 lg:p-10 font-inter">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Specialization Directory</h1>
            <p className="text-slate-500 mt-1">Manage hospital specializations, link them to departments, and track status.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full md:w-80 shadow-sm transition-all text-sm font-medium"
              />
            </div>
            <button
              onClick={openAdd}
              className="flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-black transition-all shadow-lg active:scale-95 whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              Add Specialization
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Total Specializations', value: totalItems, icon: Layers, color: 'text-slate-600', bg: 'bg-slate-100' },
            { label: 'Active', value: specializations.filter(q => q.isActive).length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100/50' },
            { label: 'Inactive', value: specializations.filter(q => !q.isActive).length, icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-100/50' },
            { label: 'Departments', value: Array.from(new Set(specializations.map(s => s.department_id))).length, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-100/50' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 transition-all hover:shadow-md">
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

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {specializations.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <Search className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No specializations found</h3>
              <p className="text-slate-500">Try adjusting your search criteria or add a new one.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50/50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Specialization</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Department</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {specializations.map((spec) => (
                      <tr key={spec._id} className="hover:bg-slate-50/50 transition-all group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl overflow-hidden ring-2 ring-slate-100 group-hover:ring-blue-100 transition-all flex-shrink-0">
                              {spec.image ? (
                                <img src={spec.image} alt={spec.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-blue-50 flex items-center justify-center">
                                  <Stethoscope className="w-6 h-6 text-blue-400" />
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase">
                                {spec.name}
                              </div>
                              <div className="text-[10px] font-bold text-slate-400 mt-0.5 tracking-tight uppercase">
                                Specialization
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                            <Building2 className="w-3 h-3" />
                            {getDepartmentName(spec.department_id)}
                          </span>
                        </td>
                        <td className="px-6 py-4 max-w-xs">
                          <div className="flex items-start gap-2 text-xs font-medium text-slate-600">
                            <FileText className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                            <span className="line-clamp-2">
                              {spec.description || <span className="text-slate-300 italic">No description</span>}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(spec.isActive)}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEdit(spec)}
                              className="p-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                              title="Edit Specialization"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(spec._id)}
                              className={`p-2 rounded-lg shadow-sm transition-all ${spec.isActive
                                ? 'bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white'
                                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'
                                }`}
                              title={spec.isActive ? 'Deactivate' : 'Activate'}
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
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </div>
      </div>

      <ModalForm
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Specialization"
        subtitle="Fill in the information below"
        form={addForm}
        errors={addErrors}
        isSubmitting={isAddSubmitting}
        departments={departments}
        onTextChange={handleAddChange}
        onImageChange={handleAddImageChange}
        onSubmit={handleAddSubmit}
        submitLabel="Add Specialization"
      />

      <ModalForm
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="Edit Specialization"
        subtitle={editTarget ? `Editing: ${editTarget.name.toUpperCase()}` : ''}
        form={editForm}
        errors={editErrors}
        isSubmitting={isEditSubmitting}
        departments={departments}
        onTextChange={handleEditChange}
        onImageChange={handleEditImageChange}
        onSubmit={handleEditSubmit}
        submitLabel="Save Changes"
      />
    </div>
  );
};

export default SpecializationManagement;