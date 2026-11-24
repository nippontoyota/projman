'use client';

import React, { useState, useMemo, useRef } from 'react';
import { Project, UserRole } from '@/types';
import {
  IconSearch,
  IconExternal,
  IconChevronLeft,
  IconChevronRight,
} from '@/components/ui/Icons';
import { CustomSelect, SelectOption } from '@/components/ui/CustomSelect';

interface ProjectTrackerProps {
  projects: Project[];
  userRole: UserRole;
  onSelectProject: (p: Project) => void;
  onRefresh: () => void;
}

const PHASES: { id: 'ALL' | 1 | 2 | 3 | 4; title: string; shortName: string; count: number }[] = [
  { id: 'ALL', title: 'All Phases (21 Milestones)', shortName: 'All Phases', count: 21 },
  { id: 1, title: 'Phase 1: Property & Agreement (6 Milestones)', shortName: '1. Property', count: 6 },
  { id: 2, title: 'Phase 2: Design & GFC Approval (5 Milestones)', shortName: '2. Design & GFC', count: 5 },
  { id: 3, title: 'Phase 3: BOQ & PO Release (5 Milestones)', shortName: '3. BOQ & PO', count: 5 },
  { id: 4, title: 'Phase 4: Site Execution & Handover (5 Milestones)', shortName: '4. Site Execution', count: 5 },
];

const STATUS_OPTIONS: SelectOption[] = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'Commissioned', label: 'Commissioned' },
  { value: 'Ready for Handover', label: 'Ready for Handover' },
  { value: 'BOQ Approved / PO Pending', label: 'BOQ Approved / PO Pending' },
  { value: 'Pre-Construction', label: 'Pre-Construction' },
  { value: 'Commercial Negotiation', label: 'Commercial Negotiation' },
];

const FACILITY_OPTIONS: SelectOption[] = [
  { value: 'ALL', label: 'All Facilities' },
  { value: 'Sales', label: 'Sales' },
  { value: 'Service', label: 'Service' },
  { value: 'Stock Yard', label: 'Stock Yard' },
  { value: 'Sales & Service', label: 'Sales & Service' },
];

export const ProjectTracker: React.FC<ProjectTrackerProps> = ({
  projects,
  userRole,
  onSelectProject,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [facilityFilter, setFacilityFilter] = useState('ALL');
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [visiblePhaseTitle, setVisiblePhaseTitle] = useState('All Phases (21 Milestones)');
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const selectedPhase = PHASES[phaseIndex].id;

  const handleSelectPhase = (idx: number) => {
    setPhaseIndex(idx);
    const targetPhase = PHASES[idx];
    if (targetPhase.id === 'ALL') {
      setVisiblePhaseTitle('All Phases (21 Milestones)');
      setScrollProgress(0);
      if (tableContainerRef.current) {
        tableContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      }
    } else {
      setVisiblePhaseTitle(targetPhase.title);
    }
  };

  const handleSmoothScrollLeft = () => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollBy({ left: -240, behavior: 'smooth' });
    }
  };

  const handleSmoothScrollRight = () => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollBy({ left: 240, behavior: 'smooth' });
    }
  };

  const handlePrevPhase = () => {
    if (selectedPhase === 'ALL') {
      handleSmoothScrollLeft();
    } else {
      if (phaseIndex > 0) {
        handleSelectPhase(phaseIndex - 1);
      }
    }
  };

  const handleNextPhase = () => {
    if (selectedPhase === 'ALL') {
      handleSmoothScrollRight();
    } else {
      if (phaseIndex < PHASES.length - 1) {
        handleSelectPhase(phaseIndex + 1);
      }
    }
  };

  const handleSliderDrag = (val: number) => {
    if (selectedPhase === 'ALL') {
      setScrollProgress(val);
      if (!tableContainerRef.current) return;
      const { scrollWidth, clientWidth } = tableContainerRef.current;
      const maxScroll = scrollWidth - clientWidth;
      if (maxScroll > 0) {
        tableContainerRef.current.scrollLeft = (val / 100) * maxScroll;
      }
    } else {
      handleSelectPhase(val);
    }
  };

  const handleTableScroll = () => {
    if (!tableContainerRef.current || selectedPhase !== 'ALL') return;
    const { scrollLeft, scrollWidth, clientWidth } = tableContainerRef.current;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll > 0) {
      const progress = Math.round((scrollLeft / maxScroll) * 100);
      setScrollProgress(progress);

      if (scrollLeft < 144) {
        setVisiblePhaseTitle('Phase 1: Property & Agreement');
      } else if (scrollLeft < 384) {
        setVisiblePhaseTitle('Phase 2: Design & GFC Approval');
      } else if (scrollLeft < 624) {
        setVisiblePhaseTitle('Phase 3: BOQ & PO Release');
      } else {
        setVisiblePhaseTitle('Phase 4: Site Execution & Handover');
      }
    }
  };

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (search) {
        const query = search.toLowerCase();
        const matchesLoc = p.location.name.toLowerCase().includes(query);
        const matchesCode = p.code.toLowerCase().includes(query);
        const matchesRemarks = p.keyRemarks?.toLowerCase().includes(query) || false;
        if (!matchesLoc && !matchesCode && !matchesRemarks) return false;
      }
      if (statusFilter !== 'ALL' && p.currentStatus !== statusFilter) return false;
      if (facilityFilter !== 'ALL' && p.facilityType !== facilityFilter) return false;
      return true;
    });
  }, [projects, search, statusFilter, facilityFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Commissioned':
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold';
      case 'Ready for Handover':
        return 'bg-purple-50 text-purple-700 border-purple-200 font-bold';
      case 'BOQ Approved / PO Pending':
        return 'bg-amber-50 text-amber-700 border-amber-200 font-bold';
      case 'Pre-Construction':
        return 'bg-rose-50 text-rose-700 border-rose-200 font-bold';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200 font-bold';
    }
  };

  return (
    <div className="space-y-3">
      {/* Controls Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 shrink-0">
          <h2 className="text-sm font-bold text-black tracking-tight">
            Milestones
          </h2>
          <span className="text-xs font-mono text-slate-500 font-semibold">
            ({filteredProjects.length} tracks)
          </span>
        </div>

        {/* Centered Bigger Search Bar */}
        <div className="relative flex-1 max-w-sm mx-auto w-full">
          <IconSearch className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search location, code or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xs text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-black shadow-2xs"
          />
        </div>

        {/* Custom Filters */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <CustomSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={STATUS_OPTIONS}
            size="sm"
            className="w-44"
          />

          <CustomSelect
            value={facilityFilter}
            onChange={setFacilityFilter}
            options={FACILITY_OPTIONS}
            size="sm"
            className="w-36"
          />
        </div>
      </div>

      {/* Seamless Phase Slider */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 py-0.5 text-xs">
        {/* Phase Arrow Buttons & Navigator */}
        <div className="flex items-center space-x-2">
          {/* Previous Phase / Scroll Left Arrow Button */}
          <button
            type="button"
            onClick={handlePrevPhase}
            disabled={selectedPhase === 'ALL' ? scrollProgress === 0 : phaseIndex === 0}
            className="flex items-center justify-center w-7 h-7 rounded-xs bg-white border border-slate-300 hover:border-black hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-2xs"
            title={selectedPhase === 'ALL' ? 'Smooth scroll left' : 'Previous phase'}
          >
            <IconChevronLeft className="w-3.5 h-3.5 text-black" />
          </button>

          {/* Phase Segmented Buttons */}
          <div className="flex items-center bg-white p-0.5 rounded-xs border border-slate-300">
            {PHASES.map((phase, idx) => (
              <button
                key={phase.id}
                type="button"
                onClick={() => handleSelectPhase(idx)}
                className={`px-2.5 py-1 rounded-xs text-[11px] font-bold transition-all cursor-pointer ${
                  phaseIndex === idx
                    ? 'bg-black text-white shadow-xs'
                    : 'text-slate-600 hover:text-black hover:bg-slate-100'
                }`}
              >
                {phase.shortName}
              </button>
            ))}
          </div>

          {/* Next Phase / Scroll Right Arrow Button */}
          <button
            type="button"
            onClick={handleNextPhase}
            disabled={selectedPhase === 'ALL' ? scrollProgress === 100 : phaseIndex === PHASES.length - 1}
            className="flex items-center justify-center w-7 h-7 rounded-xs bg-white border border-slate-300 hover:border-black hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-2xs"
            title={selectedPhase === 'ALL' ? 'Smooth scroll right' : 'Next phase'}
          >
            <IconChevronRight className="w-3.5 h-3.5 text-black" />
          </button>
        </div>

        {/* Smooth Slider Range Control */}
        <div className="flex items-center space-x-2 shrink-0">
          {selectedPhase === 'ALL' ? (
            <>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={scrollProgress}
                onChange={(e) => handleSliderDrag(Number(e.target.value))}
                className="w-32 accent-black cursor-pointer"
                title="Smoothly slide across milestone phases"
              />
              <span className="text-[10px] font-mono text-slate-500 font-semibold w-10 text-right">
                {scrollProgress}%
              </span>
            </>
          ) : (
            <>
              <input
                type="range"
                min={0}
                max={PHASES.length - 1}
                step={1}
                value={phaseIndex}
                onChange={(e) => handleSliderDrag(Number(e.target.value))}
                className="w-32 accent-black cursor-pointer"
                title="Select phase"
              />
              <span className="text-[10px] font-mono text-slate-500 font-semibold w-12 text-right">
                {phaseIndex} of 4
              </span>
            </>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-black rounded-xs overflow-hidden">
        <div
          ref={tableContainerRef}
          onScroll={handleTableScroll}
          className="overflow-x-auto max-h-[750px]"
        >
          <table
            className={`w-full text-left border-collapse text-xs ${
              selectedPhase === 'ALL'
                ? 'min-w-[2032px]'
                : selectedPhase === 1
                ? 'min-w-[1312px]'
                : 'min-w-[1264px]'
            }`}
          >
            <thead className="sticky top-0 z-30 bg-slate-100 border-b-2 border-slate-400">
              <tr>
                {/* Sl. No. - Constant */}
                <th className="px-2 py-3 sticky left-0 z-40 bg-slate-100 w-16 min-w-[64px] max-w-[64px] border-r border-slate-300 text-center text-black font-black text-[11px] font-mono tracking-tight whitespace-nowrap">
                  Sl. No.
                </th>

                {/* Location & Code - Constant */}
                <th className="p-3 sticky left-16 z-40 bg-slate-100 w-60 min-w-[240px] max-w-[240px] border-r border-slate-300 text-black font-extrabold text-[11px] uppercase tracking-wider">
                  Location & Code
                </th>

                {/* Facility - Constant */}
                <th className="p-3 sticky left-[304px] z-40 bg-slate-100 w-36 min-w-[144px] max-w-[144px] border-r border-slate-300 text-black font-extrabold text-[11px] uppercase tracking-wider">
                  Facility
                </th>

                {/* Status - Constant */}
                <th className="p-3 sticky left-[448px] z-40 bg-slate-100 w-52 min-w-[208px] max-w-[208px] border-r border-slate-300 text-black font-extrabold text-[11px] uppercase tracking-wider">
                  Status
                </th>

                {/* Progress % - Constant */}
                <th className="p-3 sticky left-[656px] z-40 bg-slate-100 w-28 min-w-[112px] max-w-[112px] border-r border-slate-300 text-center text-black font-extrabold text-[11px] uppercase tracking-wider">
                  Progress %
                </th>

                {/* Remarks / Notes - Constant with Divider Border */}
                <th className="p-3 sticky left-[768px] z-40 bg-slate-100 w-64 min-w-[256px] max-w-[256px] border-r-2 border-slate-500 text-black font-extrabold text-[11px] uppercase tracking-wider shadow-md">
                  Remarks / Notes
                </th>

                {/* Selected Phase Headers */}
                {(selectedPhase === 'ALL' || selectedPhase === 1) && (
                  <th className="p-3 bg-slate-200/80 text-black border-r-2 border-slate-400 text-center font-extrabold text-xs min-w-[288px] max-w-[288px]" colSpan={6}>
                    Phase 1: Property & Agreement
                  </th>
                )}
                {(selectedPhase === 'ALL' || selectedPhase === 2) && (
                  <th className="p-3 bg-slate-200/80 text-black border-r-2 border-slate-400 text-center font-extrabold text-xs min-w-[240px] max-w-[240px]" colSpan={5}>
                    Phase 2: Design & GFC Approval
                  </th>
                )}
                {(selectedPhase === 'ALL' || selectedPhase === 3) && (
                  <th className="p-3 bg-slate-200/80 text-black border-r-2 border-slate-400 text-center font-extrabold text-xs min-w-[240px] max-w-[240px]" colSpan={5}>
                    Phase 3: BOQ & PO Release
                  </th>
                )}
                {(selectedPhase === 'ALL' || selectedPhase === 4) && (
                  <th className="p-3 bg-slate-200/80 text-black text-center font-extrabold text-xs min-w-[240px] max-w-[240px]" colSpan={5}>
                    Phase 4: Site Execution & Handover
                  </th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredProjects.map((p, idx) => (
                <tr
                  key={p.id}
                  onClick={() => onSelectProject(p)}
                  className="hover:bg-slate-50 transition-colors group cursor-pointer"
                >
                  {/* Sl. No. - Constant */}
                  <td className="px-2 py-2.5 sticky left-0 z-20 bg-white group-hover:bg-slate-50 border-r border-slate-200 text-black font-extrabold font-mono text-center text-xs w-16 min-w-[64px] max-w-[64px] whitespace-nowrap">
                    {idx + 1}
                  </td>

                  {/* Location & Code - Constant */}
                  <td className="p-3 sticky left-16 z-20 bg-white group-hover:bg-slate-50 border-r border-slate-200 font-bold text-black w-60 min-w-[240px] max-w-[240px]">
                    <div className="flex items-center space-x-1.5 whitespace-nowrap">
                      <span className="truncate">{p.location.name}</span>
                      <IconExternal className="w-3 h-3 text-slate-400 group-hover:text-black transition-colors shrink-0" />
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono font-semibold mt-0.5">{p.code}</div>
                  </td>

                  {/* Facility - Constant */}
                  <td className="p-3 sticky left-[304px] z-20 bg-white group-hover:bg-slate-50 border-r border-slate-200 text-slate-800 w-36 min-w-[144px] max-w-[144px]">
                    <span className="px-2 py-0.5 rounded-xs text-[11px] bg-slate-100 font-bold border border-slate-200 whitespace-nowrap inline-block">
                      {p.facilityType}
                    </span>
                  </td>

                  {/* Status - Constant */}
                  <td className="p-3 sticky left-[448px] z-20 bg-white group-hover:bg-slate-50 border-r border-slate-200 w-52 min-w-[208px] max-w-[208px]">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-xs text-[10px] font-bold border whitespace-nowrap ${getStatusBadge(
                        p.currentStatus
                      )}`}
                    >
                      {p.currentStatus}
                    </span>
                  </td>

                  {/* Progress % - Constant */}
                  <td className="p-3 sticky left-[656px] z-20 bg-white group-hover:bg-slate-50 border-r border-slate-200 text-center w-28 min-w-[112px] max-w-[112px]">
                    <div className="flex items-center justify-center space-x-2">
                      <span className="font-extrabold text-black text-xs font-mono">{p.workPercentage}%</span>
                      <div className="w-12 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            p.workPercentage === 100 ? 'bg-emerald-600' : 'bg-black'
                          }`}
                          style={{ width: `${p.workPercentage}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Remarks / Notes - Constant with Divider Border */}
                  <td className="p-3 sticky left-[768px] z-20 bg-white group-hover:bg-slate-50 border-r-2 border-slate-500 shadow-md w-64 min-w-[256px] max-w-[256px] text-[11px] text-slate-800">
                    <p className="line-clamp-2 leading-relaxed">
                      {p.keyRemarks || <span className="text-slate-400 italic">No notes</span>}
                    </p>
                  </td>

                  {/* Filtered Milestones of Selected Phase */}
                  {p.milestones
                    .filter((m) => selectedPhase === 'ALL' || m.phaseNumber === selectedPhase)
                    .map((m) => {
                      const isDone = m.status === 'Completed' || !!m.actualDate;
                      const isPhaseEnd = m.orderIndex === 6 || m.orderIndex === 11 || m.orderIndex === 16 || m.orderIndex === 21;

                      return (
                        <td
                          key={m.id}
                          className={`py-2 px-1 w-12 min-w-[48px] max-w-[48px] whitespace-nowrap ${isPhaseEnd ? 'border-r-2 border-slate-400' : 'border-r border-slate-100'} text-center ${
                            isDone ? 'bg-emerald-50/40' : ''
                          }`}
                          title={`${m.title}\nStatus: ${m.status}\nDate: ${
                            m.actualDate ? m.actualDate.split('T')[0] : 'Pending'
                          }`}
                        >
                          {isDone ? (
                            <div className="flex flex-col items-center justify-center">
                              <span className="text-[10px] font-mono text-emerald-700 font-extrabold whitespace-nowrap">
                                {m.actualDate ? m.actualDate.split('T')[0].slice(5) : 'Done'}
                              </span>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-0.5" />
                            </div>
                          ) : (
                            <div className="text-slate-300 text-[10px] font-bold">-</div>
                          )}
                        </td>
                      );
                    })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
