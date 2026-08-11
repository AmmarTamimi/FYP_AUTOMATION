// app/(dashboard)/student/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, 
  BookOpen, 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle,
  Search,
  X,
  Eye,
  EyeOff,
  LogOut,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Mail,
  Send,
  Calendar,
  UserCheck,
  ClipboardList,
  FolderOpen,
  Download,
  ExternalLink,
  Clock,
  MapPin,
  User,
  Award,
  FileCheck,
  Shield,
  GraduationCap,
  Target,
  Briefcase
} from "lucide-react";

// Types
interface StudentGroup {
  groupId: number;
  groupUsername: string;
  leaderEmail: string;
  supervisorEmail: string;
  status: 'PENDING' | 'VERIFIED' | 'DENIED';
  projectTitle: string;
  domains: string;
  proposalDocument: string;
}

interface Student {
  stdId: number;
  name: string;
  email: string;
  rollNo: string;
  section: string;
  batch: number;
}

interface Jury {
  juryId: number;
  seniorName: string;
  juniorName: string;
  seniorEmail: string;
  juniorEmail: string;
}

interface Schedule {
  scheduleId: number;
  day: string;
  date: string;
  startTime: string;
  endTime: string;
  juniorName: string;
  seniorName: string;
  venue: string;
  venueCapacity: number;
}

interface Project {
  PROJECTID: number;
  domains: string;
  GROUPID: number;
  PROPOSALDOCUMENT: string;
  PROJECTTITLE: string;
}

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'project' | 'jury' | 'schedule'>('overview');
  
  // Data states
  const [group, setGroup] = useState<StudentGroup | null>(null);
  const [members, setMembers] = useState<Student[]>([]);
  const [project, setproject] = useState<Project | null>(null);
  const [jury, setJury] = useState<Jury | null>(null);
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [stats, setStats] = useState({
    membersCount: 0,
    projectSubmitted: false,
    juryAssigned: false,
    scheduleConfirmed: false
  });
  
  // Modal states
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  
  // Document upload
  const [newDocument, setNewDocument] = useState<File | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'STUDENT') {
      router.push('/login');
      return;
    }
    setUser(parsedUser);
    fetchGroupData();
  }, []);


  function formatRollNumberFromEmail(email: string): string {
  if (!email || typeof email !== 'string') return '';
  
  // Match pattern: k + 2 digits + 4 digits @ domain
  const match = email.match(/k(\d{2})(\d{4})@/);
  
  if (match && match[1] && match[2]) {
    const firstTwo = match[1];  // e.g., "24"
    const lastFour = match[2];   // e.g., "3094"
    return `${firstTwo}k-${lastFour}`; // e.g., "24k-3094"
  }
  
  return email; // return original if no match
}


const fetchGroupData = async () => {
  console.log("=== STARTING fetchGroupData ===");
  setLoading(true);
  try {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const groupUsername = storedUser.name;
    console.log("Group username from localStorage:", groupUsername);
    
    if (!groupUsername) {
      console.error("No group username found!");
      setLoading(false);
      return;
    }
    
    // Fetch group details
    console.log("Fetching group from:", `/api/student/group?username=${groupUsername}`);
    const groupRes = await fetch(`/api/student/group?username=${encodeURIComponent(groupUsername)}`);
    
    if (!groupRes.ok) {
      console.error("Group API returned error:", groupRes.status);
      setLoading(false);
      return;
    }
    
    const groupData = await groupRes.json();
    console.log("Group data received:", groupData);
    
    const currentGroup = groupData[0];
    setGroup(currentGroup);
    
    let memberCount = 0;
    let scheduleExists = false;
    let scheduleData = null;
    
    // Fetch group members
    if (currentGroup.groupId) {
      console.log("Fetching members for groupId:", currentGroup.groupId);
      const membersRes = await fetch(`/api/student/group/members?groupId=${currentGroup.groupId}`);
      if (membersRes.ok) {
        const membersData = await membersRes.json();
        memberCount = membersData.length;
        console.log("Members data received:", membersData);
        setMembers(membersData);
      } else {
        console.error("Members API error:", membersRes.status);
      }

      // Fetch jury details
      if (currentGroup.juryId) {
        const juryRes = await fetch(`/api/student/group/jury?juryId=${currentGroup.juryId}`);
        if (juryRes.ok) {
          const juryDetails = await juryRes.json();
          setJury(juryDetails[0]);
          console.log("Jury details fetched:", juryDetails);
        }
      }
      
      // ✅ Fetch schedule for this group
      console.log("Fetching schedule for groupId:", currentGroup.groupId);
      const scheduleRes = await fetch(`/api/student/group/schedule?groupId=${currentGroup.groupId}`);
      console.log("schedule result",scheduleRes);
      if (scheduleRes.ok) {
        scheduleData = await scheduleRes.json();
        console.log("Schedule data received:", scheduleData);
        if (scheduleData && scheduleData.length > 0) {
          setSchedule(scheduleData[0]);
          scheduleExists = true;
        }
      } else {
        console.log("No schedule found for this group");
      }
    }

    // Fetch project details
    const projectRes = await fetch(`/api/student/group/project?groupId=${currentGroup.groupId}`);
    if (projectRes.ok) {
      const projectDetails = await projectRes.json();
      console.log("Project Data: ", projectDetails);
      setproject(projectDetails[0]);
      setStats({
        membersCount: memberCount,
        projectSubmitted: !!projectDetails[0]?.PROPOSALDOCUMENT,
        juryAssigned: !!currentGroup.juryId,
        scheduleConfirmed: scheduleExists
      });
    }
    
  } catch (error) {
    console.error('Error fetching group data:', error);
  } finally {
    console.log("Setting loading to false");
    setLoading(false);
  }
};

// Helper function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'long' });
  const year = date.getFullYear();
  
  // Add ordinal suffix to day (1st, 2nd, 3rd, 4th, etc.)
  const getOrdinalSuffix = (day: number) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };
  
  return `${day}${getOrdinalSuffix(day)} ${month} ${year}`;
};

  const handleUploadDocument = async () => {
    if (!newDocument) {
      setUploadError('Please select a file to upload');
      return;
    }
    
    if (newDocument.type !== 'application/pdf') {
      setUploadError('Only PDF files are allowed');
      return;
    }
    
    if (newDocument.size > 5 * 1024 * 1024) {
      setUploadError('File size must be less than 5MB');
      return;
    }
    
    setUploading(true);
    setUploadError('');
    setUploadSuccess('');
    
    const formData = new FormData();
    formData.append('document', newDocument);
    formData.append('groupId', String(group?.groupId));
    
    try {
      const response = await fetch('/api/student/upload-document', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setUploadSuccess('Document uploaded successfully!');
        setNewDocument(null);
        fetchGroupData();
        setTimeout(() => setShowDocumentModal(false), 2000);
      } else {
        setUploadError(data.message || 'Upload failed');
      }
    } catch (error) {
      setUploadError('Network error. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleViewDocument = (docPath: string) => {
    setSelectedDocument(docPath);
    setShowDocumentModal(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  // ============================================
  // UI Components
  // ============================================

  const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const Sidebar = () => (
    <div className={`${sidebarCollapsed ? 'w-20' : 'w-64'} bg-[#1A237E] h-screen fixed left-0 top-0 transition-all duration-300 z-20`}>
      <div className="p-4 border-b border-[#3F51B5]/30">
        <div className="flex items-center justify-between">
          {!sidebarCollapsed && (
            <div>
              <h1 className="text-white font-bold text-lg">FYP Student</h1>
              <p className="text-[#9FA8DA] text-xs">Dashboard</p>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-[#9FA8DA] hover:text-white transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>
      </div>
      
      <nav className="p-4 space-y-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
            activeTab === 'overview' ? 'bg-[#3F51B5] text-white shadow-lg' : 'text-[#9FA8DA] hover:bg-white/10 hover:text-white'
          }`}
        >
          <FolderOpen className="w-5 h-5" />
          {!sidebarCollapsed && <span className="text-sm font-medium">Overview</span>}
        </button>
        
        <button
          onClick={() => setActiveTab('members')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
            activeTab === 'members' ? 'bg-[#3F51B5] text-white shadow-lg' : 'text-[#9FA8DA] hover:bg-white/10 hover:text-white'
          }`}
        >
          <Users className="w-5 h-5" />
          {!sidebarCollapsed && <span className="text-sm font-medium">Group Members</span>}
        </button>
        
        <button
          onClick={() => setActiveTab('project')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
            activeTab === 'project' ? 'bg-[#3F51B5] text-white shadow-lg' : 'text-[#9FA8DA] hover:bg-white/10 hover:text-white'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          {!sidebarCollapsed && <span className="text-sm font-medium">Project Details</span>}
        </button>
        
        <button
          onClick={() => setActiveTab('jury')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
            activeTab === 'jury' ? 'bg-[#3F51B5] text-white shadow-lg' : 'text-[#9FA8DA] hover:bg-white/10 hover:text-white'
          }`}
        >
          <UserCheck className="w-5 h-5" />
          {!sidebarCollapsed && <span className="text-sm font-medium">Jury Details</span>}
        </button>
        
        <button
          onClick={() => setActiveTab('schedule')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
            activeTab === 'schedule' ? 'bg-[#3F51B5] text-white shadow-lg' : 'text-[#9FA8DA] hover:bg-white/10 hover:text-white'
          }`}
        >
          <Calendar className="w-5 h-5" />
          {!sidebarCollapsed && <span className="text-sm font-medium">Schedule</span>}
        </button>
      </nav>
      
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#3F51B5]/30">
        <div className="mb-2 px-3 py-2">
          {!sidebarCollapsed && (
            <>
              <p className="text-[#9FA8DA] text-xs font-medium">Logged in as</p>
              <p className="text-white text-sm font-medium truncate">{user?.name || 'Student'}</p>
            </>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[#9FA8DA] hover:bg-red-500/20 hover:text-red-300 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          {!sidebarCollapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );

  // ============================================
  // Overview Tab
  // ============================================
const OverviewTab = () => {
  if (!group) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <div className="w-12 h-12 border-4 border-[#3F51B5] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500">Loading group information...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Card - Premium Gradient */}
      <div className="bg-gradient-to-r from-[#1A237E] via-[#283593] to-[#3F51B5] rounded-xl p-6 shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-1">Welcome back, {user?.name || group.groupUsername}!</h2>
            <p className="text-indigo-200 text-sm mb-4">Track your FYP progress and manage your project</p>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg">
                <GraduationCap className="w-4 h-4 text-indigo-200" />
                <span className="text-white text-sm">Group: {group.groupUsername}</span>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                group.status === 'VERIFIED' ? 'bg-green-600' : 
                group.status === 'PENDING' ? 'bg-amber-600' : 'bg-rose-600'
              }`}>
                {group.status === 'VERIFIED' && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                {group.status === 'PENDING' && <Clock className="w-3.5 h-3.5 text-white" />}
                {group.status === 'DENIED' && <XCircle className="w-3.5 h-3.5 text-white" />}
                <span className="text-sm font-medium text-white">
                  {group.status === 'VERIFIED' ? 'Verified' : group.status === 'PENDING' ? 'Pending Approval' : 'Denied'}
                </span>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
              <Target className="w-8 h-8 text-indigo-200" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Cards - Premium Colors */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Group Members</p>
              <p className="text-2xl font-bold text-gray-800">{stats.membersCount}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Project Proposal</p>
              <p className={`text-2xl font-bold ${stats.projectSubmitted ? 'text-green-600' : 'text-amber-600'}`}>
                {stats.projectSubmitted ? "Submitted" : "Pending"}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              stats.projectSubmitted ? 'bg-green-500/10' : 'bg-amber-500/10'
            }`}>
              {stats.projectSubmitted ? (
                <FileCheck className="w-6 h-6 text-green-600" />
              ) : (
                <FileText className="w-6 h-6 text-amber-600" />
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Jury Assignment</p>
              <p className={`text-2xl font-bold ${stats.juryAssigned ? 'text-green-600' : 'text-amber-600'}`}>
                {stats.juryAssigned ? "Assigned" : "Pending"}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              stats.juryAssigned ? 'bg-green-500/10' : 'bg-amber-500/10'
            }`}>
              <UserCheck className={`w-6 h-6 ${stats.juryAssigned ? 'text-green-600' : 'text-amber-600'}`} />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Schedule</p>
              <p className={`text-2xl font-bold ${stats.scheduleConfirmed ? 'text-green-600' : 'text-slate-400'}`}>
                {stats.scheduleConfirmed ? "Confirmed" : "Not Scheduled"}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              stats.scheduleConfirmed ? 'bg-green-500/10' : 'bg-slate-100'
            }`}>
              <Calendar className={`w-6 h-6 ${stats.scheduleConfirmed ? 'text-green-600' : 'text-slate-400'}`} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Group Information Card - Professional Design */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <h3 className="text-lg font-semibold text-gray-800">Group Information</h3>
          <p className="text-sm text-gray-500 mt-0.5">Key details about your FYP group</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Group Leader</p>
                <p className="text-gray-800 font-medium mt-0.5">{group.leaderEmail}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Supervisor</p>
                <p className="text-gray-800 font-medium mt-0.5">{group.supervisorEmail || 'Not Assigned'}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Project Title</p>
                <p className="text-gray-800 font-medium mt-0.5 truncate" title={group.projectTitle || 'Not Submitted'}>
                  {project?.PROJECTTITLE || 'Not Submitted'}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                <Target className="w-4 h-4 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Domain</p>
                <p className="text-gray-800 font-medium mt-0.5">{project?.domains || 'Not Selected'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Actions - Professional Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <h3 className="text-lg font-semibold text-gray-800">Quick Actions</h3>
          <p className="text-sm text-gray-500 mt-0.5">Manage your project and view details</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setActiveTab('project')}
              className="group flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 border border-transparent hover:border-gray-200"
            >
              <div className="w-10 h-10 rounded-xl bg-[#3F51B5]/10 flex items-center justify-center group-hover:bg-[#3F51B5]/20 transition-colors">
                <Upload className="w-5 h-5 text-[#3F51B5]" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-800">Upload/Update Proposal</p>
                <p className="text-sm text-gray-500">Submit your project proposal document</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            
            <button
              onClick={() => setActiveTab('jury')}
              className="group flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 border border-transparent hover:border-gray-200"
            >
              <div className="w-10 h-10 rounded-xl bg-[#3F51B5]/10 flex items-center justify-center group-hover:bg-[#3F51B5]/20 transition-colors">
                <UserCheck className="w-5 h-5 text-[#3F51B5]" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-800">View Jury Details</p>
                <p className="text-sm text-gray-500">Check your assigned evaluators</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            
            <button
              onClick={() => setActiveTab('schedule')}
              className="group flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 border border-transparent hover:border-gray-200"
            >
              <div className="w-10 h-10 rounded-xl bg-[#3F51B5]/10 flex items-center justify-center group-hover:bg-[#3F51B5]/20 transition-colors">
                <Calendar className="w-5 h-5 text-[#3F51B5]" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-800">Presentation Schedule</p>
                <p className="text-sm text-gray-500">View your scheduled slot</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            
            <button
              onClick={() => setActiveTab('members')}
              className="group flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 border border-transparent hover:border-gray-200"
            >
              <div className="w-10 h-10 rounded-xl bg-[#3F51B5]/10 flex items-center justify-center group-hover:bg-[#3F51B5]/20 transition-colors">
                <Users className="w-5 h-5 text-[#3F51B5]" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-800">Group Members</p>
                <p className="text-sm text-gray-500">View all team members</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

  // ============================================
  // Members Tab
  // ============================================
 const MembersTab = () => {
  // Process members to add formatted roll numbers
  const membersWithRollNumbers = members.map((member: Student) => ({
    ...member,
    formattedRollNo: formatRollNumberFromEmail(member.email)
  }));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <h3 className="text-lg font-semibold text-gray-800">Group Members</h3>
        <p className="text-sm text-gray-500 mt-0.5">Your project team members</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50/80">
            <tr className="border-b border-gray-100">
              <th className="text-left p-4 font-semibold text-gray-600 text-sm">#</th>
              <th className="text-left p-4 font-semibold text-gray-600 text-sm">Name</th>
              <th className="text-left p-4 font-semibold text-gray-600 text-sm">Roll Number</th>
              <th className="text-left p-4 font-semibold text-gray-600 text-sm">Email</th>
              <th className="text-left p-4 font-semibold text-gray-600 text-sm">Section</th>
              <th className="text-left p-4 font-semibold text-gray-600 text-sm">Batch</th>
            </tr>
          </thead>
          <tbody>
            {!Array.isArray(membersWithRollNumbers) || membersWithRollNumbers.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-8 text-gray-500">
                  No members found
                </td>
              </tr>
            ) : (
              membersWithRollNumbers.map((member, index) => (
                <tr key={member.stdId} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 text-gray-500">{index + 1}</td>
                  <td className="p-4 font-medium text-gray-800">{member.name}</td>
                  <td className="p-4 font-mono text-sm text-gray-600">
                    {member.formattedRollNo}
                  </td>
                  <td className="p-4 text-gray-600">{member.email}</td>
                  <td className="p-4 text-gray-600">{member.section}</td>
                  <td className="p-4 text-gray-600">{member.batch}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

  // ============================================
  // Project Details Tab
  // ============================================
  const ProjectTab = () => (
    <div className="space-y-6">
      {/* Project Info Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-lg font-semibold text-gray-800">Project Information</h3>
          <p className="text-sm text-gray-500 mt-0.5">Details about your FYP project</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Project Title</label>
              <p className="text-gray-800 font-medium">{project?.PROJECTTITLE || 'Not submitted'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Domain</label>
              <p className="text-gray-800 font-medium">{project?.domains || 'Not selected'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Supervisor</label>
              <p className="text-gray-800 font-medium">{group?.supervisorEmail || 'Not assigned'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
              <p className="mt-1">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                  group?.status === 'VERIFIED' ? 'bg-green-50 text-green-700' : 
                  group?.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'
                }`}>
                  {group?.status === 'VERIFIED' && <CheckCircle className="w-3 h-3" />}
                  {group?.status === 'PENDING' && <AlertCircle className="w-3 h-3" />}
                  {group?.status === 'DENIED' && <XCircle className="w-3 h-3" />}
                  {group?.status}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Proposal Document Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-lg font-semibold text-gray-800">Project Proposal</h3>
          <p className="text-sm text-gray-500 mt-0.5">Your submitted proposal document</p>
        </div>
        <div className="p-6">
          {project?.PROPOSALDOCUMENT ? (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#3F51B5]/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-[#3F51B5]" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Proposal Document</p>
                  <p className="text-sm text-gray-500">PDF file</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleViewDocument(project.PROPOSALDOCUMENT!)}
                  className="px-3 py-1.5 bg-blue-600 text-indigo-200 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-1"
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>
                <button
                  onClick={() => window.open(project.PROPOSALDOCUMENT!, '_blank')}
                  className="px-3 py-1.5 bg-gray-600 text-indigo-200 rounded-lg hover:bg-gray-700 transition-colors text-sm flex items-center gap-1"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">No proposal document uploaded yet</p>
              <p className="text-sm text-gray-400 mt-1">Upload your project proposal in PDF format</p>
            </div>
          )}
          
          <div className="mt-6">
            <button
              onClick={() => setShowDocumentModal(true)}
              className="w-full bg-[#3F51B5] hover:bg-[#5C6BC0] text-white px-4 py-2.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 font-medium"
            >
              <Upload className="w-4 h-4" />
              {project?.PROPOSALDOCUMENT ? 'Update Proposal Document' : 'Upload Proposal Document'}
            </button>
            <p className="text-xs text-gray-400 mt-2 text-center">
              Supported format: PDF (Max 5MB)
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // ============================================
  // Jury Details Tab
  // ============================================
  const JuryTab = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <h3 className="text-lg font-semibold text-gray-800">Jury / Evaluation Committee</h3>
        <p className="text-sm text-gray-500 mt-0.5">Your project evaluators</p>
      </div>
      
      {!stats.juryAssigned ? (
        <div className="p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-800">No Jury Assigned Yet</h3>
          <p className="text-gray-500 mt-1">A jury will be assigned after admin verification</p>
        </div>
      ) : (
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Senior Evaluator */}
            <div className="border border-gray-100 rounded-xl p-5 bg-gradient-to-br from-purple-50/30 to-transparent">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Senior Evaluator</p>
                  <p className="font-semibold text-gray-800">{jury?.seniorName || 'Not Assigned'}</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-gray-600 text-sm">
                  <span className="font-medium text-gray-500">Email:</span> {jury?.seniorEmail || '-'}
                </p>
              </div>
            </div>
            
            {/* Junior Evaluator */}
            <div className="border border-gray-100 rounded-xl p-5 bg-gradient-to-br from-blue-50/30 to-transparent">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Junior Evaluator</p>
                  <p className="font-semibold text-gray-800">{jury?.juniorName || 'Not Assigned'}</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-gray-600 text-sm">
                  <span className="font-medium text-gray-500">Email:</span> {jury?.juniorEmail || '-'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
            <p className="text-sm text-blue-700 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Your project will be evaluated by the above committee members. Please prepare your presentation accordingly.
            </p>
          </div>
        </div>
      )}
    </div>
  );

  // ============================================
  // Schedule Tab
  // ============================================
  const ScheduleTab = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <h3 className="text-lg font-semibold text-gray-800">Presentation Schedule</h3>
        <p className="text-sm text-gray-500 mt-0.5">Your project presentation slot</p>
      </div>
      
      {!stats.scheduleConfirmed ? (
        <div className="p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-800">No Schedule Assigned Yet</h3>
          <p className="text-gray-500 mt-1">Your presentation schedule will be updated here once confirmed</p>
        </div>
      ) : (
        <div className="p-6">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date & Day</p>
                  <p className="font-semibold text-gray-800">{schedule?.date ? formatDate(schedule.date) : 'Not scheduled'} - 
                  ({schedule?.day || 'TBA'})</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Time Slot</p>
                  <p className="font-semibold text-gray-800">{schedule?.startTime} - {schedule?.endTime}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Venue</p>
                  <p className="font-semibold text-gray-800">{schedule?.venue}</p>
                  <p className="text-xs text-gray-500">Capacity: {schedule?.venueCapacity} persons</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Jury</p>
                  <p className="font-semibold text-gray-800">{schedule?.seniorName}, {schedule?.juniorName}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50/50 rounded-xl border border-yellow-100">
            <p className="text-sm text-yellow-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Please arrive 15 minutes before your scheduled time. Bring your laptop and presentation slides.
            </p>
          </div>
        </div>
      )}
    </div>
  );

  // ============================================
  // Document Modal
  // ============================================
  const DocumentModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {group?.proposalDocument ? 'Update Proposal Document' : 'Upload Proposal Document'}
          </h3>
          <button onClick={() => {
            setShowDocumentModal(false);
            setNewDocument(null);
            setUploadError('');
            setUploadSuccess('');
          }} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        
        {selectedDocument ? (
          <div>
            <iframe 
              src={selectedDocument} 
              className="w-full h-96 rounded-lg border border-gray-200"
              title="Proposal Document"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowDocumentModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => window.open(selectedDocument, '_blank')}
                className="px-4 py-2 bg-[#3F51B5] text-white rounded-lg hover:bg-[#5C6BC0] transition-colors"
              >
                Open in New Tab
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-[#3F51B5] transition-colors">
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-1">Click or drag & drop your proposal</p>
                <p className="text-xs text-gray-400">PDF files only (Max 5MB)</p>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setNewDocument(e.target.files?.[0] || null)}
                  className="hidden"
                  id="document-upload"
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('document-upload')?.click()}
                  className="mt-3 text-sm text-[#3F51B5] hover:text-[#5C6BC0] font-medium"
                >
                  Browse Files
                </button>
                {newDocument && (
                  <p className="mt-3 text-sm text-green-600 flex items-center justify-center gap-1">
                    <FileText className="w-3 h-3" />
                    {newDocument.name}
                  </p>
                )}
              </div>
              
              {uploadError && (
                <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm">
                  {uploadError}
                </div>
              )}
              
              {uploadSuccess && (
                <div className="bg-green-50 text-green-600 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  {uploadSuccess}
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowDocumentModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUploadDocument}
                disabled={!newDocument || uploading}
                className="px-4 py-2 bg-[#3F51B5] text-white rounded-lg hover:bg-[#5C6BC0] disabled:opacity-50 transition-colors font-medium"
              >
                {uploading ? 'Uploading...' : (group?.proposalDocument ? 'Update' : 'Upload')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#3F51B5] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className={`${sidebarCollapsed ? 'ml-20' : 'ml-64'} transition-all duration-300`}>
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'members' && 'Group Members'}
              {activeTab === 'project' && 'Project Details'}
              {activeTab === 'jury' && 'Jury Details'}
              {activeTab === 'schedule' && 'Presentation Schedule'}
            </h2>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">{group?.status === 'VERIFIED' ? 'Verified Account' : group?.status}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="p-6">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'members' && <MembersTab />}
          {activeTab === 'project' && <ProjectTab />}
          {activeTab === 'jury' && <JuryTab />}
          {activeTab === 'schedule' && <ScheduleTab />}
        </div>
      </div>
      
      {/* Modals */}
      {showDocumentModal && <DocumentModal />}
    </div>
  );
}