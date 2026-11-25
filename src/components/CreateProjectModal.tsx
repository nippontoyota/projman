'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FacilityType } from '@/types';
import { IconClose, IconCheck, IconChevronRight, IconChevronLeft, IconPlus } from '@/components/ui/Icons';
import { useToast } from '@/context/ToastContext';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { getUserAvatarInfo } from '@/lib/userAvatar';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: () => void;
}

function parseYMD(str: string): { year: number; month: number; day: number } {
  const [y, m, d] = str.split('-').map(Number);
  return { year: y, month: m - 1, day: d };
}

function formatYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addDaysToYMD(str: string, days: number): string {
  if (!str) return '';
  const { year, month, day } = parseYMD(str);
  const d = new Date(year, month, day + days);
  return formatYMD(d);
}

function getTodayYMD(): string {
  return formatYMD(new Date());
}

interface TaskRow {
  orderIndex: number;
  title: string;
  phaseName: string;
  benchmarkDays: number;
  plannedDate: string;
  assignedTo: string;
}

const DEFAULT_TASKS_TEMPLATE = [
  // Phase 1
  { orderIndex: 1, phaseNumber: 1, phaseName: 'Property & Agreement', title: 'Property Identified', benchmarkDays: 7, defaultAssignee: 'user1' },
  { orderIndex: 2, phaseNumber: 1, phaseName: 'Property & Agreement', title: 'Property Details Shared with River', benchmarkDays: 3, defaultAssignee: 'user1' },
  { orderIndex: 3, phaseNumber: 1, phaseName: 'Property & Agreement', title: 'Property Viewed by River', benchmarkDays: 5, defaultAssignee: 'user1' },
  { orderIndex: 4, phaseNumber: 1, phaseName: 'Property & Agreement', title: 'Property Approved by River', benchmarkDays: 3, defaultAssignee: 'user1' },
  { orderIndex: 5, phaseNumber: 1, phaseName: 'Property & Agreement', title: 'Property Approved by Management', benchmarkDays: 3, defaultAssignee: 'user1' },
  { orderIndex: 6, phaseNumber: 1, phaseName: 'Property & Agreement', title: 'Agreement Signed by Parties', benchmarkDays: 30, defaultAssignee: 'user1' },

  // Phase 2
  { orderIndex: 7, phaseNumber: 2, phaseName: 'Design & GFC Approval', title: 'Drawing Prepared by Project Team', benchmarkDays: 10, defaultAssignee: 'user1' },
  { orderIndex: 8, phaseNumber: 2, phaseName: 'Design & GFC Approval', title: 'Drawing Shared by Project Team to River', benchmarkDays: 2, defaultAssignee: 'user1' },
  { orderIndex: 9, phaseNumber: 2, phaseName: 'Design & GFC Approval', title: 'Base Layout from River', benchmarkDays: 14, defaultAssignee: 'user1' },
  { orderIndex: 10, phaseNumber: 2, phaseName: 'Design & GFC Approval', title: 'Consent given for GFC after discussion as per site conditions and necessary corrections..', benchmarkDays: 5, defaultAssignee: 'user1' },
  { orderIndex: 11, phaseNumber: 2, phaseName: 'Design & GFC Approval', title: 'GFC - Drawing Approved by River', benchmarkDays: 14, defaultAssignee: 'user1' },

  // Phase 3
  { orderIndex: 12, phaseNumber: 3, phaseName: 'BOQ & PO Release', title: 'BOQ Prepared by Project Team', benchmarkDays: 7, defaultAssignee: 'user2' },
  { orderIndex: 13, phaseNumber: 3, phaseName: 'BOQ & PO Release', title: 'BOQ submitted for Approval', benchmarkDays: 3, defaultAssignee: 'user2' },
  { orderIndex: 14, phaseNumber: 3, phaseName: 'BOQ & PO Release', title: 'BOQ Approved by Mgmt', benchmarkDays: 5, defaultAssignee: 'user2' },
  { orderIndex: 15, phaseNumber: 3, phaseName: 'BOQ & PO Release', title: 'PO/WO Released', benchmarkDays: 7, defaultAssignee: 'user2' },
  { orderIndex: 16, phaseNumber: 3, phaseName: 'BOQ & PO Release', title: 'Payment/Advance released on', benchmarkDays: 5, defaultAssignee: 'user2' },

  // Phase 4
  { orderIndex: 17, phaseNumber: 4, phaseName: 'Site Execution & Handover', title: 'Work Started Date', benchmarkDays: 7, defaultAssignee: 'user2' },
  { orderIndex: 18, phaseNumber: 4, phaseName: 'Site Execution & Handover', title: 'Documentation Completion Done', benchmarkDays: 90, defaultAssignee: 'user2' },
  { orderIndex: 19, phaseNumber: 4, phaseName: 'Site Execution & Handover', title: 'TC Received Date', benchmarkDays: 14, defaultAssignee: 'user3' },
  { orderIndex: 20, phaseNumber: 4, phaseName: 'Site Execution & Handover', title: 'Facility Handover Date', benchmarkDays: 7, defaultAssignee: 'user3' },
  { orderIndex: 21, phaseNumber: 4, phaseName: 'Site Execution & Handover', title: 'Operations Commenced', benchmarkDays: 7, defaultAssignee: 'user3' },
];

const getInitialEmptyTasks = (): TaskRow[] => {
  return DEFAULT_TASKS_TEMPLATE.map((t) => ({
    orderIndex: t.orderIndex,
    title: t.title,
    phaseName: t.phaseName,
    benchmarkDays: t.benchmarkDays,
    plannedDate: '',
    assignedTo: '',
  }));
};

const USER_OPTIONS = [
  { value: 'user1', label: 'User 1' },
  { value: 'user2', label: 'User 2' },
  { value: 'user3', label: 'User 3' },
  { value: 'user4', label: 'User 4' },
];

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onProjectCreated,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [brandName, setBrandName] = useState('River EV');
  const [brands, setBrands] = useState<string[]>(['River EV', 'Nippon Toyota']);
  const [isAddingBrand, setIsAddingBrand] = useState(false);
  const [newBrandInput, setNewBrandInput] = useState('');
  const [locationName, setLocationName] = useState('');
  const [facilityType, setFacilityType] = useState<FacilityType>('Sales');
  const [startDate, setStartDate] = useState(getTodayYMD());
  const [targetDate, setTargetDate] = useState('2027-03-31');
  const [availableUsers, setAvailableUsers] = useState<Array<{ value: string; label: string }>>([
    { value: 'user1', label: 'User 1' },
    { value: 'user2', label: 'User 2' },
    { value: 'user3', label: 'User 3' },
    { value: 'user4', label: 'User 4' },
  ]);

  // Task rows state: initially empty for target dates and user assignments
  const [tasks, setTasks] = useState<TaskRow[]>(getInitialEmptyTasks);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toast = useToast();

  // Load existing brands and users from DB
  useEffect(() => {
    if (isOpen) {
      const today = getTodayYMD();
      setStartDate(today);
      setTasks(getInitialEmptyTasks());
      setError(null);

      fetch('/api/brands')
        .then((res) => res.json())
        .then((json) => {
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            const names = json.data.map((b: { name: string }) => b.name);
            setBrands((prev) => Array.from(new Set([...prev, ...names])));
          }
        })
        .catch(() => {});

      fetch('/api/users')
        .then((res) => res.json())
        .then((json) => {
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            const nonAdmins = json.data.filter((u: { role: string }) => u.role !== 'Admin');
            if (nonAdmins.length > 0) {
              setAvailableUsers(
                nonAdmins.map((u: { username: string; name: string }) => ({
                  value: u.username,
                  label: u.name || u.username,
                }))
              );
            }
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  // In-house custom select options for available users
  const selectUserOptions = useMemo(() => {
    return availableUsers.map((u) => {
      const av = getUserAvatarInfo(u.value);
      return {
        value: u.value,
        label: u.label,
        icon: (
          <span
            className={`w-4 h-4 rounded-full inline-flex items-center justify-center text-[10px] font-black shrink-0 ${av.bg}`}
          >
            {av.text}
          </span>
        ),
      };
    });
  }, [availableUsers]);

  const handleAddNewBrand = async () => {
    const trimmed = newBrandInput.trim();
    if (!trimmed) return;

    try {
      const res = await fetch('/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.data?.name) {
        const canonicalName = data.data.name;
        setBrands((prev) => Array.from(new Set([...prev, canonicalName])));
        setBrandName(canonicalName);
      } else {
        setBrands((prev) => Array.from(new Set([...prev, trimmed])));
        setBrandName(trimmed);
      }
    } catch {
      setBrands((prev) => Array.from(new Set([...prev, trimmed])));
      setBrandName(trimmed);
    }

    setNewBrandInput('');
    setIsAddingBrand(false);
    toast.success('Brand Added', `"${trimmed}" selected as brand`);
  };

  const handleStartDateChange = (val: string) => {
    setStartDate(val);
  };

  // Strict sequential date constraint: Next task can only start after current task target date is over
  const getMinDateForTask = (idx: number): string => {
    for (let k = idx - 1; k >= 0; k--) {
      if (tasks[k]?.plannedDate) {
        return addDaysToYMD(tasks[k].plannedDate, 1);
      }
    }
    return startDate || getTodayYMD();
  };

  const handleTaskAssigneeChange = (orderIndex: number, val: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.orderIndex === orderIndex ? { ...t, assignedTo: val } : t))
    );
  };

  const handleTaskDateChange = (idx: number, newDate: string) => {
    setError(null);
    if (!newDate) {
      setTasks((prev) =>
        prev.map((t, i) => (i === idx ? { ...t, plannedDate: '' } : t))
      );
      return;
    }

    // Predecessor constraint: Task N must start strictly after the latest preceding task's target date is over
    let latestPrecedingDate = '';
    let latestPrecedingIdx = -1;
    for (let k = idx - 1; k >= 0; k--) {
      if (tasks[k]?.plannedDate) {
        latestPrecedingDate = tasks[k].plannedDate;
        latestPrecedingIdx = k;
        break;
      }
    }

    if (latestPrecedingDate) {
      if (newDate <= latestPrecedingDate) {
        const minAllowed = addDaysToYMD(latestPrecedingDate, 1);
        toast.error(
          'Sequential Date Error',
          `Milestone #${tasks[idx].orderIndex} must start after Milestone #${tasks[latestPrecedingIdx].orderIndex} target date (${latestPrecedingDate})`
        );
        newDate = minAllowed;
      }
    } else if (startDate && newDate < startDate) {
      newDate = startDate;
    }

    // Only adjust downstream tasks if they already have dates assigned that conflict
    setTasks((prev) => {
      const nextTasks = [...prev];
      nextTasks[idx] = { ...nextTasks[idx], plannedDate: newDate };

      let currentPrevDate = newDate;
      for (let j = idx + 1; j < nextTasks.length; j++) {
        if (nextTasks[j].plannedDate && nextTasks[j].plannedDate <= currentPrevDate) {
          const benchmark = DEFAULT_TASKS_TEMPLATE[j]?.benchmarkDays || 1;
          nextTasks[j] = {
            ...nextTasks[j],
            plannedDate: addDaysToYMD(currentPrevDate, benchmark),
          };
          currentPrevDate = nextTasks[j].plannedDate;
        } else if (nextTasks[j].plannedDate) {
          currentPrevDate = nextTasks[j].plannedDate;
        }
      }
      return nextTasks;
    });
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationName.trim()) {
      setError('Please enter a location name');
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleSubmit = async () => {
    // Sequential validation for any milestones that have dates assigned
    let prevAssignedDate = '';
    let prevIndex = 0;
    for (let i = 0; i < tasks.length; i++) {
      if (tasks[i].plannedDate) {
        if (prevAssignedDate && tasks[i].plannedDate <= prevAssignedDate) {
          setError(
            `Sequential Error: Milestone #${tasks[i].orderIndex} target date (${tasks[i].plannedDate}) must be strictly after Milestone #${prevIndex} (${prevAssignedDate}).`
          );
          toast.error('Sequential Error', `Task #${tasks[i].orderIndex} date must be after Task #${prevIndex}`);
          return;
        }
        prevAssignedDate = tasks[i].plannedDate;
        prevIndex = tasks[i].orderIndex;
      }
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const finalTarget = tasks[tasks.length - 1]?.plannedDate || targetDate;
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName,
          locationName: locationName.trim(),
          facilityType,
          startDate,
          targetDate: finalTarget,
          initialRemarks: `New ${brandName} ${facilityType} track created.`,
          userRole: 'Admin',
          tasks,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create project track');
      }

      toast.success(
        'Project Track Created',
        `${brandName} - ${locationName.trim()} (${facilityType}) with 21 sequential milestone tasks deployed.`
      );
      onProjectCreated();
      onClose();
      // Reset form
      setStep(1);
      setLocationName('');
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs"
          />

          {/* Modal Panel with Fixed Height & Smooth Scroll */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className={`relative z-10 bg-white border border-slate-200 rounded-2xl w-full shadow-2xl overflow-hidden text-slate-900 transition-all flex flex-col ${
              step === 1 ? 'max-w-xl max-h-[90vh]' : 'max-w-4xl h-[86vh] max-h-[720px]'
            }`}
          >
            {/* Unified Fixed Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white shrink-0">
              <div>
                <div className="flex items-center space-x-2.5">
                  <h3 className="font-bold text-base text-slate-900">
                    {step === 1 ? 'New Project Track' : `${brandName} — ${locationName}`}
                  </h3>
                  {step === 2 && (
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      {facilityType}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {step === 1
                    ? 'Step 1 of 2: Set brand, location, and facility type'
                    : 'Step 2 of 2: Assign users & target dates for 21 milestones'}
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-xs font-mono font-bold text-slate-400">
                  Step {step} of 2
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 text-slate-400 hover:text-black rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <IconClose className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-3 bg-rose-50 border-b border-rose-200 text-rose-800 text-xs shrink-0">
                {error}
              </div>
            )}

            {/* Step 1: Basic Details Form */}
            {step === 1 && (
              <form onSubmit={handleNext} className="flex flex-col">
                <div className="p-6 space-y-5 overflow-y-auto">
                  {/* Brand Selection with + button */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Brand
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsAddingBrand(!isAddingBrand)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors cursor-pointer"
                      >
                        <IconPlus className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>{isAddingBrand ? 'Cancel' : 'Add Brand'}</span>
                      </button>
                    </div>

                    {/* Inline Add Brand Input */}
                    {isAddingBrand && (
                      <div className="mb-3 p-3 bg-slate-50 border border-slate-300 rounded-lg flex items-center space-x-2">
                        <input
                          type="text"
                          value={newBrandInput}
                          onChange={(e) => setNewBrandInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddNewBrand();
                            }
                          }}
                          placeholder="Enter brand name (e.g. Ather, Ola Electric, BYD)..."
                          className="flex-1 px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:border-black focus:outline-none"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={handleAddNewBrand}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-md transition-colors cursor-pointer"
                        >
                          Add
                        </button>
                      </div>
                    )}

                    {/* Brand Buttons */}
                    <div className="flex flex-wrap gap-2.5">
                      {brands.map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setBrandName(b)}
                          className={`px-4 py-2.5 rounded-lg border text-sm font-bold text-left transition-all cursor-pointer ${
                            brandName === b
                              ? 'bg-black text-white border-black shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Location Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Location / City (Kerala)
                    </label>
                    <input
                      type="text"
                      value={locationName}
                      onChange={(e) => setLocationName(e.target.value)}
                      placeholder="e.g. Palakkad, Cochin, Kozhikode, Kannur, Kollam, Thrissur..."
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                      required
                    />
                  </div>

                  {/* Facility Type */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Facility Type
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {(['Sales', 'Service', 'Stock Yard', 'Sales & Service'] as FacilityType[]).map((ft) => (
                        <button
                          key={ft}
                          type="button"
                          onClick={() => setFacilityType(ft)}
                          className={`p-2.5 rounded-lg border text-xs font-bold text-center transition-all cursor-pointer ${
                            facilityType === ft
                              ? 'bg-black text-white border-black shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                          }`}
                        >
                          {ft}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Project Start Date */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Project Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => handleStartDateChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:border-black focus:outline-none focus:ring-1 focus:ring-black font-mono"
                    />
                  </div>
                </div>

                {/* Modal Footer Step 1 */}
                <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-200 flex items-center justify-between shrink-0">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-black cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-lg transition-all cursor-pointer shadow-sm hover:shadow"
                  >
                    <span>Assign Tasks</span>
                    <IconChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: Milestone Tasks & User Assignment Grid */}
            {step === 2 && (
              <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
                {/* 100% Fixed Header Row - High-Contrast Dark & Bold */}
                <div className="px-6 py-3 bg-slate-100 border-b border-slate-200 shrink-0">
                  <div className="grid grid-cols-12 gap-3 text-xs font-black text-slate-900 uppercase tracking-wider items-center">
                    <div className="col-span-1 text-center font-black text-slate-900">Sl. No.</div>
                    <div className="col-span-5 font-black text-slate-900">Milestone Task Name</div>
                    <div className="col-span-3 font-black text-slate-900">Target Date</div>
                    <div className="col-span-3 font-black text-slate-900">Assign User</div>
                  </div>
                </div>

                {/* Scrollable Tasks Body */}
                <div className="flex-1 overflow-y-auto px-6 divide-y divide-slate-100 pb-24">
                  {tasks.map((task, idx) => (
                    <div
                      key={task.orderIndex}
                      className="grid grid-cols-12 gap-3 items-center py-2.5 hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Sl. No - Dark and Bold */}
                      <div className="col-span-1 text-center font-mono font-black text-slate-900 text-sm">
                        {task.orderIndex}
                      </div>

                      {/* Task Title & Phase */}
                      <div className="col-span-5 pr-2">
                        <div className="font-bold text-slate-900 text-xs leading-snug">
                          {task.title}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {task.phaseName}
                        </div>
                      </div>

                      {/* Target Date */}
                      <div className="col-span-3">
                        <input
                          type="date"
                          value={task.plannedDate}
                          min={getMinDateForTask(idx)}
                          onChange={(e) =>
                            handleTaskDateChange(idx, e.target.value)
                          }
                          className="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded-lg font-mono focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 transition-colors"
                        />
                      </div>

                      {/* In-House Custom Assign User Dropdown */}
                      <div className="col-span-3">
                        <CustomSelect
                          value={task.assignedTo}
                          onChange={(val) =>
                            handleTaskAssigneeChange(task.orderIndex, val)
                          }
                          options={selectUserOptions}
                          placeholder="Assign user..."
                          className="w-full"
                          buttonClassName="h-8 py-0"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Modal Footer Step 2 */}
                <div className="p-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between shrink-0">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex items-center space-x-1.5 px-4 py-2 text-sm font-bold text-slate-600 hover:text-black cursor-pointer"
                  >
                    <IconChevronLeft className="w-4 h-4" />
                    <span>Back to Details</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex items-center space-x-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-lg transition-all cursor-pointer shadow-sm hover:shadow disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <span>Deploying Track...</span>
                      </>
                    ) : (
                      <>
                        <span>Deploy Project & 21 Tasks</span>
                        <IconCheck className="w-4 h-4 stroke-[2.5]" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
