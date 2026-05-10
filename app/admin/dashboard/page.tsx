// app/(dashboard)/admin/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  GraduationCap,
  BookOpen,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Search,
  X,
  Save,
  Eye,
  EyeOff,
  LogOut,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Mail,
  Send,
  UserCheck,
  Briefcase,
  Target,
  FileText,
  Calendar,
} from "lucide-react";

interface ModalGroupData extends StudentGroup {
  members: Member[];
  projectDetails?: {
    PROJECTID?: number;
    domains?: string;
    PROJECTTITLE?: string;
    PROPOSALDOCUMENT?: string;
  };
}

interface Member {
  studentId: number;
  name: string;
  email: string;
  rollNo: string;
  section: string;
  batch: number;
}

// Types based on your schema
interface StudentGroup {
  groupId: number;
  groupUsername: string;
  groupPass: string | null;
  leaderEmail: string;
  supervisorEmail: string;
  status: "PENDING" | "VERIFIED" | "DENIED";
  juryId: number;
  members: Member[];
}

interface Student {
  stdId: number;
  name: string;
  email: string;
  rollNum: string;
  section: string;
  batch: number;
  groupId: number;
  status: "PENDING" | "ACTIVE";
}

interface Department {
  deptId: number;
  name: string;
}

interface Teacher {
  TeacherId: number;
  name: string;
  email: string;
  deptId: number;
  specialization: string;
}

type TabType = "pending" | "verified" | "departments" | "teachers" | "students";
interface StudentGroup {
  groupId: number;
  groupUsername: string;
  // ... other properties
}

// ============================================
// MODAL COMPONENTS (OUTSIDE THE MAIN COMPONENT)
// ============================================

// Department Modal - This is OUTSIDE AdminDashboard
interface DepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
}

const DepartmentModalComponent = ({
  isOpen,
  onClose,
  onSave,
}: DepartmentModalProps) => {
  const [name, setName] = useState("");

  useEffect(() => {
    if (isOpen) {
      setName("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Add Department</h3>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Department Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg"
            placeholder="e.g., Computer Science"
            autoFocus
          />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(name)}
            className="px-4 py-2 bg-[#3F51B5] text-white rounded-lg"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

// Teacher Modal - This is OUTSIDE AdminDashboard
interface TeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (teacher: any) => void;
  departments: any[];
}

const TeacherModalComponent = ({
  isOpen,
  onClose,
  onSave,
  departments,
}: TeacherModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    specialization: "",
    qualification: "",
    experience: "",
    role: "junior",
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
        email: "",
        department: "",
        specialization: "",
        qualification: "",
        experience: "",
        role: "junior",
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Add Teacher</h3>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-lg"
              autoFocus
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department *
            </label>
            <select
              value={formData.department}
              onChange={(e) =>
                setFormData({ ...formData, department: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-lg"
            >
              <option value="">Select</option>
              {departments.map((dept) => (
                <option key={dept.deptId} value={dept.name}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Specialization *
            </label>
            <input
              type="text"
              value={formData.specialization}
              onChange={(e) =>
                setFormData({ ...formData, specialization: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Qualification *
            </label>
            <input
              type="text"
              value={formData.qualification}
              onChange={(e) =>
                setFormData({ ...formData, qualification: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Experience (years) *
            </label>
            <input
              type="number"
              value={formData.experience}
              onChange={(e) =>
                setFormData({ ...formData, experience: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role *
            </label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-lg"
            >
              <option value="junior">Junior</option>
              <option value="senior">Senior</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            className="px-4 py-2 bg-[#3F51B5] text-white rounded-lg"
          >
            Add Teacher
          </button>
        </div>
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabType>("pending");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scheduling, setScheduling] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDates, setScheduleDates] = useState({
    startDate: "",
    endDate: "",
  });

  // Data states
  const [pendingGroups, setPendingGroups] = useState<StudentGroup[]>([]);
  const [verifiedGroups, setVerifiedGroups] = useState<StudentGroup[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  // Modal states
  const [showGroupModal, setShowGroupModal] = useState<{
    show: boolean;
    group: ModalGroupData | null;
  }>({
    show: false,
    group: null,
  });
  const [rejectModal, setRejectModal] = useState<{
    show: boolean;
    groupId: number | null;
    reason: string;
  }>({
    show: false,
    groupId: null,
    reason: "",
  });
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [showCredentials, setShowCredentials] = useState<{
    show: boolean;
    group: StudentGroup | null;
    password: string;
  }>({ show: false, group: null, password: "" });

  // Form states
  const [departmentForm, setDepartmentForm] = useState({ name: "" });
  const [teacherForm, setTeacherForm] = useState({
    name: "",
    email: "",
    department: "",
    specialization: "",
    qualification: "",
    experience: "",
    role: "junior",
  });

  // Search
  const [searchTerm, setSearchTerm] = useState("");

  // Stats
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalDepartments: 0,
    pendingGroups: 0,
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== "ADMIN") {
      router.push("/login");
      return;
    }
    setUser(parsedUser);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch pending groups (where status = 'PENDING')
      const pendingRes = await fetch("/api/admin/groups?status=PENDING");
      const pendingData = await pendingRes.json();
      console.log("Groups fetched: ", pendingData);
      setPendingGroups(pendingData);

      // Fetch verified groups
      const verifiedRes = await fetch("/api/admin/groups?status=VERIFIED");
      const verifiedData = await verifiedRes.json();
      setVerifiedGroups(verifiedData);

      // Fetch departments
      const deptRes = await fetch("/api/admin/departments");
      const deptData = await deptRes.json();
      setDepartments(deptData);

      // Fetch teachers
      const teacherRes = await fetch("/api/admin/teachers");
      const teacherData = await teacherRes.json();
      setTeachers(teacherData);

      // Fetch students and extract roll number from email
      const studentRes = await fetch("/api/admin/students");
      let studentData = await studentRes.json();

      // ✅ Process each student with safety check
      if (Array.isArray(studentData)) {
        studentData = studentData.map((student: any) => {
          // ✅ Check if email exists before calling match
          const email = student?.email || "";
          let rollNumber = "";

          if (email && typeof email === "string") {
            const match = email.match(/k(\d{2})(\d{4})@/);
            if (match) {
              const firstTwo = match[1]; // e.g., "24"
              const lastFour = match[2]; // e.g., "3094"
              rollNumber = `${firstTwo}k-${lastFour}`; // e.g., "24k-3094"
            }
          }

          return {
            ...student,
            rollNum: rollNumber,
          };
        });
      }

      setStudents(studentData);

      // ✅ Safely calculate stats
      setStats({
        totalStudents: Array.isArray(studentData) ? studentData.length : 0,
        totalTeachers: Array.isArray(teacherData) ? teacherData.length : 0,
        totalDepartments: Array.isArray(deptData) ? deptData.length : 0,
        pendingGroups: Array.isArray(pendingData) ? pendingData.length : 0,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Approve Group - Generate password and send email
  const handleApproveGroup = async (group: StudentGroup) => {
    // Generate random password
    const generatedPassword = generateRandomPassword();

    try {
      const response = await fetch("/api/admin/approve-group", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId: group.groupId,
          password: generatedPassword,
        }),
      });

      if (response.ok) {
        // Show credentials modal
        setShowCredentials({ show: true, group, password: generatedPassword });
        fetchDashboardData(); // Refresh data
      }
    } catch (error) {
      console.error("Error approving group:", error);
    }
  };

  const handleRejectGroup = (groupId: number) => {
    setRejectModal({ show: true, groupId, reason: "" });
  };

  const handleConfirmRejection = async () => {
    const { groupId, reason } = rejectModal;

    if (!groupId) return;

    // Validate reason
    if (!reason.trim()) {
      alert("Please enter a reason for rejection.");
      return;
    }

    try {
      const response = await fetch("/api/admin/reject-group", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId, reason: reason.trim() }),
      });

      if (response.ok) {
        setRejectModal({ show: false, groupId: null, reason: "" });
        fetchDashboardData();
        alert(
          "Group rejected successfully. Notification email sent to leader.",
        );
      } else {
        const data = await response.json();
        alert(data.message || "Failed to reject group");
      }
    } catch (error) {
      console.error("Error rejecting group:", error);
      alert("Network error. Please try again.");
    }
  };

  const handleCancelRejection = () => {
    setRejectModal({ show: false, groupId: null, reason: "" });
  };

  // Generate random password
  const generateRandomPassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let password = "";
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  // View Group Members
  const handleViewGroup = async (group: StudentGroup) => {
    try {
      // Fetch members
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
      const rawProject = Array.isArray(projectData)
        ? projectData[0]
        : projectData;

      // Map the project data to a consistent format
      // ✅ Use undefined instead of null
      const projectDetails = rawProject
        ? {
            PROJECTID: rawProject.PROJECTID || rawProject.projectId,
            domains:
              rawProject.DOMAIN || rawProject.domains || rawProject.DOMAINS,
            PROJECTTITLE: rawProject.PROJECTTITLE || rawProject.projectTitle,
            PROPOSALDOCUMENT:
              rawProject.PROPOSALDOCUMENT || rawProject.proposalDocument,
          }
        : undefined;

      console.log("Project details mapped:", projectDetails);

      // Combine group data with members and project details
      const fullGroupData = {
        ...group,
        members: members,
        projectDetails: projectDetails,
      };

      console.log("Full group data:", fullGroupData);
      setShowGroupModal({ show: true, group: fullGroupData });
    } catch (error) {
      console.error("Error fetching group details:", error);
    }
  };

  const handleAssignJury = async (groupId: number) => {
    try {
      const response = await fetch("/api/admin/assign-jury", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(
          `Jury assigned!\nSenior: ${data.data.seniorTeacher}\nJunior: ${data.data.juniorTeacher}`,
        );
        fetchDashboardData(); // Refresh the list
      } else {
        alert(data.message || "Failed to assign jury");
      }
    } catch (error) {
      console.error("Error assigning jury:", error);
      alert("Network error");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  const handleAddTeacher = async (teacherData: any) => {
    try {
      const response = await fetch("/api/admin/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(teacherData),
      });

      if (response.ok) {
        // Refresh the teachers list
        fetchDashboardData();
        // Close the modal
        setShowTeacherModal(false);
      } else {
        const error = await response.json();
        console.error("Error adding teacher:", error);
        // Optionally show error message to user
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };

  // Add this state to your admin dashboard component

  // Updated handleAutoSchedule - now receives dates as parameters
  const handleAutoSchedule = async (startDate: string, endDate: string) => {
    setScheduling(true);
    try {
      const response = await fetch("/api/admin/auto-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: startDate,
          endDate: endDate,
          startTime: "08:00:00",
        endTime: "16:00:00",
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(
          `✅ Scheduling Complete!\n\nScheduled: ${data.summary?.assignedCount || 0}\nFailed: ${data.summary?.unassignedCount || 0}`,
        );
        fetchDashboardData();
        setShowScheduleModal(false);
        setScheduleDates({ startDate: "", endDate: "" });
      } else {
        alert("Scheduling failed: " + data.message);
      }
    } catch (error) {
      console.error("Scheduling error:", error);
      alert("Network error during scheduling");
    } finally {
      setScheduling(false);
    }
  };

  // Open modal
  const openScheduleModal = () => {
    setShowScheduleModal(true);
  };

  // Close modal
  const closeScheduleModal = () => {
    setShowScheduleModal(false);
    setScheduleDates({ startDate: "", endDate: "" });
  };

  // ============================================
  // UI Components
  // ============================================

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
        <div
          className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}
        >
          <Icon className="w-6 h-6 text-white" />
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
              <h1 className="text-white font-bold text-lg">FYP Admin</h1>
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

      <nav className="p-4 space-y-2">
        <button
          onClick={() => setActiveTab("pending")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
            activeTab === "pending"
              ? "bg-[#3F51B5] text-white"
              : "text-[#9FA8DA] hover:bg-[#3F51B5]/20"
          }`}
        >
          <AlertCircle className="w-5 h-5" />
          {!sidebarCollapsed && <span>Pending Groups</span>}
          {!sidebarCollapsed && stats.pendingGroups > 0 && (
            <span className="ml-auto bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
              {stats.pendingGroups}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("verified")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
            activeTab === "verified"
              ? "bg-[#3F51B5] text-white"
              : "text-[#9FA8DA] hover:bg-[#3F51B5]/20"
          }`}
        >
          <CheckCircle className="w-5 h-5" />
          {!sidebarCollapsed && <span>Verified Groups</span>}
        </button>

        <button
          onClick={() => setActiveTab("departments")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
            activeTab === "departments"
              ? "bg-[#3F51B5] text-white"
              : "text-[#9FA8DA] hover:bg-[#3F51B5]/20"
          }`}
        >
          <BookOpen className="w-5 h-5" />
          {!sidebarCollapsed && <span>Departments</span>}
        </button>

        <button
          onClick={() => setActiveTab("teachers")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
            activeTab === "teachers"
              ? "bg-[#3F51B5] text-white"
              : "text-[#9FA8DA] hover:bg-[#3F51B5]/20"
          }`}
        >
          <Users className="w-5 h-5" />
          {!sidebarCollapsed && <span>Teachers</span>}
        </button>

        <button
          onClick={() => setActiveTab("students")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
            activeTab === "students"
              ? "bg-[#3F51B5] text-white"
              : "text-[#9FA8DA] hover:bg-[#3F51B5]/20"
          }`}
        >
          <GraduationCap className="w-5 h-5" />
          {!sidebarCollapsed && <span>Students</span>}
        </button>
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#3F51B5]/30">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[#9FA8DA] hover:bg-red-500/20 hover:text-red-300 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          {!sidebarCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  // ============================================
  // Students Tab
  // ============================================
  // ============================================
  // Verified Groups Tab
  // ============================================
  const VerifiedGroupsTab = () => (
  <div className="space-y-4">
    {verifiedGroups.length === 0 ? (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-800">
          No Verified Groups
        </h3>
        <p className="text-gray-500">No groups have been verified yet.</p>
      </div>
    ) : (
      verifiedGroups.map((group) => (
        <div
          key={group.groupId}
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
        >
          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              {/* Left side - Group Info */}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 text-lg">
                  {group.groupUsername}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Leader: {group.leaderEmail}
                </p>
                <p className="text-sm text-gray-500">
                  Supervisor: {group.supervisorEmail}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Verified
                  </p>
                  {/* Show jury status */}
                  {group.juryId ? (
                    <p className="text-sm text-purple-600 flex items-center gap-1">
                      <UserCheck className="w-4 h-4" />
                      Jury Assigned
                    </p>
                  ) : (
                    <p className="text-sm text-orange-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      Pending Jury
                    </p>
                  )}
                </div>
              </div>

              {/* Right side - Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleViewGroup(group)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium shadow-sm"
                >
                  View Details
                </button>
                
                {/* ✅ Only show Assign Jury button if no jury is assigned */}
                {!group.juryId && (
                  <button
                    onClick={() => handleAssignJury(group.groupId)}
                    style={{ backgroundColor: "#da627d" }}
                    className="px-4 py-2 bg-rose-400 text-white rounded-lg hover:bg-rose-500 transition-colors text-sm font-medium flex items-center gap-2 shadow-sm"
                  >
                    <UserCheck className="w-4 h-4" />
                    Assign Jury
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))
    )}
  </div>
);

  // ============================================
  // Departments Tab
  // ============================================
  const DepartmentsTab = () => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left p-4 font-medium text-gray-600">ID</th>
            <th className="text-left p-4 font-medium text-gray-600">
              Department Name
            </th>
            <th className="text-left p-4 font-medium text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {departments.length === 0 ? (
            <tr>
              <td colSpan={3} className="text-center p-8 text-gray-500">
                No departments found. Click "Add Department" to create one.
              </td>
            </tr>
          ) : (
            departments.map((dept) => (
              <tr
                key={dept.deptId}
                className="border-t border-gray-100 hover:bg-gray-50"
              >
                <td className="p-4">{dept.deptId}</td>
                <td className="p-4 font-medium">{dept.name}</td>
                <td className="p-4">
                  <button
                    onClick={() => deleteDepartment(dept.deptId)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  // ============================================
  // Teachers Tab
  // ============================================
  const TeachersTab = () => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left p-4 font-medium text-gray-600">ID</th>
            <th className="text-left p-4 font-medium text-gray-600">Name</th>
            <th className="text-left p-4 font-medium text-gray-600">Email</th>
            <th className="text-left p-4 font-medium text-gray-600">
              Department
            </th>
            <th className="text-left p-4 font-medium text-gray-600">
              Specialization
            </th>
          </tr>
        </thead>
        <tbody>
          {teachers.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center p-8 text-gray-500">
                No teachers found. Click "Add Teacher" to create one.
              </td>
            </tr>
          ) : (
            teachers.map((teacher) => (
              <tr
                key={teacher.TeacherId}
                className="border-t border-gray-100 hover:bg-gray-50"
              >
                <td className="p-4">{teacher.TeacherId}</td>
                <td className="p-4 font-medium">{teacher.name}</td>
                <td className="p-4 text-gray-500">{teacher.email}</td>
                <td className="p-4">
                  {departments.map((dept) => {
                    return dept.deptId === teacher.deptId ? dept.name : "";
                  })}
                </td>
                <td className="p-4">{teacher.specialization}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  // ============================================
  // Students Tab
  // ============================================
  const StudentsTab = () => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left p-4 font-medium text-gray-600">ID</th>
            <th className="text-left p-4 font-medium text-gray-600">Name</th>
            <th className="text-left p-4 font-medium text-gray-600">Roll No</th>
            <th className="text-left p-4 font-medium text-gray-600">Email</th>
            <th className="text-left p-4 font-medium text-gray-600">Section</th>
            <th className="text-left p-4 font-medium text-gray-600">Batch</th>
          </tr>
        </thead>
        <tbody>
          {students.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center p-8 text-gray-500">
                No students found.
              </td>
            </tr>
          ) : (
            students.map((student) => (
              <tr
                key={student.stdId}
                className="border-t border-gray-100 hover:bg-gray-50"
              >
                <td className="p-4">{student.stdId}</td>
                <td className="p-4 font-medium">{student.name}</td>
                <td className="p-4">{student.rollNum}</td>
                <td className="p-4 text-gray-500">{student.email}</td>
                <td className="p-4">{student.section}</td>
                <td className="p-4">{student.batch}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  // ============================================
  // Add Department Handler
  // ============================================
 // ✅ CORRECT - Accept the name parameter from the modal
const handleAddDepartment = async (deptName: string) => {
  console.log("Adding department with name:", deptName);
  
  if (!deptName || deptName.trim() === "") {
    alert("Department name cannot be empty");
    return;
  }
  
  try {
    const response = await fetch("/api/admin/departments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: deptName.trim() }),
    });

    if (response.ok) {
      fetchDashboardData();
      setShowDepartmentModal(false);
      setDepartmentForm({ name: "" });
    } else {
      const data = await response.json();
      alert(data.message || "Failed to add department");
    }
  } catch (error) {
    console.error("Error adding department:", error);
    alert("Network error");
  }
};

  const deleteDepartment = async (id: Number) => {
    try {
      const response = await fetch("/api/admin/departments/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deptId: id }),
      });
      if (response.ok) {
        fetchDashboardData();
        console.log("Department deleted");
      }
    } catch (error) {
      console.error("Error deleting department: ", error);
    }
  };

  // ============================================
  // Pending Groups Tab
  // ============================================
  const PendingGroupsTab = () => (
    <div className="space-y-4">
      {pendingGroups.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-800">
            No Pending Groups
          </h3>
          <p className="text-gray-500">All groups have been reviewed.</p>
        </div>
      ) : (
        pendingGroups.map((group) => (
          <div
            key={group.groupId}
            className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-800 text-lg">
                    {group.groupUsername}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Leader: {group.leaderEmail}
                  </p>
                  <p className="text-sm text-gray-500">
                    Supervisor: {group.supervisorEmail}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewGroup(group)}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleApproveGroup(group)}
                    className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-1"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleRejectGroup(group.groupId)}
                    className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center gap-1"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  // ============================================
  // Modern Rejection Modal
  // ============================================
  const RejectionModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-4 h-4 text-red-600" />
            </div>
            <h3 className="text-md font-semibold text-gray-800">
              Reject Group
            </h3>
          </div>
          <button
            onClick={handleCancelRejection}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {/* Warning Banner */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-xs text-red-700">
              ⚠️ This action cannot be undone. The group leader will be notified
              via email.
            </p>
          </div>

          {/* Reason Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Rejection *
            </label>
            <input
              value={rejectModal.reason}
              onChange={(e) =>
                setRejectModal((prev) => ({ ...prev, reason: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none text-gray-700"
              placeholder="Please provide a clear reason for rejection..."
              autoFocus
              dir="ltr"
            />
            <p className="text-xs text-gray-500 mt-1">
              This reason will be sent to the group leader's email.
            </p>
          </div>

          {/* Quick Suggestions */}
          <div>
            <p className="text-xs text-gray-500 mb-2">Quick suggestions:</p>
            <div className="flex flex-wrap gap-2">
              {[
                "Insufficient group members",
                "Invalid email format",
                "Project domain mismatch",
                "Incomplete application",
                "Supervisor not available",
                "Duplicate registration",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() =>
                    setRejectModal((prev) => ({ ...prev, reason: suggestion }))
                  }
                  className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-4 border-t border-gray-100 flex justify-end gap-2">
          <button
            onClick={handleCancelRejection}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmRejection}
            disabled={!rejectModal.reason.trim()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <XCircle className="w-3.5 h-3.5" />
            Confirm Rejection
          </button>
        </div>
      </div>
    </div>
  );

  // ============================================
  // View Group Modal
  // ============================================
  const ViewGroupModal = () => {
    const groupData = showGroupModal.group;

    if (!groupData) return null;

    // Get project details from the combined data
    const project = groupData.projectDetails;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">
                Group Details
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Complete information about the group and its members
              </p>
            </div>
            <button
              onClick={() => setShowGroupModal({ show: false, group: null })}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="px-8 py-8 space-y-8">
            {/* Group Information Section */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-800">
                    Group Information
                  </h4>
                  <p className="text-sm text-gray-500">
                    Basic group details and project information
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 rounded-2xl p-6">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Group Username
                  </p>
                  <p className="text-base font-semibold text-gray-900">
                    {groupData.groupUsername}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Leader Email
                  </p>
                  <p className="text-base text-gray-800 break-all">
                    {groupData.leaderEmail}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Supervisor
                  </p>
                  <p className="text-base text-gray-800">
                    {groupData.supervisorEmail || "Not Assigned"}
                  </p>
                </div>
              </div>
            </div>

            {/* Project Details Section - Using fetched project data */}
            {/* Project Details Section */}
            {groupData.projectDetails && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">
                      Project Details
                    </h4>
                    <p className="text-sm text-gray-500">
                      Project information and domains
                    </p>
                  </div>
                </div>

                <div className="space-y-6 bg-gray-50 rounded-2xl p-6">
                  <div className="grid grid-cols-1 gap-4">
                    {/* Project Title */}
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Project Title
                      </p>
                      <p className="text-base font-semibold text-gray-900">
                        {groupData.projectDetails.PROJECTTITLE ||
                          "Not Submitted"}
                      </p>
                    </div>

                    {/* Domains */}
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Domains
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {groupData.projectDetails.domains ? (
                          groupData.projectDetails.domains
                            .split(",")
                            .map((domain: string, idx: number) => (
                              <span
                                key={idx}
                                className="px-3 py-1.5 bg-white rounded-lg text-sm text-gray-600 shadow-sm border border-gray-200"
                              >
                                {domain.trim()}
                              </span>
                            ))
                        ) : (
                          <p className="text-gray-600">No domains selected</p>
                        )}
                      </div>
                    </div>

                    {/* Proposal Document */}
                    {groupData.projectDetails.PROPOSALDOCUMENT && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Proposal Document
                        </p>
                        <a
                          href={groupData.projectDetails.PROPOSALDOCUMENT}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-1"
                        >
                          <FileText className="w-4 h-4" />
                          View Proposal
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Status Section */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-800">
                    Status
                  </h4>
                  <p className="text-sm text-gray-500">
                    Current verification status
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        groupData.status === "VERIFIED"
                          ? "bg-green-500"
                          : groupData.status === "PENDING"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                    ></div>
                    <span
                      className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
                        groupData.status === "VERIFIED"
                          ? "bg-green-100 text-green-700"
                          : groupData.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {groupData.status === "VERIFIED"
                        ? "VERIFIED"
                        : groupData.status === "PENDING"
                          ? "PENDING APPROVAL"
                          : "DENIED"}
                    </span>
                  </div>
                  {groupData.juryId && (
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-purple-500" />
                      <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                        JURY ASSIGNED
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Members Section */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-800">
                    Group Members
                  </h4>
                  <p className="text-sm text-gray-500">
                    Team members with their details
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                          #
                        </th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                          Full Name
                        </th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                          Email
                        </th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                          Section
                        </th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                          Batch
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupData.members && groupData.members.length > 0 ? (
                        groupData.members.map((member: any, idx: number) => (
                          <tr
                            key={idx}
                            className="border-t border-gray-200 hover:bg-white transition-colors"
                          >
                            <td className="px-6 py-4 text-gray-500 font-medium">
                              {idx + 1}
                            </td>
                            <td className="px-6 py-4 font-semibold text-gray-800">
                              {member.name}
                            </td>
                            <td className="px-6 py-4 text-gray-600 break-all">
                              {member.email}
                            </td>
                            <td className="px-6 py-4 text-gray-600">
                              {member.section || "-"}
                            </td>
                            <td className="px-6 py-4 text-gray-600">
                              {member.batch || "-"}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="text-center py-16">
                            <div className="flex flex-col items-center gap-3">
                              <div className="w-16 h-16 bg-gray-200 rounded-2xl flex items-center justify-center">
                                <Users className="w-8 h-8 text-gray-400" />
                              </div>
                              <p className="text-gray-500 font-medium">
                                No members found
                              </p>
                              <p className="text-sm text-gray-400">
                                This group has no members assigned
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-8 py-6 flex justify-end gap-4">
            <button
              onClick={() => setShowGroupModal({ show: false, group: null })}
              className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm font-semibold"
            >
              Close
            </button>
            {groupData.status === "PENDING" && (
              <div className="flex gap-3">
                <button
                  onClick={() => handleApproveGroup(groupData)}
                  className="px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors text-sm font-semibold flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve Group
                </button>
                <button
                  onClick={() => handleRejectGroup(groupData.groupId)}
                  className="px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors text-sm font-semibold flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Reject Group
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Schedule Date Selection Modal
  const ScheduleDateModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Calendar className="w-4 h-4 text-green-600" />
            </div>
            <h3 className="text-md font-semibold text-gray-800">
              Schedule Evaluation
            </h3>
          </div>
          <button
            onClick={closeScheduleModal}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-700">
              📅 Select the date range for the evaluation schedule. All verified
              groups will be automatically assigned to available time slots and
              venues.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={scheduleDates.startDate}
              onChange={(e) =>
                setScheduleDates((prev) => ({
                  ...prev,
                  startDate: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              min={new Date().toISOString().split("T")[0]}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={scheduleDates.endDate}
              onChange={(e) =>
                setScheduleDates((prev) => ({
                  ...prev,
                  endDate: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              min={
                scheduleDates.startDate ||
                new Date().toISOString().split("T")[0]
              }
              required
            />
          </div>

          {/* Date range summary */}
          {scheduleDates.startDate && scheduleDates.endDate && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600">
                📊 <span className="font-medium">Range Summary:</span>
                <br />
                From: {new Date(scheduleDates.startDate).toLocaleDateString()}
                <br />
                To: {new Date(scheduleDates.endDate).toLocaleDateString()}
                <br />
                Duration:{" "}
                {Math.ceil(
                  (new Date(scheduleDates.endDate).getTime() -
                    new Date(scheduleDates.startDate).getTime()) /
                    (1000 * 60 * 60 * 24),
                ) + 1}{" "}
                days
              </p>
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-700">
              ⚠️ <span className="font-medium">Note:</span>
              <br />
              • This will schedule all verified groups without existing
              schedules
              <br />
              • Time slots: 8:00 AM - 4:00 PM (50 min each)
              <br />• Conflicts will be automatically handled
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-4 border-t border-gray-100 flex justify-end gap-2">
          <button
            onClick={closeScheduleModal}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() =>
              handleAutoSchedule(scheduleDates.startDate, scheduleDates.endDate)
            }
            disabled={
              !scheduleDates.startDate || !scheduleDates.endDate || scheduling
            }
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {scheduling ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Scheduling...</span>
              </>
            ) : (
              <>
                <Calendar className="w-4 h-4" />
                <span>Create Schedule</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  // ============================================
  // Credentials Modal
  // ============================================
  const CredentialsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Group Credentials</h3>
          <button
            onClick={() =>
              setShowCredentials({ show: false, group: null, password: "" })
            }
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <p className="text-green-800 text-sm flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Credentials have been sent to {showCredentials.group?.leaderEmail}
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Group Username
            </label>
            <input
              type="text"
              value={showCredentials.group?.groupUsername || ""}
              readOnly
              className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="text"
                value={showCredentials.password}
                readOnly
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 font-mono"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Please share these credentials with the group leader.
            </p>
          </div>
        </div>

        <button
          onClick={() =>
            setShowCredentials({ show: false, group: null, password: "" })
          }
          className="w-full mt-6 px-4 py-2 bg-[#3F51B5] text-white rounded-lg hover:bg-[#5C6BC0]"
        >
          Close
        </button>
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

      <div
        className={`${sidebarCollapsed ? "ml-20" : "ml-64"} transition-all duration-300`}
      >
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              {activeTab === "pending" && "Pending Groups"}
              {activeTab === "verified" && "Verified Groups"}
              {activeTab === "departments" && "Departments"}
              {activeTab === "teachers" && "Teachers"}
              {activeTab === "students" && "Students"}
            </h2>

            {/* Add buttons for departments and teachers */}
            {(activeTab === "departments" || activeTab === "teachers") && (
              <button
                onClick={() =>
                  activeTab === "departments"
                    ? setShowDepartmentModal(true)
                    : setShowTeacherModal(true)
                }
                className="bg-[#3F51B5] hover:bg-[#5C6BC0] text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add {activeTab === "departments" ? "Department" : "Teacher"}
              </button>
            )}
            {activeTab === "verified" && (
              <button
                onClick={openScheduleModal}
                disabled={scheduling}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                {scheduling ? "Scheduling..." : "Create Schedule"}
              </button>
            )}

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3F51B5] w-64"
              />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard
              title="Total Students"
              value={stats.totalStudents}
              icon={GraduationCap}
              color="bg-blue-500"
            />
            <StatCard
              title="Total Teachers"
              value={stats.totalTeachers}
              icon={Users}
              color="bg-green-500"
            />
            <StatCard
              title="Departments"
              value={stats.totalDepartments}
              icon={BookOpen}
              color="bg-purple-500"
            />
            <StatCard
              title="Pending Groups"
              value={stats.pendingGroups}
              icon={AlertCircle}
              color="bg-orange-500"
            />
          </div>

          {/* Main Content - ALL TABS */}
          {activeTab === "pending" && <PendingGroupsTab />}
          {activeTab === "verified" && <VerifiedGroupsTab />}
          {activeTab === "departments" && <DepartmentsTab />}
          {activeTab === "teachers" && <TeachersTab />}
          {activeTab === "students" && <StudentsTab />}
        </div>
      </div>

      {/* Modals */}
      {showDepartmentModal && (
        <DepartmentModalComponent
          isOpen={showDepartmentModal}
          onClose={() => setShowDepartmentModal(false)}
          onSave={handleAddDepartment}
        />
      )}
      {showTeacherModal && (
        <TeacherModalComponent
          isOpen={showTeacherModal}
          onClose={() => setShowTeacherModal(false)}
          onSave={handleAddTeacher}
          departments={departments}
        />
      )}
      {showCredentials.show && <CredentialsModal />}
      {/* View Group Modal */}
      {showGroupModal.show && <ViewGroupModal />}
      {rejectModal.show && <RejectionModal />}
      {showScheduleModal && <ScheduleDateModal />}
    </div>
  );
}
