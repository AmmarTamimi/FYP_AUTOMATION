// app/(dashboard)/teacher/profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Save,
  X,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Award,
  Briefcase,
  School,
  BookOpen,
  TrendingUp,
  UserCheck,
  GraduationCap,
  Sparkles,
  Shield,
} from "lucide-react";

// Types
interface TeacherProfile {
  teacherId: number;
  name: string;
  email: string;
  username: string;
  specialization: string;
  qualification: string;
  experience: number;
  role: "senior" | "junior";
  designation: string;
  department: string;
}

export default function TeacherProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Profile data
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [originalProfile, setOriginalProfile] = useState<TeacherProfile | null>(
    null,
  );

  // Edit mode
  const [isEditing, setIsEditing] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    specialization: "",
    qualification: "",
    experience: 0,
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
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const response = await fetch(
        `/api/teacher/profile?email=${storedUser.email}`,
      );
      let data = await response.json();
      // Handle array response
      const teacherData = Array.isArray(data) ? data[0] : data;

      setProfile(teacherData);
      setOriginalProfile(teacherData);
      setFormData({
        specialization: teacherData.specialization || "",
        qualification: teacherData.qualification || "",
        experience: teacherData.experience || 0,
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to determine role based on qualification and experience
  const determineRole = (
    qualification: string,
    experience: number,
  ): "senior" | "junior" => {
    const isPhD =
      qualification.toLowerCase().includes("phd") ||
      qualification.toLowerCase().includes("doctorate");
    const hasExperience = experience >= 5;

    if (isPhD || hasExperience) {
      return "senior";
    }
    return "junior";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const newRole = determineRole(formData.qualification, formData.experience);
    const roleWillChange = newRole !== profile?.role;

    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const response = await fetch("/api/teacher/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: storedUser.email,
          specialization: formData.specialization,
          qualification: formData.qualification,
          experience: formData.experience,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.roleChanged && data.reassignments?.length > 0) {
          setSuccess(data.message);
          alert(
            `✅ Role Updated!\n\n${data.message}\n\nJury Reassignments:\n${data.reassignments.map((r: any) => `  • ${r.message}`).join("\n")}`,
          );
        } else if (data.roleChanged) {
          setSuccess(data.message);
          alert(
            `✅ Role Updated!\n\nYour role has changed from ${data.oldRole} to ${data.newRole}.`,
          );
        } else {
          setSuccess("Profile updated successfully!");
        }

        setProfile({
          ...profile!,
          specialization: formData.specialization,
          qualification: formData.qualification,
          experience: formData.experience,
          role: newRole,
        });

        setIsEditing(false);
        setTimeout(() => setSuccess(""), 3000);
      } else {
        if (data.blocked) {
          let errorMessage = data.message;
          if (data.reassignments?.length > 0) {
            errorMessage += "\n\nAffected Juries:\n";
            data.reassignments.forEach((r: any) => {
              errorMessage += `  • Jury #${r.juryId}: ${r.message}\n`;
            });
          }
          setError(errorMessage);
          alert(
            `❌ Update Blocked\n\n${errorMessage}\n\nPlease contact admin for assistance.`,
          );
        } else {
          setError(data.message || "Failed to update profile");
        }
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (originalProfile) {
      setFormData({
        specialization: originalProfile.specialization || "",
        qualification: originalProfile.qualification || "",
        experience: originalProfile.experience || 0,
      });
    }
    setIsEditing(false);
    setError("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#3F51B5] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800">
            Profile Not Found
          </h2>
          <p className="text-gray-500 mt-2">Unable to load your profile.</p>
          <Link
            href="/teacher/dashboard"
            className="mt-4 inline-block text-[#3F51B5] hover:underline"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/teacher/dashboard"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-[#3F51B5] transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Profile Settings
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage your professional information
              </p>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-[#3F51B5] text-white rounded-lg hover:bg-[#5C6BC0] transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-[#1A237E] to-[#3F51B5] px-6 py-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{profile.name}</h2>
                <p className="text-indigo-200 text-sm">{profile.email}</p>'
                
                <div className="flex items-center gap-2 mt-1">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-300" />
                  <p className="text-indigo-100 text-sm font-medium">
                    {profile.designation || 'Not Assigned'}
                    
                    
                  </p>
                </div>
                
                
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      profile.role === "senior"
                        ? "bg-amber-500 text-white"
                        : "bg-blue-500 text-white"
                    }`}
                  >
                    {profile.role === "senior"
                      ? "Senior Evaluator"
                      : "Junior Evaluator"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Read-only Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    disabled
                    className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Name cannot be changed. Contact admin for changes.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Email cannot be changed. Contact admin for changes.
                  </p>
                </div>
                

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Designation
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Briefcase className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={profile.designation || 'Not Assigned'}
                      disabled
                      className="w-full pl-9 pr-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Designation is set by the administrator.
                  </p>
                </div>

                {/* Moved dept here */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <School className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={profile.department || 'Not Assigned'}
                      disabled
                      className="w-full pl-9 pr-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Contact admin to change department.
                  </p>
                </div>



              </div>

              {/* Editable Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Specialization *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <BookOpen className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={formData.specialization}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          specialization: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                      className={`w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3F51B5] ${
                        isEditing
                          ? "border-gray-300 bg-white"
                          : "border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed"
                      }`}
                      placeholder="e.g., Artificial Intelligence"
                      required
                    />
                  </div>
                  {!isEditing && (
                    <p className="text-xs text-gray-400 mt-1">
                      Click Edit Profile to change
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Qualification *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <GraduationCap className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={formData.qualification}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          qualification: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                      className={`w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3F51B5] ${
                        isEditing
                          ? "border-gray-300 bg-white"
                          : "border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed"
                      }`}
                      placeholder="e.g., PhD in Computer Science"
                      required
                    />
                  </div>
                  {!isEditing && (
                    <p className="text-xs text-gray-400 mt-1">
                      Click Edit Profile to change
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Experience (years) *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Briefcase className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      value={formData.experience}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          experience: parseInt(e.target.value) || 0,
                        })
                      }
                      disabled={!isEditing}
                      className={`w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3F51B5] ${
                        isEditing
                          ? "border-gray-300 bg-white"
                          : "border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed"
                      }`}
                      placeholder="Years of experience"
                      min="0"
                      required
                    />
                  </div>
                  {!isEditing && (
                    <p className="text-xs text-gray-400 mt-1">
                      Click Edit Profile to change
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserCheck className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={
                        profile.role === "senior"
                          ? "Senior Evaluator"
                          : "Junior Evaluator"
                      }
                      disabled
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Role is automatically determined by qualification and
                    experience.
                    {!isEditing && (
                      <span>
                        {" "}
                        Click Edit Profile to see how changes affect your role.
                      </span>
                    )}
                  </p>
                </div>

                
              </div>

              {/* Role Change Warning */}
              {isEditing && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-amber-800">
                        Role Determination
                      </h4>
                      <p className="text-xs text-amber-700 mt-1">
                        Your role is automatically calculated based on:
                      </p>
                      <ul className="text-xs text-amber-700 mt-1 list-disc list-inside">
                        <li>
                          PhD or Doctorate qualification automatically qualifies
                          as Senior
                        </li>
                        <li>
                          5+ years of experience automatically qualifies as
                          Senior
                        </li>
                        <li>Otherwise, you will be classified as Junior</li>
                      </ul>
                      {determineRole(
                        formData.qualification,
                        formData.experience,
                      ) !== profile.role && (
                        <div className="mt-2 p-2 bg-amber-100 rounded-md">
                          <p className="text-xs font-medium text-amber-800">
                            ⚠️ Your role will change from{" "}
                            <strong>
                              {profile.role === "senior" ? "Senior" : "Junior"}
                            </strong>
                            to{" "}
                            <strong>
                              {determineRole(
                                formData.qualification,
                                formData.experience,
                              ) === "senior"
                                ? "Senior"
                                : "Junior"}
                            </strong>
                            based on your updated information.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-[#3F51B5] text-white rounded-lg hover:bg-[#5C6BC0] transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Password Notice */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-gray-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700">
                Password Management
              </p>
              <p className="text-xs text-gray-500">
                Passwords are managed by system administrators. If you need to
                reset your password, please contact the admin department.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
