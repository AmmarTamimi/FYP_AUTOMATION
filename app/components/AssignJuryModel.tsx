// components/AssignJuryModal.tsx
import React, { useEffect, useState } from 'react';
import { 
  X, UserCheck, Users, Award, Briefcase, AlertCircle, Search, 
  CheckCircle, User, Mail, BookOpen, Star, Clock, Filter,
  ChevronRight, Shield, Sparkles, Crown
} from 'lucide-react';

interface Teacher {
  TeacherId: number;
  name: string;
  email: string;
  specialization: string;
  qualification: string;
  experience: number;
  role: 'senior' | 'junior';
  currentLoad: number;
  deptId?: number;
}

interface AssignJuryModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: number;
  groupUsername: string;
  onAssign: (groupId: number, seniorId: number, juniorId: number, seniorTeacherName: string, seniorTeacherEmail: string,juniorTeacherName: string, juniorTeacherEmail: string) => void;
}

const MAX_TEACHER_LOAD = 7;

const AssignJuryModal = ({ 
  isOpen, 
  onClose, 
  groupId, 
  groupUsername, 
  onAssign 
}: AssignJuryModalProps) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSenior, setSelectedSenior] = useState<Teacher | null>(null);
  const [selectedJunior, setSelectedJunior] = useState<Teacher | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeRoleFilter, setActiveRoleFilter] = useState<'all' | 'senior' | 'junior'>('all');

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const teachersRes = await fetch(`/api/admin/teachers?groupId=${groupId}`);
      const teachersData = await teachersRes.json();
      
      const juriesRes = await fetch('/api/admin/jury');
      const juriesData = await juriesRes.json();

      const teachersWithLoad = teachersData.map((teacher: any) => {
        let load = 0;
        for (const jury of juriesData) {
          if (jury.seniorId === teacher.TeacherId || jury.juniorId === teacher.TeacherId) {
            load += jury.numOfProjectsAssigned || 0;
          }
        }
        return {
          ...teacher,
          currentLoad: load,
        };
      });

      setTeachers(teachersWithLoad);
      console.log("teachers data: ",teachersWithLoad)
    } catch (error) {
      console.error('Error fetching teachers:', error);
      setError('Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTeachers();
      setSelectedSenior(null);
      setSelectedJunior(null);
      setError('');
      setSuccess('');
      setSearchTerm('');
    }
  }, [isOpen]);

  const getFilteredTeachers = () => {
    let filtered = teachers;

    if (activeRoleFilter === 'senior') {
      filtered = filtered.filter(t => t.role === 'senior');
    } else if (activeRoleFilter === 'junior') {
      filtered = filtered.filter(t => t.role === 'junior');
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(term) ||
        t.email.toLowerCase().includes(term) ||
        t.specialization.toLowerCase().includes(term)
      );
    }

    // Sort: available first, then by load
    return filtered.sort((a, b) => {
      const aAvailable = a.currentLoad < MAX_TEACHER_LOAD ? 0 : 1;
      const bAvailable = b.currentLoad < MAX_TEACHER_LOAD ? 0 : 1;
      if (aAvailable !== bAvailable) return aAvailable - bAvailable;
      return a.currentLoad - b.currentLoad;
    });
  };

  const isTeacherAvailable = (teacher: Teacher) => {
    return teacher.currentLoad < MAX_TEACHER_LOAD;
  };

  const handleTeacherSelect = (teacher: Teacher) => {
    if (teacher.role === 'senior') {
      if (selectedSenior?.TeacherId === teacher.TeacherId) {
        setSelectedSenior(null);
      } else {
        setSelectedSenior(teacher);
        if (selectedJunior?.TeacherId === teacher.TeacherId) {
          setSelectedJunior(null);
        }
      }
    } else {
      if (selectedJunior?.TeacherId === teacher.TeacherId) {
        setSelectedJunior(null);
      } else {
        setSelectedJunior(teacher);
        if (selectedSenior?.TeacherId === teacher.TeacherId) {
          setSelectedSenior(null);
        }
      }
    }
    console.log("selected teacher: ",selectedJunior, selectedSenior)
  };

  const handleAssign = () => {
    if (!selectedSenior || !selectedJunior) {
      setError('Please select both a senior and junior teacher');
      return;
    }

    if (selectedSenior.TeacherId === selectedJunior.TeacherId) {
      setError('Senior and Junior cannot be the same teacher');
      return;
    }

    if (selectedSenior.currentLoad >= MAX_TEACHER_LOAD) {
      setError(`${selectedSenior.name} is already at maximum load`);
      return;
    }
    if (selectedJunior.currentLoad >= MAX_TEACHER_LOAD) {
      setError(`${selectedJunior.name} is already at maximum load`);
      return;
    }

    setError('');
    setSuccess(`✓ Jury assigned: ${selectedSenior.name} (Senior) & ${selectedJunior.name} (Junior)`);
    
    onAssign(groupId, selectedSenior.TeacherId, selectedJunior.TeacherId, selectedSenior.name,selectedSenior.email,selectedJunior.name,selectedJunior.email);
    
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const getLoadColor = (load: number) => {
    if (load >= MAX_TEACHER_LOAD) return 'bg-red-100 text-red-700 border-red-200';
    if (load >= MAX_TEACHER_LOAD - 2) return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  };

  const getLoadDot = (load: number) => {
    if (load >= MAX_TEACHER_LOAD) return 'bg-red-500';
    if (load >= MAX_TEACHER_LOAD - 2) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  if (!isOpen) return null;

  const filteredTeachers = getFilteredTeachers();
  const availableTeachers = filteredTeachers.filter(t => isTeacherAvailable(t));
  const isLoading = loading;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1A237E] to-[#3F51B5] px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Assign Jury</h3>
              <p className="text-indigo-200 text-sm">
                Group: <span className="font-medium text-white">{groupUsername}</span>
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-600 text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              {success}
            </div>
          )}

          {/* Selected Teachers Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className={`border-2 rounded-xl p-4 transition-all ${selectedSenior ? 'border-purple-500 bg-purple-50/30' : 'border-dashed border-gray-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Crown className={`w-4 h-4 ${selectedSenior ? 'text-purple-600' : 'text-gray-400'}`} />
                <h4 className="font-semibold text-gray-700">Senior Evaluator</h4>
                <span className="text-xs ml-auto">
                  {selectedSenior ? (
                    <span className="text-emerald-600 font-medium">✓ Selected</span>
                  ) : (
                    <span className="text-gray-400">Select a senior</span>
                  )}
                </span>
              </div>
              {selectedSenior ? (
                <div className="bg-white rounded-lg p-3 shadow-sm border border-purple-200">
                  <p className="font-medium text-gray-800">{selectedSenior.name}</p>
                  <p className="text-xs text-gray-500">{selectedSenior.specialization}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getLoadColor(selectedSenior.currentLoad)}`}>
                      {selectedSenior.currentLoad}/{MAX_TEACHER_LOAD} groups
                    </span>
                    <span className="text-xs text-gray-400">{selectedSenior.experience}+ yrs exp</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-3">Click a senior from the list below</p>
              )}
            </div>

            <div className={`border-2 rounded-xl p-4 transition-all ${selectedJunior ? 'border-blue-500 bg-blue-50/30' : 'border-dashed border-gray-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Star className={`w-4 h-4 ${selectedJunior ? 'text-blue-600' : 'text-gray-400'}`} />
                <h4 className="font-semibold text-gray-700">Junior Evaluator</h4>
                <span className="text-xs ml-auto">
                  {selectedJunior ? (
                    <span className="text-emerald-600 font-medium">✓ Selected</span>
                  ) : (
                    <span className="text-gray-400">Select a junior</span>
                  )}
                </span>
              </div>
              {selectedJunior ? (
                <div className="bg-white rounded-lg p-3 shadow-sm border border-blue-200">
                  <p className="font-medium text-gray-800">{selectedJunior.name}</p>
                  <p className="text-xs text-gray-500">{selectedJunior.specialization}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getLoadColor(selectedJunior.currentLoad)}`}>
                      {selectedJunior.currentLoad}/{MAX_TEACHER_LOAD} groups
                    </span>
                    <span className="text-xs text-gray-400">{selectedJunior.experience}+ yrs exp</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-3">Click a junior from the list below</p>
              )}
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search teachers by name, email, or specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3F51B5] focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveRoleFilter('all')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeRoleFilter === 'all'
                    ? 'bg-[#3F51B5] text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveRoleFilter('senior')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeRoleFilter === 'senior'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Senior
              </button>
              <button
                onClick={() => setActiveRoleFilter('junior')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeRoleFilter === 'junior'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Junior
              </button>
            </div>
          </div>

          {/* Teachers List */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-[#3F51B5] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No teachers found matching your criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
              {filteredTeachers.map((teacher) => {
                const isAvailable = isTeacherAvailable(teacher);
                const isSelected = selectedSenior?.TeacherId === teacher.TeacherId || 
                                  selectedJunior?.TeacherId === teacher.TeacherId;
                const isSenior = teacher.role === 'senior';

                return (
                  <button
                    key={teacher.TeacherId}
                    onClick={() => handleTeacherSelect(teacher)}
                    disabled={!isAvailable}
                    className={`
                      text-left p-4 rounded-xl border-2 transition-all
                      ${isSelected ? 'border-[#3F51B5] bg-[#3F51B5]/5 shadow-md' : 'border-gray-200 hover:border-gray-300'}
                      ${!isAvailable ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isSenior ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {isSenior ? <Crown className="w-5 h-5" /> : <Star className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-800 truncate">{teacher.name}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            isSenior ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {isSenior ? 'Senior' : 'Junior'}
                          </span>
                          {((isSenior && selectedSenior?.TeacherId === teacher.TeacherId) || (!isSenior && selectedJunior?.TeacherId === teacher.TeacherId)) && (
                            <span className="text-xs px-2 py-0.5 bg-[#3F51B5] text-white rounded-full">
                              Selected
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate">{teacher.specialization}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <div className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${getLoadDot(teacher.currentLoad)}`} />
                            <span className={`text-xs font-medium ${isAvailable ? 'text-gray-600' : 'text-red-500'}`}>
                              {teacher.currentLoad}/{MAX_TEACHER_LOAD}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-400">{teacher.experience}+ yrs</span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-400">{teacher.qualification}</span>
                        </div>
                      </div>
                      {!isAvailable && (
                        <div className="shrink-0">
                          <span className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded-full whitespace-nowrap">
                            Full
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 flex justify-between items-center pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-400">
              <span className="font-medium">Max load per teacher:</span> {MAX_TEACHER_LOAD} groups
              <span className="mx-2">•</span>
              <span className="text-emerald-600">●</span> Available
              <span className="mx-2">•</span>
              <span className="text-amber-600">●</span> High load
              <span className="mx-2">•</span>
              <span className="text-red-600">●</span> Full
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={!selectedSenior || !selectedJunior}
                className="px-6 py-2 bg-[#3F51B5] text-white rounded-xl hover:bg-[#5C6BC0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-md shadow-[#3F51B5]/20"
              >
                <UserCheck className="w-4 h-4" />
                Assign Jury
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignJuryModal;