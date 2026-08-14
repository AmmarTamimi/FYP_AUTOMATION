// app/(dashboard)/teacher/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  BookOpen,
  Calendar,
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
  User,
  Award,
  FileCheck,
  Shield,
  GraduationCap,
  Target,
  Briefcase,
  Clock,
  MapPin,
  UserCheck,
  Edit,
  Lock,
  School,
  FolderOpen,
  BarChart3,
  TrendingUp,
  Star,
  FileText,
} from "lucide-react";

// Types
interface Teacher {
  TeacherId: number;
  name: string;
  email: string;
  username: string;
  specialization: string;
  qualification: string;
  experience: number;
  role: "senior" | "junior";
  designation: string;
  deptId: number;
}

interface StudentGroup {
  groupId: number;
  juryId: number;
  groupUsername: string;
  leaderEmail: string;
  status: "PENDING" | "DENIED" | "VERIFIED";
  supervisorEmail: string;
}

interface GroupMember {
  stdId: number;
  name: string;
  email: string;
  rollNo: string;
  section: string;
  batch: number;
  deptId: number;
}

interface Project {
  PROJECTID: number;
  domains: string;
  PROJECTTITLE: string;
  PROPOSALDOCUMENT: string;
  GROUPID: number;
}

interface TeacherSchedule {
  scheduleId: number;
  dateVal: string;
  day: string;
  startTime: string;
  endTime: string;
  venue: string;
  venueCapacity: number;
  groupId: number;
  groupUsername: string;
  projectTitle: string;
  leaderEmail: string;
  status: string;
}

export default function TeacherDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "students" | "schedule"
  >("overview");

  const [teacherSchedule, setTeacherSchedule] = useState<TeacherSchedule[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");

  // Data states
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [assignedGroups, setAssignedGroups] = useState<StudentGroup[]>([]);

  // Modal states
  const [showGroupModal, setShowGroupModal] = useState<{
    show: boolean;
    group: StudentGroup | null;
    members: GroupMember[];
    project: Project | null;
  }>({
    show: false,
    group: null,
    members: [],
    project: null,
  });

  const [stats, setStats] = useState({
    totalGroups: 0,
    totalStudents: 0,
    verifiedGroups: 0,
    pendingGroups: 0,
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== "TEACHER") {
      router.push("/login");
      return;
    }
    setUser(parsedUser);
    fetchTeacherData();
    fetchTeacherSchedule();
  }, []);

  const fetchTeacherData = async () => {
  setLoading(true);
  try {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const teacherEmail = storedUser.email;
    console.log("=== FETCH TEACHER DATA START ===");
    console.log("Teacher email:", teacherEmail);
    
    // 1. Fetch teacher details
    const teacherRes = await fetch(`/api/teacher/profile?email=${teacherEmail}`);
    let teacherData = await teacherRes.json();
    const teacherObj = Array.isArray(teacherData) ? teacherData[0] : teacherData;
    console.log("Teacher object:", teacherObj);
    setTeacher(teacherObj);
    
    if (teacherObj) {
      // 2. Fetch assigned groups
      const groupsRes = await fetch(`/api/teacher/groups?teacherId=${storedUser.id}`);
      console.log("teacher id: ",storedUser.id);
      console.log("Groups API response status:", groupsRes.status);
      
      let groupsData = await groupsRes.json();
      console.log("Raw groups data:", groupsData);
      
      // Handle both array and object response
      const groups = Array.isArray(groupsData) ? groupsData : (groupsData.groupId ? [groupsData] : []);
      console.log("Processed groups:", groups);
      console.log("Number of groups found:", groups.length);
      setAssignedGroups(groups);
      
      // 3. Calculate stats by fetching members for each group
      let totalStudents = 0;
      let verifiedCount = 0;
      let pendingCount = 0;
      
      for (const group of groups) {
        console.log(`Fetching members for group ${group.groupId} (${group.groupUsername})`);
        const membersRes = await fetch(`/api/student/group/members?groupId=${group.groupId}`);
        let membersData = await membersRes.json();
        const members = Array.isArray(membersData) ? membersData : (membersData.stdId ? [membersData] : []);
        console.log(`Group ${group.groupUsername} has ${members.length} members`);
        totalStudents += members.length;
        
        if (group.status === 'VERIFIED') verifiedCount++;
        if (group.status === 'PENDING') pendingCount++;
      }
      
      setStats({
        totalGroups: groups.length,
        totalStudents: totalStudents,
        verifiedGroups: verifiedCount,
        pendingGroups: pendingCount
      });
    }
    
  } catch (error) {
    console.error('Error fetching teacher data:', error);
  } finally {
    setLoading(false);
  }
};

  const fetchTeacherSchedule = async () => {
  console.log("=== FETCH TEACHER SCHEDULE START ===");
  setScheduleLoading(true);
  try {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const teacherEmail = storedUser.email;
    console.log("📧 Teacher email from localStorage:", teacherEmail);

    // First get teacher ID
    console.log("🔍 Fetching teacher profile...");
    const teacherRes = await fetch(`/api/teacher/profile?email=${teacherEmail}`);
    console.log("📡 Teacher API response status:", teacherRes.status);
    
    const teacherData = await teacherRes.json();
    console.log("📋 Teacher data received:", teacherData);
    
    const teacherId = teacherData?.teacherId;
    console.log("🆔 Extracted teacherId:", teacherId);

    if (teacherId) {
      console.log("🔍 Fetching schedule for teacherId:", teacherId);
      const scheduleRes = await fetch(`/api/teacher/schedule?teacherId=${teacherId}`);
      console.log("📡 Schedule API response status:", scheduleRes.status);
      
      const scheduleData = await scheduleRes.json();
      console.log("📋 Schedule data received:", scheduleData);
      console.log("📋 Schedule data type:", typeof scheduleData);
      console.log("📋 Is array:", Array.isArray(scheduleData));
      console.log("📋 Schedule length:", scheduleData?.length);
      
      setTeacherSchedule(scheduleData);

      // Set default selected date to first available date
      if (scheduleData && scheduleData.length > 0) {
        console.log("📅 Setting selected date to:", scheduleData[0].dateVal);
        setSelectedDate(scheduleData[0].dateVal);
      } else {
        console.log("⚠️ No schedule data found for teacher");
      }
    } else {
      console.log("❌ No teacherId extracted from teacher data");
    }
  } catch (error) {
    console.error("❌ Error fetching teacher schedule:", error);
  } finally {
    setScheduleLoading(false);
    console.log("=== FETCH TEACHER SCHEDULE END ===");
  }
};

  // Get unique dates from schedule
 // Get unique dates from schedule - FIXED to handle dateVal correctly
const uniqueDates = teacherSchedule.reduce((acc, item) => {
  const dateKey = item.dateVal ? new Date(item.dateVal).toDateString() : '';
  if (dateKey && !acc.some(d => d.dateKey === dateKey)) {
    acc.push({
      dateKey: dateKey,
      date: item.dateVal,
      day: item.day,
      originalDate: item.dateVal
    });
  }
  return acc;
}, [] as { dateKey: string; date: string; day: string; originalDate: string }[]);

// Set default selected date
useEffect(() => {
  if (teacherSchedule.length > 0 && !selectedDate && uniqueDates.length > 0) {
    setSelectedDate(uniqueDates[0].date);
  }
}, [teacherSchedule, uniqueDates, selectedDate]);

  // Group schedule by date
  // Group schedule by date - FIXED to use dateVal
const scheduleByDate = teacherSchedule.reduce(
  (acc, item) => {
    const dateKey = item.dateVal ? new Date(item.dateVal).toDateString() : '';
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(item);
    return acc;
  },
  {} as Record<string, typeof teacherSchedule>
);

// Sort groups by time for each date
Object.keys(scheduleByDate).forEach((dateKey) => {
  scheduleByDate[dateKey].sort(
    (a, b) =>
      new Date(`1970/01/01 ${a.startTime}`).getTime() -
      new Date(`1970/01/01 ${b.startTime}`).getTime()
  );
});

  // Sort groups by time for each date
  Object.keys(scheduleByDate).forEach((date) => {
    scheduleByDate[date].sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    );
  });

  const handleViewGroup = async (group: StudentGroup) => {
    try {
      // Fetch group members
      const membersRes = await fetch(
        `/api/student/group/members?groupId=${group.groupId}`,
      );
      const membersData = await membersRes.json();
      const members = Array.isArray(membersData) ? membersData : [membersData];

      // Fetch project details
      const projectRes = await fetch(
        `/api/student/group/project?groupId=${group.groupId}`,
      );
      const projectData = await projectRes.json();
      const project = Array.isArray(projectData) ? projectData[0] : projectData;

      console.log("Project data in modal:", project);

      setShowGroupModal({
        show: true,
        group: group,
        members: members,
        project: project,
      });
    } catch (error) {
      console.error("Error fetching group details:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  // ============================================
  // UI Components
  // ============================================

  const StatCard = ({ title, value, icon: Icon, bgColor, iconColor }: any) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${bgColor}`}
        >
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  );

  const Sidebar = () => (
    <div
      className={`${sidebarCollapsed ? "w-20" : "w-64"} bg-[#1A237E] h-screen fixed left-0 top-0 transition-all duration-300 z-20`}
    >
      <div className="p-4 border-b border-[#3F51B5]/30">
        <div className="flex items-center justify-between">
          {!sidebarCollapsed && (
            <div>
              <h1 className="text-white font-bold text-lg">FYP Teacher</h1>
              <p className="text-[#9FA8DA] text-xs">Dashboard</p>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-[#9FA8DA] hover:text-white transition-colors"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      <nav className="p-4 space-y-1">
        <button
          onClick={() => setActiveTab("overview")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
            activeTab === "overview"
              ? "bg-[#3F51B5] text-white shadow-lg"
              : "text-[#9FA8DA] hover:bg-white/10 hover:text-white"
          }`}
        >
          <FolderOpen className="w-5 h-5" />
          {!sidebarCollapsed && (
            <span className="text-sm font-medium">Overview</span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("students")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
            activeTab === "students"
              ? "bg-[#3F51B5] text-white shadow-lg"
              : "text-[#9FA8DA] hover:bg-white/10 hover:text-white"
          }`}
        >
          <Users className="w-5 h-5" />
          {!sidebarCollapsed && (
            <span className="text-sm font-medium">Assigned Groups</span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("schedule")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
            activeTab === "schedule"
              ? "bg-[#3F51B5] text-white shadow-lg"
              : "text-[#9FA8DA] hover:bg-white/10 hover:text-white"
          }`}
        >
          <Calendar className="w-5 h-5" />
          {!sidebarCollapsed && (
            <span className="text-sm font-medium">Schedule</span>
          )}
        </button>
      </nav>

      {/* Profile Section in Sidebar */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#3F51B5]/30">
        <div className="mb-3 px-3 py-2 bg-white/10 rounded-lg">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#3F51B5] flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {teacher?.name || "Teacher"}
                </p>
                <p className="text-[#9FA8DA] text-xs truncate">
                  {teacher?.email}
                </p>
              </div>
            </div>
          )}
        </div>

        <Link
          href="/teacher/profile"
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[#9FA8DA] hover:bg-white/10 hover:text-white transition-all duration-200 mb-2"
        >
          <Edit className="w-5 h-5" />
          {!sidebarCollapsed && (
            <span className="text-sm font-medium">Edit Profile</span>
          )}
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[#9FA8DA] hover:bg-red-500/20 hover:text-red-300 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          {!sidebarCollapsed && (
            <span className="text-sm font-medium">Logout</span>
          )}
        </button>
      </div>
    </div>
  );

  // ============================================
  // Overview Tab
  // ============================================
  const OverviewTab = () => {
    if (!teacher) {
      return (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="w-12 h-12 border-4 border-[#3F51B5] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading profile...</p>
        </div>
      );
    }
    return (
      <div className="space-y-6">
        {/* Welcome Card - Using your theme color with better contrast */}
        <div className="bg-blue-500 rounded-xl p-6 shadow-lg">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">
                Welcome back, {teacher.name}!
              </h2>
              <p className="text-blue-100 text-sm">
                Manage your FYP evaluations and assigned groups
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full">
                  <Briefcase className="w-3.5 h-3.5 text-blue-100" />
                  <span className="text-xs text-white font-medium">
                    {teacher.role === "senior"
                      ? "Senior Evaluator"
                      : "Junior Evaluator"}
                  </span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full">
                  <Award className="w-3.5 h-3.5 text-blue-100" />
                  <span className="text-xs text-white font-medium">
                    {teacher.specialization}
                  </span>
                </div>
              </div>
            </div>
            <div className="hidden md:block mt-4 md:mt-0">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards - Fixed with solid backgrounds and white icons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Assigned Groups
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.totalGroups}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Total Students
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.totalStudents}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-600 flex items-center justify-center shadow-sm">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Verified Groups
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.verifiedGroups}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center shadow-sm">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Pending Groups
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.pendingGroups}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center shadow-sm">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Teacher Profile Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800">
              Profile Information
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Your professional details
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Full Name</p>
                  <p className="font-medium text-gray-800">{teacher.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email Address</p>
                  <p className="font-medium text-gray-800">{teacher.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Designation</p>
                  <p className="font-medium text-gray-800">
                    {teacher.designation || 'Not Assigned'}
                  </p>
                </div>
              </div>
              

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Specialization</p>
                  <p className="font-medium text-gray-800">
                    {teacher.specialization}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Award className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Qualification</p>
                  <p className="font-medium text-gray-800">
                    {teacher.qualification}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Experience</p>
                  <p className="font-medium text-gray-800">
                    {teacher.experience} years
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800">
              Quick Actions
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage your profile and view students
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/teacher/profile"
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#3F51B5]/10 flex items-center justify-center group-hover:bg-[#3F51B5]/20 transition-colors">
                  <Edit className="w-5 h-5 text-[#3F51B5]" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-800">Edit Profile</p>
                  <p className="text-sm text-gray-500">
                    Update your password or qualification
                  </p>
                </div>
              </Link>

              <button
                onClick={() => setActiveTab("students")}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 group text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-[#3F51B5]/10 flex items-center justify-center group-hover:bg-[#3F51B5]/20 transition-colors">
                  <Users className="w-5 h-5 text-[#3F51B5]" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">
                    View Assigned Groups
                  </p>
                  <p className="text-sm text-gray-500">
                    See groups assigned for evaluation
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ============================================
  // Teacher Schedule Tab
  // ============================================
  const TeacherScheduleTab = () => {
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [selectedDate, setSelectedDate] = useState<string>("");

  // Format date helper
  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return "Date TBA";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn("Invalid date:", dateString);
      return "Date TBA";
    }

    const day = date.getDate();
    const suffix =
      day % 10 === 1
        ? "st"
        : day % 10 === 2
          ? "nd"
          : day % 10 === 3
            ? "rd"
            : "th";
    return `${day}${suffix} ${date.toLocaleString("default", { month: "long" })} ${date.getFullYear()}`;
  };

  // Get unique dates from schedule using dateVal
  const uniqueDates = teacherSchedule.reduce((acc, item) => {
    if (!item.dateVal) return acc;
    const dateKey = new Date(item.dateVal).toDateString();
    if (!acc.some(d => d.dateKey === dateKey)) {
      acc.push({
        dateKey: dateKey,
        dateVal: item.dateVal,
        day: item.day
      });
    }
    return acc;
  }, [] as { dateKey: string; dateVal: string; day: string }[]);

  // Group schedule by dateKey
  const scheduleByDate = teacherSchedule.reduce(
    (acc, item) => {
      if (!item.dateVal) return acc;
      const dateKey = new Date(item.dateVal).toDateString();
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(item);
      return acc;
    },
    {} as Record<string, typeof teacherSchedule>
  );

  // Sort groups by time for each date
  Object.keys(scheduleByDate).forEach((dateKey) => {
    scheduleByDate[dateKey].sort(
      (a, b) =>
        new Date(`1970/01/01 ${a.startTime}`).getTime() -
        new Date(`1970/01/01 ${b.startTime}`).getTime()
    );
  });

  // Set default selected date when data loads
  useEffect(() => {
    if (teacherSchedule.length > 0 && uniqueDates.length > 0 && !selectedDate) {
      setSelectedDate(uniqueDates[0].dateVal);
    }
  }, [teacherSchedule, uniqueDates, selectedDate]);

  if (scheduleLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#3F51B5] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading schedule...</p>
        </div>
      </div>
    );
  }

  if (teacherSchedule.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          No Schedule Assigned
        </h3>
        <p className="text-gray-500">
          You haven't been assigned to any evaluation schedules yet.
        </p>
        <p className="text-sm text-gray-400 mt-2">
          Schedules will appear here once admin creates them.
        </p>
      </div>
    );
  }

  // Reuse existing handleViewGroup function
  const handleViewGroupSchedule = async (groupId: number) => {
    try {
      const groupRes = await fetch(`/api/student/view-group?groupId=${groupId}`);
      const groupData = await groupRes.json();
      const fullGroup = Array.isArray(groupData) ? groupData[0] : groupData;
      await handleViewGroup(fullGroup);
    } catch (error) {
      console.error("Error fetching group for schedule:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with View Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Evaluation Schedule
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Your assigned groups for evaluation
          </p>
        </div>

        <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode("list")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              viewMode === "list"
                ? "bg-white text-[#3F51B5] shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            List View
          </button>
          <button
            onClick={() => setViewMode("calendar")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              viewMode === "calendar"
                ? "bg-white text-[#3F51B5] shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Calendar View
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-2xl font-bold text-gray-800">{teacherSchedule.length}</p>
          <p className="text-sm text-gray-500">Total Groups</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-2xl font-bold text-gray-800">{uniqueDates.length}</p>
          <p className="text-sm text-gray-500">Evaluation Days</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-2xl font-bold text-gray-800">
            {teacherSchedule.filter((s) => new Date(s.dateVal) > new Date()).length}
          </p>
          <p className="text-sm text-gray-500">Upcoming</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-2xl font-bold text-gray-800">
            {[...new Set(teacherSchedule.map((s) => s.venue))].length}
          </p>
          <p className="text-sm text-gray-500">Venues</p>
        </div>
      </div>

      {/* Date Selector for Quick Navigation */}
      <div className="flex flex-wrap gap-2 pb-2 overflow-x-auto">
        {uniqueDates.map((dateItem, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedDate(dateItem.dateVal)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              selectedDate === dateItem.dateVal
                ? "bg-[#3F51B5] text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {formatDisplayDate(dateItem.dateVal)}
          </button>
        ))}
      </div>

      {/* List View */}
      {viewMode === "list" && (
        <div className="space-y-4">
          {(selectedDate
            ? teacherSchedule.filter(s => s.dateVal === selectedDate)
            : teacherSchedule
          ).map((schedule,idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-5">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium">
                        Group #{idx + 1}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-medium ${
                          new Date(schedule.dateVal) > new Date()
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {new Date(schedule.dateVal) > new Date()
                          ? "Upcoming"
                          : "Completed"}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-800 text-lg">
                      {schedule.groupUsername}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                      {schedule.projectTitle || "No project title"}
                    </p>
                    <div className="flex flex-wrap gap-4 mt-3">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {new Date(`1970/01/01 ${schedule.startTime}`).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })} - 
                          {new Date(`1970/01/01 ${schedule.endTime}`).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{schedule.venue}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{schedule.leaderEmail}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewGroupSchedule(schedule.groupId)}
                      className="px-4 py-2 bg-[#3F51B5] text-white rounded-lg hover:bg-[#5C6BC0] transition-colors text-sm font-medium flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Calendar View */}
      {viewMode === "calendar" && (
        <div className="space-y-6">
          {uniqueDates.map((dateItem, dateIndex) => (
            <div
              key={dateIndex}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-[#1A237E] to-[#3F51B5] px-5 py-3">
                <h3 className="text-white font-semibold">
                  {formatDisplayDate(dateItem.dateVal)} ({dateItem.day})
                </h3>
                <p className="text-indigo-200 text-xs mt-0.5">
                  {scheduleByDate[dateItem.dateKey]?.length || 0} presentations scheduled
                </p>
              </div>

              <div className="divide-y divide-gray-100">
                {scheduleByDate[dateItem.dateKey]?.map((schedule, idx) => (
                  <div
                    key={idx}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-24 text-center">
                        <p className="text-sm font-medium text-gray-700">
                          {new Date(`1970/01/01 ${schedule.startTime}`).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <p className="text-xs text-gray-400">to</p>
                        <p className="text-sm font-medium text-gray-700">
                          {new Date(`1970/01/01 ${schedule.endTime}`).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">
                          {schedule.groupUsername}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {schedule.projectTitle || "No project title"}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                            <MapPin className="w-3 h-3" />
                            {schedule.venue}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                            <Users className="w-3 h-3" />
                            Leader: {schedule.leaderEmail}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleViewGroupSchedule(schedule.groupId)}
                        className="p-2 text-[#3F51B5] hover:bg-[#3F51B5]/10 rounded-lg transition-colors"
                        title="View Group Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

  // Add this to your existing tabs in the return statement
  {
    activeTab === "schedule" && <TeacherScheduleTab />;
  }

  // ============================================
  // Students Tab (Groups List)
  // ============================================
  const StudentsTab = () => (
    <div className="space-y-5">
      {assignedGroups.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No groups assigned yet</p>
            <p className="text-sm text-gray-400">
              Groups will appear here once jury is assigned
            </p>
          </div>
        </div>
      ) : (
        assignedGroups.map((group) => (
          <div
            key={group.groupId}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200"
          >
            <div className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                {/* Group Information */}
                <div className="flex-1">
                  <div className="flex items-center flex-wrap gap-2 mb-2">
                    <h3 className="font-semibold text-gray-800 text-lg">
                      {group.groupUsername}
                    </h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        group.status === "VERIFIED"
                          ? "bg-green-100 text-green-700"
                          : group.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {group.status === "VERIFIED"
                        ? "Verified"
                        : group.status === "PENDING"
                          ? "Pending"
                          : "Denied"}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Leader:</span>{" "}
                      {group.leaderEmail}
                    </p>
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Supervisor:</span>{" "}
                      {group.supervisorEmail}
                    </p>
                  </div>
                </div>

                {/* View Details Button */}
                <button
                  onClick={() => handleViewGroup(group)}
                  className="px-4 py-2 bg-[#3F51B5] text-white rounded-lg hover:bg-[#5C6BC0] transition-colors text-sm font-medium flex items-center gap-2 shadow-sm whitespace-nowrap"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  // ============================================
  // Group Details Modal
  // ============================================
  const GroupDetailsModal = () => {
    const { group, members, project } = showGroupModal;

    if (!group) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
            <div>
              <h3 className="text-xl font-semibold text-gray-800">
                Group Details
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">
                {group.groupUsername}
              </p>
            </div>
            <button
              onClick={() =>
                setShowGroupModal({
                  show: false,
                  group: null,
                  members: [],
                  project: null,
                })
              }
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-6">
            {/* Group Info */}
            <div className="bg-gray-50 rounded-xl p-5">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Group Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Group Username</p>
                  <p className="font-medium text-gray-800">
                    {group.groupUsername}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Leader Email</p>
                  <p className="font-medium text-gray-800 break-all">
                    {group.leaderEmail}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Supervisor</p>
                  <p className="font-medium text-gray-800 break-all">
                    {group.supervisorEmail}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <span
                    className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      group.status === "VERIFIED"
                        ? "bg-green-100 text-green-700"
                        : group.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {group.status === "VERIFIED"
                      ? "Verified"
                      : group.status === "PENDING"
                        ? "Pending"
                        : "Denied"}
                  </span>
                </div>
              </div>
            </div>

            {/* Project Info */}
            <div className="bg-gray-50 rounded-xl p-5">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Project Information
              </h4>
              {project ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Project Title</p>
                    <p className="font-medium text-gray-800">
                      {project.PROJECTTITLE || "Not Submitted"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Domain</p>
                    <p className="font-medium text-gray-800">
                      {project.domains || "Not Selected"}
                    </p>
                  </div>
                  {project.PROPOSALDOCUMENT && (
                    <div>
                      <p className="text-xs text-gray-500">Proposal Document</p>
                      <a
                        href={project.PROPOSALDOCUMENT}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-1 mt-1"
                      >
                        <FileText className="w-4 h-4" />
                        View Proposal
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  No project information available
                </p>
              )}
            </div>

            {/* Members Table */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Group Members
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-left p-3 text-sm font-medium text-gray-600">
                        #
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-gray-600">
                        Name
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-gray-600">
                        Roll No
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-gray-600">
                        Email
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-gray-600">
                        Section
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-gray-600">
                        Batch
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="text-center p-8 text-gray-500"
                        >
                          No members found
                        </td>
                      </tr>
                    ) : (
                      members.map((member, idx) => (
                        <tr
                          key={member.stdId}
                          className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <td className="p-3 text-gray-500">{idx + 1}</td>
                          <td className="p-3 font-medium text-gray-800">
                            {member.name}
                          </td>
                          <td className="p-3 font-mono text-sm text-gray-600">
                            {member.rollNo}
                          </td>
                          <td className="p-3 text-gray-600 break-all">
                            {member.email}
                          </td>
                          <td className="p-3 text-gray-600">
                            {member.section}
                          </td>
                          <td className="p-3 text-gray-600">{member.batch}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-end">
            <button
              onClick={() =>
                setShowGroupModal({
                  show: false,
                  group: null,
                  members: [],
                  project: null,
                })
              }
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

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

      <div
        className={`${sidebarCollapsed ? "ml-20" : "ml-64"} transition-all duration-300`}
      >
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              {activeTab === "overview" && "Dashboard Overview"}
              {activeTab === "students" && "Assigned Groups"}
            </h2>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                <span className="text-sm text-gray-600">
                  {teacher?.role === "senior"
                    ? "Senior Evaluator"
                    : "Junior Evaluator"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          {activeTab === "overview" && <OverviewTab />}
          {activeTab === "students" && <StudentsTab />}
          {activeTab === "schedule" && <TeacherScheduleTab />}
        </div>
      </div>

      {/* Group Details Modal */}
      {showGroupModal.show && <GroupDetailsModal />}
    </div>
  );
}
