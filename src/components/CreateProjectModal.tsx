'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FacilityType } from '@/types';
import { IconClose, IconPlus, IconFacility, IconLocation } from '@/components/ui/Icons';
import { CustomSelect, SelectOption } from '@/components/ui/CustomSelect';
import { useToast } from '@/context/ToastContext';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: () => void;
}

const BRAND_OPTIONS: SelectOption[] = [
  { value: 'River EV', label: 'River EV (Indie Electric Showroom)' },
  { value: 'Nippon Toyota', label: 'Nippon Toyota (Dealership Track)' },
];

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onProjectCreated,
}) => {
  const [brandName, setBrandName] = useState('River EV');
  const [locationName, setLocationName] = useState('');
  const [facilityType, setFacilityType] = useState<FacilityType>('Sales');
  const [targetDate, setTargetDate] = useState('2027-03-31');
  const [initialRemarks, setInitialRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationName.trim()) {
      setError('Please enter a location name');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName,
          locationName: locationName.trim(),
          facilityType,
          targetDate,
          initialRemarks,
          userRole: 'Admin',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create project');
      }

      toast.success(
        'Project Created',
        `${brandName} - ${locationName.trim()} (${facilityType}) created.`
      );
      onProjectCreated();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred';
      setError(msg);
      toast.error('Failed to Create Project', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-2xs"
          />

          {/* Modal Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative z-10 bg-white border border-black rounded-xs w-full max-w-lg p-5 shadow-xl overflow-hidden text-slate-900"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 text-slate-400 hover:text-black p-1 rounded-xs hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <IconClose className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="mb-4">
              <h2 className="text-sm font-bold text-black tracking-tight">
                New Project
              </h2>
            </div>

            {error && (
              <div className="mb-4 p-2.5 rounded-xs bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Brand Custom Select */}
              <div>
                <CustomSelect
                  label="Brand"
                  value={brandName}
                  onChange={setBrandName}
                  options={BRAND_OPTIONS}
                  size="md"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1 flex items-center space-x-1.5">
                  <IconLocation className="w-3.5 h-3.5 text-slate-400" />
                  <span>Location</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kottayam, Thrissur, Calicut"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  required
                  className="w-full bg-white border border-slate-200 rounded-xs px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-black shadow-2xs"
                />
              </div>

              {/* Facility Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1 flex items-center space-x-1.5">
                  <IconFacility className="w-3.5 h-3.5 text-slate-400" />
                  <span>Facility Type</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Sales', 'Service', 'Stock Yard', 'Sales & Service'] as FacilityType[]).map(
                    (type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFacilityType(type)}
                        className={`py-1.5 px-3 rounded-xs text-xs font-semibold border transition-colors text-left cursor-pointer ${
                          facilityType === type
                            ? 'bg-black text-white border-black'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        {type}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Target Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Target Completion Date
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xs px-3 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-black shadow-2xs"
                />
              </div>

              {/* Initial Remarks */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Commercial negotiations in progress"
                  value={initialRemarks}
                  onChange={(e) => setInitialRemarks(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xs px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-black shadow-2xs"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 rounded-xs text-xs font-semibold text-slate-600 hover:text-black bg-white border border-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-3.5 py-1.5 rounded-xs text-xs font-bold bg-black hover:bg-neutral-800 text-white transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {isSubmitting ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
