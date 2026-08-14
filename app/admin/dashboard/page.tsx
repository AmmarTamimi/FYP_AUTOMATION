// app/(dashboard)/admin/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  GraduationCap,
  BookOpen,
  Plus,
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
  UserCheck,
  FileText,
  Calendar,
  Lock,
  Shield,
  Settings,
  Bell,
  LayoutGrid,
  User,
  ClipboardList,
  Building2,
} from "lucide-react";
import AssignJuryModal from "@/app/components/AssignJuryModel";

/* ============================================================
   TYPES
   ============================================================ */

interface Member {
  studentId: number;
  name: string;
  email: string;
  rollNo: string;
  section: string;
  batch: number;
}

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

interface ModalGroupData extends StudentGroup {
  members: Member[];
  projectDetails?: {
    PROJECTID?: number;
    domains?: string;
    PROJECTTITLE?: string;
    PROPOSALDOCUMENT?: string;
  };
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
  designation: string;
  specialization: string;
}

type TabType =
  | "pending"
  | "verified"
  | "students"
  | "departments"
  | "teachers"
  | "profile"
  | "settings";

/* ============================================================
   SHARED UI PRIMITIVES  (module scope = no remount on re-render)
   ============================================================ */

const Card = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_2px_rgba(16,24,40,0.04)] ${className}`}
  >
    {children}
  </div>
);

const SectionHeader = ({
  title,
  subtitle,
  icon: Icon,
  action,
}: {
  title: string;
  subtitle?: string;
  icon?: any;
  action?: React.ReactNode;
}) => (
  <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-slate-100">
    <div className="flex items-center gap-3">
      {Icon && (
        <span className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <Icon className="w-[18px] h-[18px]" />
        </span>
      )}
      <div>
        <h3 className="text-[15px] font-semibold text-slate-900">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {action}
  </div>
);

const Badge = ({
  children,
  tone = "slate",
}: {
  children: React.ReactNode;
  tone?: "slate" | "indigo" | "green" | "amber" | "rose" | "violet";
}) => {
  const tones: Record<string, string> = {
    slate: "bg-slate-100 text-slate-600",
    indigo: "bg-indigo-50 text-indigo-600",
    green: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
    violet: "bg-violet-50 text-violet-600",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
};

const btnPrimary =
  "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 active:bg-indigo-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
const btnGhost =
  "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50";
const btnGreen =
  "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
const btnRose =
  "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-rose-600 text-white text-sm font-medium hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
const inputBase =
  "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition";
const labelBase = "block text-[13px] font-medium text-slate-700 mb-1.5";
const th = "text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500";
const td = "px-5 py-3.5 text-sm text-slate-700";

const EmptyState = ({
  icon: Icon,
  title,
  message,
}: {
  icon: any;
  title: string;
  message: string;
}) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
      <Icon className="w-6 h-6 text-slate-400" />
    </div>
    <h3 className="text-[15px] font-semibold text-slate-800">{title}</h3>
    <p className="text-sm text-slate-500 mt-1 max-w-sm">{message}</p>
  </div>
);

/* ---------- Modal shell ---------- */
const ModalShell = ({
  title,
  subtitle,
  icon: Icon,
  tone = "indigo",
  onClose,
  children,
  footer,
  size = "md",
}: {
  title: string;
  subtitle?: string;
  icon?: any;
  tone?: "indigo" | "green" | "rose";
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "md" | "lg" | "xl";
}) => {
  const tones: Record<string, string> = {
    indigo: "bg-indigo-50 text-indigo-600",
    green: "bg-emerald-50 text-emerald-600",
    rose: "bg-rose-50 text-rose-600",
  };
  const sizes: Record<string, string> = {
    md: "max-w-md",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div
        className={`w-full ${sizes[size]} bg-white rounded-2xl shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col overflow-hidden`}
      >
        <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            {Icon && (
              <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${tones[tone]}`}>
                <Icon className="w-[18px] h-[18px]" />
              </span>
            )}
            <div>
              <h3 className="text-base font-semibold text-slate-900">{title}</h3>
              {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

/* ============================================================
   ADD DEPARTMENT MODAL
   ============================================================ */

const DepartmentModalComponent = ({
  isOpen,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
}) => {
  const [name, setName] = useState("");

  useEffect(() => {
    if (isOpen) setName("");
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <ModalShell
      title="Add Department"
      subtitle="Create a new academic department"
      icon={Building2}
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose} className={btnGhost}>
            Cancel
          </button>
          <button onClick={() => onSave(name)} className={btnPrimary}>
            <Plus className="w-4 h-4" />
            Add Department
          </button>
        </>
      }
    >
      <label className={labelBase}>Department Name</label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className={inputBase}
        placeholder="e.g., Computer Science"
        autoFocus
      />
      <p className="text-xs text-slate-400 mt-2">
        This name will appear when assigning teachers and juries.
      </p>
    </ModalShell>
  );
};

/* ============================================================
   ADD TEACHER MODAL
   ============================================================ */

const TeacherModalComponent = ({
  isOpen,
  onClose,
  onSave,
  departments,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (teacher: any) => void;
  departments: any[];
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    specialization: "",
    qualification: "",
    experience: "",
    designation: "",
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
        designation: "",
        role: "junior",
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <ModalShell
      title="Add Teacher"
      subtitle="Register a faculty member for jury assignment"
      icon={Users}
      size="lg"
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose} className={btnGhost}>
            Cancel
          </button>
          <button onClick={() => onSave(formData)} className={btnPrimary}>
            <Plus className="w-4 h-4" />
            Add Teacher
          </button>
        </>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className={labelBase}>Full Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={inputBase}
            placeholder="Dr. Ayesha Khan"
            autoFocus
          />
        </div>
        <div className="md:col-span-2">
          <label className={labelBase}>Email *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={inputBase}
            placeholder="teacher@university.edu"
          />
        </div>
        <div>
          <label className={labelBase}>Department *</label>
          <select
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            className={inputBase}
          >
            <option value="">Select department</option>
            {departments.map((dept) => (
              <option key={dept.deptId} value={dept.name}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelBase}>Specialization *</label>
          <input
            type="text"
            value={formData.specialization}
            onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
            className={inputBase}
            placeholder="Machine Learning"
          />
        </div>
        <div>
          <label className={labelBase}>Qualification *</label>
          <input
            type="text"
            value={formData.qualification}
            onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
            className={inputBase}
            placeholder="PhD"
          />
        </div>
        <div>
          <label className={labelBase}>Experience (years) *</label>
          <input
            type="number"
            value={formData.experience}
            onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
            className={inputBase}
            placeholder="5"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Designation *
          </label>
          <select
            value={formData.designation}
            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
            className={inputBase}
            required
          >
            <option value="">Select designation</option>
            <option value="Lab Instructor">Lab Instructor</option>
            <option value="Lecturer">Lecturer</option>
            <option value="Assistant Professor">Assistant Professor</option>
            <option value="Professor">Professor</option>
          </select>
        </div>
      </div>
    </ModalShell>
  );
};

/* ============================================================
   PROFILE TAB
   ============================================================ */

const ProfileTab = ({ user }: { user: any }) => {
  const name = user?.name || "Admin";
  const email = user?.email || "admin@fyp.com";
  const initials = name.slice(0, 2).toUpperCase();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <Card className="lg:col-span-1 p-6 flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-2xl font-semibold">
          {initials}
        </div>
        <h3 className="mt-4 text-lg font-semibold text-slate-900">{name}</h3>
        <p className="text-sm text-slate-500">{email}</p>
        <div className="mt-3">
          <Badge tone="indigo">
            <Shield className="w-3 h-3" /> Administrator
          </Badge>
        </div>
      </Card>

      <Card className="lg:col-span-2">
        <SectionHeader
          title="Account Information"
          subtitle="Read-only details from your admin account"
          icon={User}
        />
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelBase}>Username</label>
            <input value={name} disabled className={`${inputBase} bg-slate-50 text-slate-500`} />
          </div>
          <div>
            <label className={labelBase}>Email</label>
            <input value={email} disabled className={`${inputBase} bg-slate-50 text-slate-500`} />
          </div>
          <div>
            <label className={labelBase}>Role</label>
            <input
              value={user?.role || "ADMIN"}
              disabled
              className={`${inputBase} bg-slate-50 text-slate-500`}
            />
          </div>
          <div>
            <label className={labelBase}>Portal</label>
            <input
              value="FYP / MS Thesis Portal"
              disabled
              className={`${inputBase} bg-slate-50 text-slate-500`}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

/* ============================================================
   SETTINGS TAB
   ============================================================ */

const SettingsTab = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [adminSettings, setAdminSettings] = useState({
    username: "",
    email: "",
    notifications: true,
    theme: "light",
  });

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  const fetchAdminProfile = async () => {
    setLoading(true);
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      setAdminSettings({
        username: storedUser.name || "Admin",
        email: storedUser.email || "admin@fyp.com",
        notifications: true,
        theme: "light",
      });
    } catch (error) {
      console.error("Error fetching admin profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setSaving(true);

    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const response = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: storedUser.name,
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Password changed successfully!");
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.message || "Failed to change password");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSettingsUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: storedUser.name,
          notifications: adminSettings.notifications,
          theme: adminSettings.theme,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Settings updated successfully!");
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        user.notifications = adminSettings.notifications;
        user.theme = adminSettings.theme;
        localStorage.setItem("user", JSON.stringify(user));
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.message || "Failed to update settings");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="text-center">
          <div className="w-10 h-10 border-[3px] border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-sm text-slate-500">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {success && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">
          <CheckCircle className="w-4 h-4" />
          {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <Card>
        <SectionHeader
          title="Change Password"
          subtitle="Update your login credentials"
          icon={Lock}
        />
        <form onSubmit={handlePasswordChange} className="p-5 space-y-4">
          <div>
            <label className={labelBase}>Current Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                }
                className={`${inputBase} pl-10 pr-10`}
                placeholder="Enter current password"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelBase}>New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                  className={`${inputBase} pl-10 pr-10`}
                  placeholder="Enter new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className={labelBase}>Confirm New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                  }
                  className={`${inputBase} pl-10 pr-10`}
                  placeholder="Confirm new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button type="submit" disabled={saving} className={btnPrimary}>
              <Save className="w-4 h-4" />
              {saving ? "Changing Password..." : "Change Password"}
            </button>
          </div>
        </form>
      </Card>

      <Card>
        <SectionHeader
          title="Preferences"
          subtitle="Manage how the portal behaves for you"
          icon={Settings}
        />
        <form onSubmit={handleSettingsUpdate} className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelBase}>Username</label>
              <input
                type="text"
                value={adminSettings.username}
                disabled
                className={`${inputBase} bg-slate-50 text-slate-500 cursor-not-allowed`}
              />
              <p className="text-xs text-slate-400 mt-1.5">Username cannot be changed</p>
            </div>
            <div>
              <label className={labelBase}>Email</label>
              <input
                type="email"
                value={adminSettings.email}
                disabled
                className={`${inputBase} bg-slate-50 text-slate-500 cursor-not-allowed`}
              />
              <p className="text-xs text-slate-400 mt-1.5">Email cannot be changed</p>
            </div>
          </div>

          <div>
            <label className={labelBase}>Theme Preference</label>
            <select
              value={adminSettings.theme}
              onChange={(e) => setAdminSettings({ ...adminSettings, theme: e.target.value })}
              className={inputBase}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System Default</option>
            </select>
          </div>

          <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div>
              <p className="text-sm font-medium text-slate-800">Email Notifications</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Receive notifications about group submissions and schedules
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setAdminSettings({
                  ...adminSettings,
                  notifications: !adminSettings.notifications,
                })
              }
              className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
                adminSettings.notifications ? "bg-indigo-600" : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  adminSettings.notifications ? "translate-x-5" : ""
                }`}
              />
            </button>
          </div>

          <div className="flex justify-end pt-1">
            <button type="submit" disabled={saving} className={btnPrimary}>
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>
      </Card>

      <Card>
        <SectionHeader
          title="Account Actions"
          subtitle="Advanced account management"
          icon={Shield}
        />
        <div className="p-5 space-y-3">
          <button
            onClick={() => {
              if (confirm("Are you sure you want to log out from all devices?")) {
                // Handle logout from all devices
              }
            }}
            className="w-full text-left px-4 py-3.5 rounded-xl border border-amber-200 bg-amber-50/60 hover:bg-amber-50 transition-colors flex items-center gap-3"
          >
            <LogOut className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-sm font-medium text-slate-800">Logout from All Devices</p>
              <p className="text-xs text-slate-500">End all active sessions</p>
            </div>
          </button>

          <button
            onClick={() => {
              if (
                confirm(
                  "Are you sure you want to deactivate your account? This action cannot be undone.",
                )
              ) {
                // Handle account deactivation
              }
            }}
            className="w-full text-left px-4 py-3.5 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-50 transition-colors flex items-center gap-3"
          >
            <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <p className="text-sm font-medium text-rose-800">Deactivate Account</p>
              <p className="text-xs text-rose-500">Permanently deactivate your admin account</p>
            </div>
          </button>
        </div>
      </Card>
    </div>
  );
};

/* ============================================================
   MAIN DASHBOARD
   ============================================================ */

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabType>("settings");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scheduling, setScheduling] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDates, setScheduleDates] = useState({ startDate: "", endDate: "" });

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
  }>({ show: false, group: null });
  const [rejectModal, setRejectModal] = useState<{
    show: boolean;
    groupId: number | null;
    reason: string;
  }>({ show: false, groupId: null, reason: "" });
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [showCredentials, setShowCredentials] = useState<{
    show: boolean;
    group: StudentGroup | null;
    password: string;
  }>({ show: false, group: null, password: "" });

  const [departmentForm, setDepartmentForm] = useState({ name: "" });
  const [searchTerm, setSearchTerm] = useState("");

  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalDepartments: 0,
    pendingGroups: 0,
  });

  const [showAssignJuryModal, setShowAssignJuryModal] = useState(false);
const [selectedGroupForJury, setSelectedGroupForJury] = useState<{ groupId: number; groupUsername: string } | null>(null);

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
      const pendingRes = await fetch("/api/admin/groups?status=PENDING");
      const pendingData = await pendingRes.json();
      setPendingGroups(pendingData);

      const verifiedRes = await fetch("/api/admin/groups?status=VERIFIED");
      const verifiedData = await verifiedRes.json();
      setVerifiedGroups(verifiedData);

      const deptRes = await fetch("/api/admin/departments");
      const deptData = await deptRes.json();
      setDepartments(deptData);
    

      const teacherRes = await fetch("/api/admin/teachers");
      const teacherData = await teacherRes.json();
      setTeachers(teacherData);

      const studentRes = await fetch("/api/admin/students");
      let studentData = await studentRes.json();

      if (Array.isArray(studentData)) {
        studentData = studentData.map((student: any) => {
          const email = student?.email || "";
          let rollNumber = "";

          if (email && typeof email === "string") {
            const match = email.match(/k(\d{2})(\d{4})@/);
            if (match) {
              rollNumber = `${match[1]}k-${match[2]}`;
            }
          }

          return { ...student, rollNum: rollNumber };
        });
      }

      setStudents(studentData);

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

  /* ---------------- Handlers (unchanged logic) ---------------- */

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let password = "";
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleApproveGroup = async (group: StudentGroup) => {
    const generatedPassword = generateRandomPassword();
    try {
      const response = await fetch("/api/admin/approve-group", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId: group.groupId, password: generatedPassword }),
      });

      if (response.ok) {
        setShowGroupModal({ show: false, group: null });
        setShowCredentials({ show: true, group, password: generatedPassword });
        fetchDashboardData();
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
        alert("Group rejected successfully. Notification email sent to leader.");
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

  const handleViewGroup = async (group: StudentGroup) => {
    try {
      const membersRes = await fetch(`/api/student/group/members?groupId=${group.groupId}`);
      const membersData = await membersRes.json();
      const members = Array.isArray(membersData) ? membersData : [membersData];

      const projectRes = await fetch(`/api/student/group/project?groupId=${group.groupId}`);
      const projectData = await projectRes.json();
      const rawProject = Array.isArray(projectData) ? projectData[0] : projectData;

      const projectDetails = rawProject
        ? {
            PROJECTID: rawProject.PROJECTID || rawProject.projectId,
            domains: rawProject.DOMAIN || rawProject.domains || rawProject.DOMAINS,
            PROJECTTITLE: rawProject.PROJECTTITLE || rawProject.projectTitle,
            PROPOSALDOCUMENT: rawProject.PROPOSALDOCUMENT || rawProject.proposalDocument,
          }
        : undefined;

      setShowGroupModal({
        show: true,
        group: { ...group, members, projectDetails },
      });
    } catch (error) {
      console.error("Error fetching group details:", error);
    }
  };

// Handle assign jury button click
const handleOpenAssignJury = (group: StudentGroup) => {
  setSelectedGroupForJury({
    groupId: group.groupId,
    groupUsername: group.groupUsername
  });
  setShowAssignJuryModal(true);
};

// Handle jury assignment
const handleAssignJury = async (groupId: number, seniorId: number, juniorId: number, seniorTeacherName: string, seniorTeacherEmail: string,juniorTeacherName: string, juniorTeacherEmail: string) => {
  try {
    const response = await fetch('/api/admin/assign-jury', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        groupId, 
        seniorId, 
        juniorId,
        seniorTeacherName,
        seniorTeacherEmail,
        juniorTeacherName,
        juniorTeacherEmail,
        manualAssignment: true
      }),
    });

    const data = await response.json();

    if (response.ok) {
      alert(`✅ Jury assigned successfully!\nSenior: ${data.data.seniorTeacher}\nJunior: ${data.data.juniorTeacher}`);
      fetchDashboardData(); // Refresh the list
      setShowAssignJuryModal(false);
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
    router.push("/login");
  };

  const handleAddTeacher = async (teacherData: any) => {
    try {
      const response = await fetch("/api/admin/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(teacherData),
      });

      if (response.ok) {
        fetchDashboardData();
        setShowTeacherModal(false);
      } else {
        const error = await response.json();
        console.error("Error adding teacher:", error);
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };

  const handleAddDepartment = async (deptName: string) => {
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

  const deleteDepartment = async (id: number) => {
    try {
      const response = await fetch("/api/admin/departments/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deptId: id }),
      });
      if (response.ok) fetchDashboardData();
    } catch (error) {
      console.error("Error deleting department: ", error);
    }
  };

  const handleAutoSchedule = async (startDate: string, endDate: string) => {
    setScheduling(true);
    try {
      const response = await fetch("/api/admin/auto-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate,
          endDate,
          startTime: "08:00:00",
          endTime: "16:00:00",
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(
          `Scheduling complete!\n\nScheduled: ${data.summary?.assignedCount || 0}\nFailed: ${
            data.summary?.unassignedCount || 0
          }`,
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

  const openScheduleModal = () => setShowScheduleModal(true);
  const closeScheduleModal = () => {
    setShowScheduleModal(false);
    setScheduleDates({ startDate: "", endDate: "" });
  };

  /* ---------------- Search filtering ---------------- */

  const q = searchTerm.trim().toLowerCase();
  const match = (...values: any[]) =>
    !q || values.some((v) => String(v ?? "").toLowerCase().includes(q));

  const filteredPending = useMemo(
    () =>
      (pendingGroups || []).filter((g) =>
        match(g.groupUsername, g.leaderEmail, g.supervisorEmail),
      ),
    [pendingGroups, q],
  );
  const filteredVerified = useMemo(
    () =>
      (verifiedGroups || []).filter((g) =>
        match(g.groupUsername, g.leaderEmail, g.supervisorEmail),
      ),
    [verifiedGroups, q],
  );
  const filteredStudents = useMemo(
    () =>
      (students || []).filter((s) =>
        match(s.name, s.email, s.rollNum, s.section, s.batch),
      ),
    [students, q],
  );
  const filteredTeachers = useMemo(
    () => (teachers || []).filter((t) => match(t.name, t.email, t.specialization, t.designation)),
    [teachers, q],
  );
  const filteredDepartments = useMemo(
    () => (departments || []).filter((d) => match(d.name, d.deptId)),
    [departments, q],
  );

  const deptName = (id: number) =>
    departments.find((d) => d.deptId === id)?.name || "—";

  /* ---------------- Sidebar ---------------- */

  const navItems: {
    key: TabType;
    label: string;
    icon: any;
    badge?: number;
  }[] = [
    { key: "pending", label: "Pending Groups", icon: ClipboardList, badge: stats.pendingGroups },
    { key: "verified", label: "Verified Groups", icon: CheckCircle },
    { key: "students", label: "Students", icon: GraduationCap },
    { key: "departments", label: "Departments", icon: Building2 },
    { key: "teachers", label: "Teachers", icon: Users },
    { key: "profile", label: "Profile", icon: User },
    { key: "settings", label: "Settings", icon: Settings },
  ];

  const pageTitle: Record<TabType, string> = {
    pending: "Pending Groups",
    verified: "Verified Groups",
    students: "Students",
    departments: "Departments",
    teachers: "Teachers",
    profile: "Profile",
    settings: "Settings",
  };

  const pageSubtitle: Record<TabType, string> = {
    pending: "Review and verify newly registered FYP / MS thesis groups",
    verified: "Assign juries and schedule evaluations for verified groups",
    students: "All registered students in the portal",
    departments: "Academic departments used across the portal",
    teachers: "Faculty available for jury assignment",
    profile: "Your administrator account overview",
    settings: "Security and preference settings",
  };

  /* ---------------- Loading ---------------- */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F8FB] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-[3px] border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-sm text-slate-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const adminName = user?.name || "Admin";
  const adminEmail = user?.email || "admin@fyp.com";

  return (
    <div className="min-h-screen bg-[#F7F8FB] text-slate-800">
      {/* ================= SIDEBAR ================= */}
      <aside
        className={`${
          sidebarCollapsed ? "w-[76px]" : "w-64"
        } fixed left-0 top-0 h-screen bg-white border-r border-slate-200 flex flex-col transition-all duration-300 z-30`}
      >
        {/* Brand */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <span className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <LayoutGrid className="w-[18px] h-[18px]" />
            </span>
            {!sidebarCollapsed && (
              <div className="leading-tight">
                <p className="text-[15px] font-bold text-slate-900">FYP Portal</p>
                <p className="text-[11px] text-slate-400">Admin Console</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {!sidebarCollapsed && (
            <p className="px-3 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Management
            </p>
          )}
          {navItems.map((item) => {
            const active = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                title={sidebarCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <item.icon
                  className={`w-[18px] h-[18px] shrink-0 ${
                    active ? "text-indigo-600" : "text-slate-400"
                  }`}
                />
                {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                {!sidebarCollapsed && !!item.badge && item.badge > 0 && (
                  <span className="ml-auto text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User + logout */}
        <div className="p-3 border-t border-slate-100">
          <div
            className={`flex items-center gap-3 px-2 py-2 rounded-xl ${
              sidebarCollapsed ? "justify-center" : ""
            }`}
          >
            <span className="w-9 h-9 rounded-xl bg-slate-900 text-white text-xs font-semibold flex items-center justify-center shrink-0">
              {adminName.slice(0, 2).toUpperCase()}
            </span>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{adminName}</p>
                <p className="text-[11px] text-slate-400 truncate">{adminEmail}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`mt-1 w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors ${
              sidebarCollapsed ? "justify-center" : ""
            }`}
          >
            <LogOut className="w-[18px] h-[18px] shrink-0" />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ================= MAIN ================= */}
      <div className={`${sidebarCollapsed ? "ml-[76px]" : "ml-64"} transition-all duration-300`}>
        {/* Top bar */}
        <header className="sticky top-0 z-20 h-16 bg-white/90 backdrop-blur border-b border-slate-200 px-6 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-[15px] font-semibold text-slate-900 truncate">
              {pageTitle[activeTab]}
            </h1>
            <p className="text-xs text-slate-400 truncate hidden sm:block">
              {pageSubtitle[activeTab]}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search groups, students, teachers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-72 pl-10 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50/70 text-sm placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition"
              />
            </div>

            <button className="relative w-10 h-10 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 flex items-center justify-center transition-colors">
              <Bell className="w-[18px] h-[18px]" />
              {stats.pendingGroups > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
              )}
            </button>

            {(activeTab === "departments" || activeTab === "teachers") && (
              <button
                onClick={() =>
                  activeTab === "departments"
                    ? setShowDepartmentModal(true)
                    : setShowTeacherModal(true)
                }
                className={btnPrimary}
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">
                  Add {activeTab === "departments" ? "Department" : "Teacher"}
                </span>
              </button>
            )}

            {activeTab === "verified" && (
              <button onClick={openScheduleModal} disabled={scheduling} className={btnPrimary}>
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {scheduling ? "Scheduling..." : "Create Schedule"}
                </span>
              </button>
            )}
          </div>
        </header>

        <main className="p-6 space-y-5">
          {/* Greeting */}
          <div>
            <h2 className="text-[22px] font-bold text-slate-900">
              Hello, <span className="text-indigo-600">{adminName}</span>
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Welcome back to the FYP / MS Thesis jury assignment portal
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              {
                label: "Total Students",
                value: stats.totalStudents,
                icon: GraduationCap,
                hint: "Registered in the portal",
                tone: "bg-indigo-50 text-indigo-600",
              },
              {
                label: "Total Teachers",
                value: stats.totalTeachers,
                icon: Users,
                hint: "Available for jury duty",
                tone: "bg-emerald-50 text-emerald-600",
              },
              {
                label: "Departments",
                value: stats.totalDepartments,
                icon: Building2,
                hint: "Active departments",
                tone: "bg-violet-50 text-violet-600",
              },
              {
                label: "Pending Groups",
                value: stats.pendingGroups,
                icon: AlertCircle,
                hint: "Awaiting verification",
                tone: "bg-amber-50 text-amber-600",
              },
            ].map((s) => (
              <Card key={s.label} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[13px] text-slate-500">{s.label}</p>
                    <p className="text-[26px] leading-tight font-bold text-slate-900 mt-1.5">
                      {s.value}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">{s.hint}</p>
                  </div>
                  <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.tone}`}>
                    <s.icon className="w-5 h-5" />
                  </span>
                </div>
              </Card>
            ))}
          </div>

          {/* ============ PENDING ============ */}
          {activeTab === "pending" && (
            <Card>
              <SectionHeader
                title="Pending Groups"
                subtitle={`${filteredPending.length} group(s) awaiting review`}
                icon={ClipboardList}
              />
              {filteredPending.length === 0 ? (
                <EmptyState
                  icon={CheckCircle}
                  title="No pending groups"
                  message="All submitted groups have been reviewed. New submissions will appear here."
                />
              ) : (
                <ul className="divide-y divide-slate-100">
                  {filteredPending.map((group) => (
                    <li
                      key={group.groupId}
                      className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50/70 transition-colors"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <span className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                          <ClipboardList className="w-[18px] h-[18px]" />
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-slate-900 truncate">
                              {group.groupUsername}
                            </p>
                            <Badge tone="amber">Pending</Badge>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 truncate">
                            Leader: {group.leaderEmail}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            Supervisor: {group.supervisorEmail || "Not assigned"}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 shrink-0">
                        <button onClick={() => handleViewGroup(group)} className={btnGhost}>
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                        <button onClick={() => handleApproveGroup(group)} className={btnGreen}>
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectGroup(group.groupId)}
                          className={btnRose}
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          )}

          {/* ============ VERIFIED ============ */}
          {activeTab === "verified" && (
            <Card>
              <SectionHeader
                title="Verified Groups"
                subtitle={`${filteredVerified.length} verified group(s)`}
                icon={CheckCircle}
              />
              {filteredVerified.length === 0 ? (
                <EmptyState
                  icon={CheckCircle}
                  title="No verified groups"
                  message="Approved groups will show up here so you can assign juries and schedule evaluations."
                />
              ) : (
                <ul className="divide-y divide-slate-100">
                  {filteredVerified.map((group) => (
                    <li
                      key={group.groupId}
                      className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50/70 transition-colors"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <span className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                          <CheckCircle className="w-[18px] h-[18px]" />
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-slate-900 truncate">
                              {group.groupUsername}
                            </p>
                            <Badge tone="green">Verified</Badge>
                            {group.juryId ? (
                              <Badge tone="violet">
                                <UserCheck className="w-3 h-3" /> Jury assigned
                              </Badge>
                            ) : (
                              <Badge tone="amber">
                                <AlertCircle className="w-3 h-3" /> Pending jury
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-1 truncate">
                            Leader: {group.leaderEmail}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            Supervisor: {group.supervisorEmail || "Not assigned"}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 shrink-0">
                        <button onClick={() => handleViewGroup(group)} className={btnGhost}>
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                        {!group.juryId && (
                          <button
                            onClick={() => handleOpenAssignJury(group)}
                            className={btnPrimary}
                          >
                            <UserCheck className="w-4 h-4" />
                            Assign Jury
                          </button>
                        )}
                        {showAssignJuryModal && selectedGroupForJury && (
  <AssignJuryModal
    isOpen={showAssignJuryModal}
    onClose={() => {
      setShowAssignJuryModal(false);
      setSelectedGroupForJury(null);
    }}
    groupId={selectedGroupForJury.groupId}
    groupUsername={selectedGroupForJury.groupUsername}
    onAssign={handleAssignJury}
  />
)}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
            
          )}

          {/* ============ STUDENTS ============ */}
          {activeTab === "students" && (
            <Card className="overflow-hidden">
              <SectionHeader
                title="Students"
                subtitle={`${filteredStudents.length} student(s)`}
                icon={GraduationCap}
              />
              {filteredStudents.length === 0 ? (
                <EmptyState
                  icon={GraduationCap}
                  title="No students found"
                  message="Students appear here once they register through the portal."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50/80 border-b border-slate-100">
                      <tr>
                        <th className={th}>ID</th>
                        <th className={th}>Name</th>
                        <th className={th}>Roll No</th>
                        <th className={th}>Email</th>
                        <th className={th}>Section</th>
                        <th className={th}>Batch</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredStudents.map((student) => (
                        <tr key={student.stdId} className="hover:bg-slate-50/70 transition-colors">
                          <td className={`${td} text-slate-400`}>{student.stdId}</td>
                          <td className={`${td} font-medium text-slate-900`}>{student.name}</td>
                          <td className={td}>
                            <span className="font-mono text-xs text-slate-600">
                              {student.rollNum || "—"}
                            </span>
                          </td>
                          <td className={`${td} text-slate-500`}>{student.email}</td>
                          <td className={td}>{student.section || "—"}</td>
                          <td className={td}>{student.batch || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}

          {/* ============ DEPARTMENTS ============ */}
          {activeTab === "departments" && (
            <Card className="overflow-hidden">
              <SectionHeader
                title="Departments"
                subtitle={`${filteredDepartments.length} department(s)`}
                icon={Building2}
              />
              {filteredDepartments.length === 0 ? (
                <EmptyState
                  icon={Building2}
                  title="No departments yet"
                  message='Click "Add Department" to create your first department.'
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50/80 border-b border-slate-100">
                      <tr>
                        <th className={th}>ID</th>
                        <th className={th}>Department Name</th>
                        <th className={`${th} text-right`}>Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredDepartments.map((dept) => (
                        <tr key={dept.deptId} className="hover:bg-slate-50/70 transition-colors">
                          <td className={`${td} text-slate-400`}>{dept.deptId}</td>
                          <td className={`${td} font-medium text-slate-900`}>{dept.name}</td>
                          <td className={`${td} text-right`}>
                            <button
                              onClick={() => deleteDepartment(dept.deptId)}
                              className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                              title="Delete department"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}

          {/* ============ TEACHERS ============ */}
          {activeTab === "teachers" && (
            <Card className="overflow-hidden">
              <SectionHeader
                title="Teachers"
                subtitle={`${filteredTeachers.length} faculty member(s)`}
                icon={Users}
              />
              {filteredTeachers.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="No teachers yet"
                  message='Click "Add Teacher" to register faculty for jury assignment.'
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50/80 border-b border-slate-100">
                      <tr>
                        <th className={th}>ID</th>
                        <th className={th}>Name</th>
                        <th className={th}>Email</th>
                        <th className={th}>Designation</th>
                        <th className={th}>Department</th>
                        <th className={th}>Specialization</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredTeachers.map((teacher) => (
                        <tr
                          key={teacher.TeacherId}
                          className="hover:bg-slate-50/70 transition-colors"
                        >
                          <td className={`${td} text-slate-400`}>{teacher.TeacherId}</td>
                          <td className={`${td} font-medium text-slate-900`}>{teacher.name}</td>
                          <td className={`${td} text-slate-500`}>{teacher.email}</td>
                          <td className={td}>
                            {/* ✅ ADD THIS - Designation with color coding */}
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                              teacher.designation === 'Professor' ? 'bg-purple-100 text-purple-700' :
                              teacher.designation === 'Assistant Professor' ? 'bg-blue-100 text-blue-700' :
                              teacher.designation === 'Lecturer' ? 'bg-emerald-100 text-emerald-700' :
                              teacher.designation === 'Lab Instructor' ? 'bg-amber-100 text-amber-700' :
                              'bg-slate-100 text-slate-500'
                            }`}>
                              {teacher.designation || 'N/A'}
                            </span>
                          </td>
                          <td className={td}>
                            <Badge tone="indigo">{deptName(teacher.deptId)}</Badge>
                          </td>
                          <td className={td}>{teacher.specialization || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}

          {/* ============ PROFILE / SETTINGS ============ */}
          {activeTab === "profile" && <ProfileTab user={user} />}
          {activeTab === "settings" && <SettingsTab />}
        </main>
      </div>

      {/* ================= MODALS ================= */}

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

      {/* Credentials */}
      {showCredentials.show && (
        <ModalShell
          title="Group Credentials"
          subtitle="Share these details with the group leader"
          icon={Mail}
          tone="green"
          onClose={() => setShowCredentials({ show: false, group: null, password: "" })}
          footer={
            <button
              onClick={() => setShowCredentials({ show: false, group: null, password: "" })}
              className={btnPrimary}
            >
              Done
            </button>
          }
        >
          <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-700 mb-4">
            <Mail className="w-4 h-4 mt-0.5 shrink-0" />
            <span>Credentials have been emailed to {showCredentials.group?.leaderEmail}</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className={labelBase}>Group Username</label>
              <input
                readOnly
                value={showCredentials.group?.groupUsername || ""}
                className={`${inputBase} bg-slate-50 font-mono`}
              />
            </div>
            <div>
              <label className={labelBase}>Password</label>
              <input
                readOnly
                value={showCredentials.password}
                className={`${inputBase} bg-slate-50 font-mono tracking-wider`}
              />
              <p className="text-xs text-slate-400 mt-1.5">
                This password is shown only once — keep a copy if needed.
              </p>
            </div>
          </div>
        </ModalShell>
      )}

      {/* View group */}
      {showGroupModal.show && showGroupModal.group && (
        <ModalShell
          title="Group Details"
          subtitle="Complete information about the group and its members"
          icon={Users}
          size="xl"
          onClose={() => setShowGroupModal({ show: false, group: null })}
          footer={
            <>
              <button
                onClick={() => setShowGroupModal({ show: false, group: null })}
                className={btnGhost}
              >
                Close
              </button>
              {showGroupModal.group.status === "PENDING" && (
                <>
                  <button
                    onClick={() => handleApproveGroup(showGroupModal.group as StudentGroup)}
                    className={btnGreen}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleRejectGroup(showGroupModal.group!.groupId)}
                    className={btnRose}
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </>
              )}
            </>
          }
        >
          <div className="space-y-6">
            {/* Overview */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3">
                Group Information
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-2xl bg-slate-50 border border-slate-100 p-5">
                <div>
                  <p className="text-xs text-slate-500">Group Username</p>
                  <p className="text-sm font-semibold text-slate-900 mt-1 break-all">
                    {showGroupModal.group.groupUsername}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Leader Email</p>
                  <p className="text-sm text-slate-800 mt-1 break-all">
                    {showGroupModal.group.leaderEmail}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Supervisor</p>
                  <p className="text-sm text-slate-800 mt-1 break-all">
                    {showGroupModal.group.supervisorEmail || "Not assigned"}
                  </p>
                </div>
              </div>
            </div>

            {/* Status */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3">
                Status
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {showGroupModal.group.status === "VERIFIED" && <Badge tone="green">Verified</Badge>}
                {showGroupModal.group.status === "PENDING" && (
                  <Badge tone="amber">Pending approval</Badge>
                )}
                {showGroupModal.group.status === "DENIED" && <Badge tone="rose">Denied</Badge>}
                {showGroupModal.group.juryId ? (
                  <Badge tone="violet">
                    <UserCheck className="w-3 h-3" /> Jury assigned
                  </Badge>
                ) : null}
              </div>
            </div>

            {/* Project */}
            {showGroupModal.group.projectDetails && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  Project Details
                </p>
                <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5 space-y-4">
                  <div>
                    <p className="text-xs text-slate-500">Project Title</p>
                    <p className="text-sm font-semibold text-slate-900 mt-1">
                      {showGroupModal.group.projectDetails.PROJECTTITLE || "Not submitted"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-2">Domains</p>
                    <div className="flex flex-wrap gap-2">
                      {showGroupModal.group.projectDetails.domains ? (
                        showGroupModal.group.projectDetails.domains
                          .split(",")
                          .map((domain: string, idx: number) => (
                            <Badge key={idx} tone="indigo">
                              {domain.trim()}
                            </Badge>
                          ))
                      ) : (
                        <p className="text-sm text-slate-500">No domains selected</p>
                      )}
                    </div>
                  </div>
                  {showGroupModal.group.projectDetails.PROPOSALDOCUMENT && (
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Proposal Document</p>
                      <a
                        href={showGroupModal.group.projectDetails.PROPOSALDOCUMENT}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                      >
                        <FileText className="w-4 h-4" />
                        View proposal
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Members */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3">
                Group Members
              </p>
              <div className="rounded-2xl border border-slate-100 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className={th}>#</th>
                      <th className={th}>Full Name</th>
                      <th className={th}>Email</th>
                      <th className={th}>Section</th>
                      <th className={th}>Batch</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {showGroupModal.group.members && showGroupModal.group.members.length > 0 ? (
                      showGroupModal.group.members.map((member: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50/70">
                          <td className={`${td} text-slate-400`}>{idx + 1}</td>
                          <td className={`${td} font-medium text-slate-900`}>{member.name}</td>
                          <td className={`${td} text-slate-500 break-all`}>{member.email}</td>
                          <td className={td}>{member.section || "—"}</td>
                          <td className={td}>{member.batch || "—"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5}>
                          <EmptyState
                            icon={Users}
                            title="No members found"
                            message="This group has no members assigned yet."
                          />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </ModalShell>
      )}

      {/* Reject */}
      {rejectModal.show && (
        <ModalShell
          title="Reject Group"
          subtitle="The group leader will be notified by email"
          icon={XCircle}
          tone="rose"
          onClose={handleCancelRejection}
          footer={
            <>
              <button onClick={handleCancelRejection} className={btnGhost}>
                Cancel
              </button>
              <button
                onClick={handleConfirmRejection}
                disabled={!rejectModal.reason.trim()}
                className={btnRose}
              >
                <XCircle className="w-4 h-4" />
                Confirm Rejection
              </button>
            </>
          }
        >
          <div className="px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 mb-4">
            This action cannot be undone. The group leader will receive your reason by email.
          </div>

          <label className={labelBase}>Reason for Rejection *</label>
          <input
            value={rejectModal.reason}
            onChange={(e) => setRejectModal((prev) => ({ ...prev, reason: e.target.value }))}
            className={inputBase}
            placeholder="Please provide a clear reason for rejection..."
            autoFocus
            dir="ltr"
          />

          <p className="text-xs text-slate-400 mt-4 mb-2">Quick suggestions</p>
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
                onClick={() => setRejectModal((prev) => ({ ...prev, reason: suggestion }))}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </ModalShell>
      )}

      {/* Schedule */}
      {showScheduleModal && (
        <ModalShell
          title="Schedule Evaluations"
          subtitle="Auto-assign verified groups to slots and venues"
          icon={Calendar}
          tone="green"
          onClose={closeScheduleModal}
          footer={
            <>
              <button onClick={closeScheduleModal} className={btnGhost}>
                Cancel
              </button>
              <button
                onClick={() => handleAutoSchedule(scheduleDates.startDate, scheduleDates.endDate)}
                disabled={!scheduleDates.startDate || !scheduleDates.endDate || scheduling}
                className={btnGreen}
              >
                {scheduling ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4" />
                    Create Schedule
                  </>
                )}
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="px-4 py-3 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-700">
              Select the date range for evaluations. All verified groups will be assigned to
              available time slots and venues automatically.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelBase}>
                  Start Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={scheduleDates.startDate}
                  onChange={(e) =>
                    setScheduleDates((prev) => ({ ...prev, startDate: e.target.value }))
                  }
                  className={inputBase}
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>
              <div>
                <label className={labelBase}>
                  End Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={scheduleDates.endDate}
                  onChange={(e) =>
                    setScheduleDates((prev) => ({ ...prev, endDate: e.target.value }))
                  }
                  className={inputBase}
                  min={scheduleDates.startDate || new Date().toISOString().split("T")[0]}
                  required
                />
              </div>
            </div>

            {scheduleDates.startDate && scheduleDates.endDate && (
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 text-xs text-slate-600 space-y-1">
                <p>
                  <span className="font-medium text-slate-700">From:</span>{" "}
                  {new Date(scheduleDates.startDate).toLocaleDateString()}
                </p>
                <p>
                  <span className="font-medium text-slate-700">To:</span>{" "}
                  {new Date(scheduleDates.endDate).toLocaleDateString()}
                </p>
                <p>
                  <span className="font-medium text-slate-700">Duration:</span>{" "}
                  {Math.ceil(
                    (new Date(scheduleDates.endDate).getTime() -
                      new Date(scheduleDates.startDate).getTime()) /
                      (1000 * 60 * 60 * 24),
                  ) + 1}{" "}
                  days
                </p>
              </div>
            )}

            <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-700 space-y-1">
              <p className="font-medium">Note</p>
              <p>• Only verified groups without an existing schedule are scheduled</p>
              <p>• Time slots run 8:00 AM – 4:00 PM (50 minutes each)</p>
              <p>• Conflicts are handled automatically</p>
            </div>
          </div>
        </ModalShell>
      )}
    </div>
  );
}
