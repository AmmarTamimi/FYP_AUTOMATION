// components/AssignJuryModal.tsx
import React, { useEffect, useState } from 'react';
import { X, UserCheck, Users, Award, Briefcase, AlertCircle, Search, CheckCircle } from 'lucide-react';

interface Teacher {
  teacherId: number;
  name: string;
  email: string;
  specialization: string;
  qualification: string;
  experience: number;
  role: 'senior' | 'junior';
  currentLoad: number;
}

interface Jury {
  juryId: number;
  seniorId: number;
  juniorId: number;
  numOfProjectsAssigned: number;
  seniorName?: string;
  juniorName?: string;
}

interface AssignJuryModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: number;
  groupUsername: string;
  onAssign: (groupId: number, seniorId: number, juniorId: number) => void;
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
  const [existingJuries, setExistingJuries] = useState<Jury[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSenior, setSelectedSenior] = useState<Teacher | null>(null);
  const [selectedJunior, setSelectedJunior] = useState<Teacher | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchTeachersAndJuries = async () => {
    setLoading(true);
    try {
      // Fetch all teachers with their current load
      const teachersRes = await fetch('/api/admin/teachers');
      const teachersData = await teachersRes.json();
      
      // Fetch all juries to get current load for each teacher
      const juriesRes = await fetch('/api/admin/jury');
      const juriesData = await juriesRes.json();
      setExistingJuries(juriesData);

      // Calculate current load for each teacher
      const teachersWithLoad = teachersData.map((teacher: any) => {
        // Count how many juries this teacher is in
        let load = 0;
        if(juriesData.length === 0){
            console.log("no juries available");
            return;
        }
        for (const jury of juriesData) {
          if (jury.seniorId === teacher.teacherId || jury.juniorId === teacher.teacherId) {
            load += jury.numOfProjectsAssigned || 0;
          }
        }
        return {
          ...teacher,
          currentLoad: load,
        };
      });

      setTeachers(teachersWithLoad);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      setError('Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTeachersAndJuries();
      setSelectedSenior(null);
      setSelectedJunior(null);
      setError('');
      setSuccess('');
    }
  }, [isOpen]);

  const getAvailableTeachers = (role: 'senior' | 'junior') => {
    const filtered = teachers.filter((teacher) => {
      const isRoleMatch = teacher.role === role;
      const isAvailable = teacher.currentLoad < MAX_TEACHER_LOAD;
      const matchesSearch = teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           teacher.specialization.toLowerCase().includes(searchTerm.toLowerCase());
      
      // If selecting senior, exclude already selected junior
      if (role === 'senior' && selectedJunior && teacher.teacherId === selectedJunior.teacherId) {
        return false;
      }
      // If selecting junior, exclude already selected senior
      if (role === 'junior' && selectedSenior && teacher.teacherId === selectedSenior.teacherId) {
        return false;
      }
      
      return isRoleMatch && isAvailable && matchesSearch;
    });
    
    return filtered.sort((a, b) => a.currentLoad - b.currentLoad);
  };

  const handleAssign = () => {
    if (!selectedSenior || !selectedJunior) {
      setError('Please select both a senior and junior teacher');
      return;
    }

    if (selectedSenior.teacherId === selectedJunior.teacherId) {
      setError('Senior and Junior cannot be the same teacher');
      return;
    }

    // Check if both teachers are available
    if (selectedSenior.currentLoad >= MAX_TEACHER_LOAD) {
      setError(`${selectedSenior.name} is already at maximum load (${MAX_TEACHER_LOAD} groups)`);
      return;
    }
    if (selectedJunior.currentLoad >= MAX_TEACHER_LOAD) {
      setError(`${selectedJunior.name} is already at maximum load (${MAX_TEACHER_LOAD} groups)`);
      return;
    }

    setError('');
    setSuccess(`Jury assigned: Senior: ${selectedSenior.name}, Junior: ${selectedJunior.name}`);
    
    // Call the onAssign callback
    onAssign(groupId, selectedSenior.teacherId, selectedJunior.teacherId);
    
    // Close modal after delay
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const getTeacherLoadColor = (load: number) => {
    if (load >= MAX_TEACHER_LOAD) return 'text-red-600';
    if (load >= MAX_TEACHER_LOAD - 2) return 'text-amber-600';
    return 'text-emerald-600';
  };

  const getTeacherStatusBadge = (teacher: Teacher) => {
    if (teacher.currentLoad >= MAX_TEACHER_LOAD) {
      return <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full">Full</span>;
    }
    if (teacher.currentLoad >= MAX_TEACHER_LOAD - 2) {
      return <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">High Load</span>;
    }
    return <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">Available</span>;
  };

  if (!isOpen) return null;

  const availableSeniors = getAvailableTeachers('senior');
  const availableJuniors = getAvailableTeachers('junior');

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Assign Jury</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Group: <span className="font-medium text-gray-700">{groupUsername}</span>
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              {success}
            </div>
          )}

          {/* Search */}
          <div className="relative mb-4">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search teachers by name, email, or specialization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3F51B5]"
            />
          </div>

          {/* Selected Teachers Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Senior Selection */}
            <div className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-5 h-5 text-purple-600" />
                <h4 className="font-semibold text-gray-800">Senior Evaluator</h4>
                <span className="text-xs text-gray-500 ml-auto">
                  {selectedSenior ? '✅ Selected' : 'Select below'}
                </span>
              </div>
              {selectedSenior ? (
                <div className="bg-purple-50 rounded-lg p-3">
                  <p className="font-medium text-gray-800">{selectedSenior.name}</p>
                  <p className="text-xs text-gray-500">{selectedSenior.specialization}</p>
                  <p className="text-xs text-gray-500">Load: {selectedSenior.currentLoad}/{MAX_TEACHER_LOAD}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">No senior selected</p>
              )}
            </div>

            {/* Junior Selection */}
            <div className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <UserCheck className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-gray-800">Junior Evaluator</h4>
                <span className="text-xs text-gray-500 ml-auto">
                  {selectedJunior ? '✅ Selected' : 'Select below'}
                </span>
              </div>
              {selectedJunior ? (
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="font-medium text-gray-800">{selectedJunior.name}</p>
                  <p className="text-xs text-gray-500">{selectedJunior.specialization}</p>
                  <p className="text-xs text-gray-500">Load: {selectedJunior.currentLoad}/{MAX_TEACHER_LOAD}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">No junior selected</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Senior Teachers List */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-purple-50 px-4 py-2 border-b border-gray-200">
                <h4 className="font-medium text-purple-700 flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Senior Teachers ({availableSeniors.length})
                </h4>
                <p className="text-xs text-gray-500">Max load: {MAX_TEACHER_LOAD} groups</p>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
                {availableSeniors.length === 0 ? (
                  <p className="text-sm text-gray-400 p-4 text-center">No available senior teachers</p>
                ) : (
                  availableSeniors.map((teacher) => (
                    <button
                      key={teacher.teacherId}
                      onClick={() => setSelectedSenior(teacher)}
                      className={`w-full text-left px-4 py-3 hover:bg-purple-50 transition-colors ${
                        selectedSenior?.teacherId === teacher.teacherId ? 'bg-purple-50 border-l-4 border-purple-600' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-800">{teacher.name}</p>
                          <p className="text-xs text-gray-500">{teacher.specialization}</p>
                          <p className="text-xs text-gray-400">{teacher.qualification}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-medium ${getTeacherLoadColor(teacher.currentLoad)}`}>
                            {teacher.currentLoad}/{MAX_TEACHER_LOAD}
                          </p>
                          {getTeacherStatusBadge(teacher)}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Junior Teachers List */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-blue-50 px-4 py-2 border-b border-gray-200">
                <h4 className="font-medium text-blue-700 flex items-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  Junior Teachers ({availableJuniors.length})
                </h4>
                <p className="text-xs text-gray-500">Max load: {MAX_TEACHER_LOAD} groups</p>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
                {availableJuniors.length === 0 ? (
                  <p className="text-sm text-gray-400 p-4 text-center">No available junior teachers</p>
                ) : (
                  availableJuniors.map((teacher) => (
                    <button
                      key={teacher.teacherId}
                      onClick={() => setSelectedJunior(teacher)}
                      className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors ${
                        selectedJunior?.teacherId === teacher.teacherId ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-800">{teacher.name}</p>
                          <p className="text-xs text-gray-500">{teacher.specialization}</p>
                          <p className="text-xs text-gray-400">{teacher.qualification}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-medium ${getTeacherLoadColor(teacher.currentLoad)}`}>
                            {teacher.currentLoad}/{MAX_TEACHER_LOAD}
                          </p>
                          {getTeacherStatusBadge(teacher)}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Assign Button */}
          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAssign}
              disabled={!selectedSenior || !selectedJunior}
              className="px-6 py-2 bg-[#3F51B5] text-white rounded-lg hover:bg-[#5C6BC0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              Assign Jury
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignJuryModal;