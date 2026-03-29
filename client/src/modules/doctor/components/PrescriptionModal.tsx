import React, { useState } from 'react';
import { X, Plus, Trash2, Loader2 } from 'lucide-react';
import { doctorApi } from '@/constants/backend/doctor/doctor.api';
import toast from 'react-hot-toast';
import { z } from 'zod';
import type { IMedicine, PrescriptionModalProps, SavePrescriptionPayload } from '@/interfaces/priscription';



const PrescriptionModal = ({ 
  isOpen, 
  onClose, 
  patientName, 
  appointmentId,
  onSuccess 
}: PrescriptionModalProps) => {
  
  const [medicines, setMedicines] = useState<IMedicine[]>([
    { name: '', dosage: '', duration: '' }
  ]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const addMedicine = () => {
    setMedicines([...medicines, { name: '', dosage: '', duration: '' }]);
  };

  const removeMedicine = (index: number) => {
    if (medicines.length === 1) return;
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (index: number, field: keyof IMedicine, value: string) => {
    const updated = [...medicines];
    updated[index] = { ...updated[index], [field]: value };
    setMedicines(updated);
  };

  const prescriptionSchema = z.object({
    medicines: z.array(
      z.object({
        name: z.string().min(2, "Medicine name must be at least 2 characters"),
        dosage: z.string().min(1, "Dosage is required"),
        duration: z.string().min(1, "Duration is required"),
      })
    ).min(1, "At least one medicine is required"),
    notes: z.string().optional(),
  });

  const handleSave = async () => {
    if (!appointmentId) {
      toast.error("Appointment ID is missing");
      return;
    }

    const prescriptionData: SavePrescriptionPayload = {
      medicines,
      notes: notes.trim(),        
    };

    const validation = prescriptionSchema.safeParse(prescriptionData);
    if (!validation.success) {
      toast.error(validation.error.issues[0]?.message || "Please fill all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await doctorApi.savePrescription(appointmentId, prescriptionData);
      
      toast.success("Prescription saved successfully!");
      onSuccess?.();
      onClose();
      
    } catch (error: any) {
      console.error("Prescription save error:", error);
      toast.error(error?.response?.data?.message || "Failed to save prescription. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-slate-50 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-100 rounded-2xl flex items-center justify-center">
              <span className="text-indigo-600 text-xl">💊</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Write Prescription</h2>
              <p className="text-slate-500">For: {patientName}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            disabled={isSubmitting}
            className="p-2 hover:bg-slate-200 rounded-full transition disabled:opacity-50"
          >
            <X size={26} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-8 flex-1">
          <div className="space-y-5">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg text-slate-700">Medicines</h3>
              <button 
                onClick={addMedicine}
                className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 font-medium text-sm"
              >
                <Plus size={18} /> Add Medicine
              </button>
            </div>

            {medicines.map((medicine, index) => (
              <div key={index} className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-5">
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">MEDICINE NAME</label>
                    <input
                      type="text"
                      placeholder="e.g. Paracetamol"
                      value={medicine.name}
                      onChange={(e) => handleMedicineChange(index, 'name', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="col-span-3">
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">DOSAGE</label>
                    <input
                      type="text"
                      placeholder="e.g. 500mg"
                      value={medicine.dosage}
                      onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="col-span-3">
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">DURATION</label>
                    <input
                      type="text"
                      placeholder="e.g. 5 days"
                      value={medicine.duration}
                      onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="col-span-1 flex items-end pb-1">
                    {medicines.length > 1 && (
                      <button
                        onClick={() => removeMedicine(index)}
                        className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Additional Advice / Instructions
            </label>
            <textarea
              rows={5}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special instructions, diet advice, precautions..."
              className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y min-h-[120px]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-slate-50 rounded-b-3xl flex gap-4">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-4 border-2 border-slate-300 text-slate-700 font-semibold rounded-2xl hover:bg-slate-100 transition disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={22} className="animate-spin" />
                Saving Prescription...
              </>
            ) : (
              'Save & Send Prescription'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionModal;