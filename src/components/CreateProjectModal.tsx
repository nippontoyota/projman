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
        'Project Track Initialized',
        `${brandName} - ${locationName.trim()} (${facilityType}) created with 21 lifecycle milestones.`
      );
      onProjectCreated();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred';
      setError(msg);
      toast.error('Project Creation Failed', msg);
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
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs"
          />

          {/* Modal Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative z-10 bg-white border border-slate-200 rounded-xl w-full max-w-lg p-6 shadow-xl overflow-hidden text-slate-900"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <IconClose className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center space-x-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold shadow-xs">
                <IconPlus className="w-4 h-4 stroke-[2]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Initialize Dealership Track
                </h2>
                <p className="text-xs text-slate-500">
                  Admin setup: Create showroom schedule & auto-generate 21 milestones
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Brand Custom Select */}
              <div>
                <CustomSelect
                  label="Brand Allocation"
                  value={brandName}
                  onChange={setBrandName}
                  options={BRAND_OPTIONS}
                  size="md"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center space-x-1.5">
                  <IconLocation className="w-3.5 h-3.5 text-slate-500" />
                  <span>Location (City / Town)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kottayam, Thrissur, Kollam, Calicut"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  required
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
                />
              </div>

              {/* Facility Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center space-x-1.5">
                  <IconFacility className="w-3.5 h-3.5 text-slate-500" />
                  <span>Facility Type</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Sales', 'Service', 'Stock Yard', 'Sales & Service'] as FacilityType[]).map(
                    (type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFacilityType(type)}
                        className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all text-left cursor-pointer ${
                          facilityType === type
                            ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-2xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
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
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                  <span>Fixed Target Completion Date</span>
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono focus:outline-none focus:border-blue-500 shadow-2xs"
                />
              </div>

              {/* Initial Remarks */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Initial Notes / Commercial Terms
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Under discussion with landlord for commercial terms"
                  value={initialRemarks}
                  onChange={(e) => setInitialRemarks(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Creating Project...' : 'Initialize Project'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
