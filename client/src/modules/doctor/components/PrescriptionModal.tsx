import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import logo from '@/assets/images/logo.png';
import type { IPrescriptionData } from '@/interfaces/IAppointment';

interface PrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  onSave: (prescription: IPrescriptionData) => void;
}

const PrescriptionModal = ({ isOpen, onClose, patientName, onSave }: PrescriptionModalProps) => {
  const [medicines, setMedicines] = useState([{ name: '', dosage: '', duration: '' }]);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const addMedicine = () => setMedicines([...medicines, { name: '', dosage: '', duration: '' }]);
  const removeMedicine = (index: number) => setMedicines(medicines.filter((_, i) => i !== index));

  const handleInputChange = (index: number, field: string, value: string) => {
    const updated = [...medicines];
    (updated[index] as any)[field] = value;
    setMedicines(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b flex justify-between items-center bg-slate-50 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="w-8 h-8 object-contain" />
            <div>
              <h2 className="text-xl font-bold text-slate-800">New Prescription</h2>
              <p className="text-sm text-slate-500">Patient: {patientName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition"><X size={24} /></button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-700">Medicines</h3>
              <button onClick={addMedicine} className="text-sm font-bold text-indigo-600 flex items-center gap-1 hover:underline"><Plus size={16} /> Add More</button>
            </div>
            {medicines.map((med, index) => (
              <div key={index} className="grid grid-cols-12 gap-3 items-end bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="col-span-5 space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Medicine Name</label>
                  <input type="text" className="w-full p-2 border rounded-lg text-sm outline-none focus:ring-2 ring-indigo-500" value={med.name} onChange={(e) => handleInputChange(index, 'name', e.target.value)} />
                </div>
                <div className="col-span-3 space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Dosage</label>
                  <input type="text" className="w-full p-2 border rounded-lg text-sm outline-none focus:ring-2 ring-indigo-500" value={med.dosage} onChange={(e) => handleInputChange(index, 'dosage', e.target.value)} />
                </div>
                <div className="col-span-3 space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Duration</label>
                  <input type="text" className="w-full p-2 border rounded-lg text-sm outline-none focus:ring-2 ring-indigo-500" value={med.duration} onChange={(e) => handleInputChange(index, 'duration', e.target.value)} />
                </div>
                <div className="col-span-1"><button onClick={() => removeMedicine(index)} className="p-2 text-rose-500"><Trash2 size={18} /></button></div>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <h3 className="font-bold text-slate-700">Additional Advice</h3>
            <textarea rows={3} className="w-full p-4 border rounded-2xl outline-none focus:ring-2 ring-indigo-500" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>

        <div className="p-6 border-t flex gap-4 bg-slate-50 rounded-b-3xl">
          <button onClick={onClose} className="flex-1 py-3 border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-white transition">Discard</button>
          <button onClick={() => onSave({ medicines, notes })} className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg hover:bg-indigo-700 transition">Save & Send</button>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionModal;