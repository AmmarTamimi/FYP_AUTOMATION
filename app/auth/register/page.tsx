// app/(auth)/register/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  BookOpen,
  Upload,
  Send,
  CheckCircle,
  FileText,
  Lock,
  Plus,
  X,
} from "lucide-react";

interface Member {
  name: string;
  email: string;
  rollNo: string;
  section: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [customDomain, setCustomDomain] = useState("");

  const [formData, setFormData] = useState({
    groupUsername: "",
    deptId: "",
    domain: [] as string[],
    projectTitle: "",
    supervisorEmail: "",
  });

  const [members, setMembers] = useState<Member[]>([
    { name: "", email: "", rollNo: "", section: "" },
    { name: "", email: "", rollNo: "", section: "" },
    { name: "", email: "", rollNo: "", section: "" },
  ]);

  const [proposalFile, setProposalFile] = useState<File | null>(null);

  // Domain options
  const domainOptions = [
    "Artificial Intelligence",
    "Machine Learning",
    "Web Development",
    "Mobile Development",
    "Cloud Computing",
    "Cybersecurity",
    "Data Science",
    "Internet of Things (IoT)",
    "Blockchain",
    "DevOps",
  ];

  // Department options
  const departmentOptions = [
    "Computer Science",
    "Software Engineering",
    "Data Science",
    "Artificial Intelligence",
  ];

  const validateNUEmail = (email: string): boolean => {
    return /^k\d{6}@nu\.edu\.pk$/i.test(email);
  };

  const handleMemberChange = (
    index: number,
    field: keyof Member,
    value: string
  ) => {
    const updated = [...members];
    updated[index][field] = value;

    // Auto-fill roll number from email if email changes
    if (field === "email" && value) {
      const rollMatch = value.match(/(k\d{6})@/i);
      if (rollMatch && !updated[index].rollNo) {
        updated[index].rollNo = rollMatch[1];
      }
    }

    setMembers(updated);
  };

  const handleDomainToggle = (domain: string) => {
    setFormData((prev) => ({
      ...prev,
      domain: prev.domain.includes(domain)
        ? prev.domain.filter((d) => d !== domain)
        : [...prev.domain, domain],
    }));
  };

  const handleAddCustomDomain = () => {
    if (customDomain.trim() && !formData.domain.includes(customDomain.trim())) {
      setFormData((prev) => ({
        ...prev,
        domain: [...prev.domain, customDomain.trim()],
      }));
      setCustomDomain("");
    }
  };

  const handleRemoveDomain = (domain: string) => {
    setFormData((prev) => ({
      ...prev,
      domain: prev.domain.filter((d) => d !== domain),
    }));
  };

  const isFormValid = () => {
    if (
      !formData.groupUsername ||
      !formData.deptId ||
      formData.domain.length === 0 ||
      !formData.projectTitle ||
      !formData.supervisorEmail
    ) {
      return false;
    }

    // Check first two members are filled
    const firstTwoValid =
      members[0].name &&
      members[0].email &&
      members[0].rollNo &&
      members[0].section &&
      members[1].name &&
      members[1].email &&
      members[1].rollNo &&
      members[1].section;

    if (!firstTwoValid) return false;

    // Check third member - if partially filled, must be fully filled
    const third = members[2];
    const thirdPartiallyFilled =
      third.name || third.email || third.rollNo || third.section;
    if (thirdPartiallyFilled) {
      if (!third.name || !third.email || !third.rollNo || !third.section)
        return false;
    }

    // Check email formats for filled members
    for (let i = 0; i < 2; i++) {
      if (!validateNUEmail(members[i].email)) return false;
    }
    if (thirdPartiallyFilled && !validateNUEmail(third.email)) return false;

    if (!proposalFile) return false;

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

      // Filter out empty members (only keep those with at least a name)
    const filteredMembers = members.filter(m => m.name && m.email && m.rollNo && m.section);
    
    if (filteredMembers.length < 2) {
      setError("At least two members are required");
      return;
    }
    
    setLoading(true);
    setError("");
    const submitData = new FormData();
    submitData.append('groupUsername',formData.groupUsername);
    submitData.append('deptName',formData.deptId);
    submitData.append('projectTitle',formData.projectTitle);
    submitData.append('supervisorEmail',formData.supervisorEmail);
    submitData.append('domain',JSON.stringify(formData.domain));
    if(proposalFile){
      submitData.append('document',proposalFile)
    }
    submitData.append('members',JSON.stringify(filteredMembers));
    submitData.append('leaderEmail',filteredMembers[0].email);

    try {
      const response = await fetch('/api/auth/register',{
        method: "POST",
        body: submitData,
      });
      const data = await response.json();

      console.log("Response data:", data);
      if(response.ok){
        setSubmitted(true);
      }else{
        setError("Registration failed");
      }
    } catch (error) {
      console.log("Submit data error: ",error);
      setError("Something went wrong");
    } finally{
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Registration Submitted!
          </h2>
          <p className="text-gray-500 mb-4">
            Your group registration has been submitted for admin review.
          </p>
          <p className="text-sm text-gray-400 mb-6">
            The group leader will receive an email once your registration is
            approved.
          </p>
          <Link
            href="/auth/login"
            className="inline-block bg-[#3F51B5] text-white px-6 py-2 rounded-lg hover:bg-[#5C6BC0] transition-colors"
          >
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#3F51B5] rounded-lg shadow-md mb-4">
            <Users className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Student Group Registration
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Register your FYP group. Admin review required before activation.
          </p>
        </div>

        {/* Registration Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-md border border-gray-100 p-6 space-y-6"
        >
          {/* Group Account Section */}
          <div className="border-b border-gray-100 pb-4">
            <h3 className="text-md font-medium text-gray-800 mb-4 flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#3F51B5]" />
              Group Account
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Group Username *
                </label>
                <input
                  type="text"
                  required
                  value={formData.groupUsername}
                  onChange={(e) =>
                    setFormData({ ...formData, groupUsername: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3F51B5]"
                  placeholder="fyp_group_2024_01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department *
                </label>
                <select
                  required
                  value={formData.deptId}
                  onChange={(e) =>
                    setFormData({ ...formData, deptId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3F51B5]"
                >
                  <option value="">Select Department</option>
                  {departmentOptions.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Group Members Section */}
          <div className="border-b border-gray-100 pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-md font-medium text-gray-800 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#3F51B5]" />
                Group Members (Minimum 2, Maximum 3)
              </h3>
            </div>

            {members.map((member, index) => {
              const isLeader = index === 0;
              const memberNumber = index + 1;

              return (
                <div key={index} className="bg-gray-50 rounded-lg p-4 mb-3">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm font-medium text-gray-600">
                      {isLeader ? "Group Leader" : `Member ${memberNumber}`}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required={memberNumber !== 3}
                        value={member.name}
                        onChange={(e) =>
                          handleMemberChange(index, "name", e.target.value)
                        }
                        className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3F51B5]"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Roll Number *
                      </label>
                      <input
                        type="text"
                        required={memberNumber !== 3}
                        value={member.rollNo}
                        onChange={(e) =>
                          handleMemberChange(index, "rollNo", e.target.value)
                        }
                        className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3F51B5]"
                        placeholder="k213094"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        NU Email *
                      </label>
                      <input
                        type="email"
                        required={memberNumber !== 3}
                        value={member.email}
                        onChange={(e) =>
                          handleMemberChange(index, "email", e.target.value)
                        }
                        className={`w-full px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3F51B5] ${
                          member.email && !validateNUEmail(member.email)
                            ? "border-red-500 bg-red-50"
                            : "border-gray-200"
                        }`}
                        placeholder="k213094@nu.edu.pk"
                      />
                      {member.email && !validateNUEmail(member.email) && (
                        <p className="text-xs text-red-500 mt-1">
                          Invalid NU email format
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Section *
                      </label>
                      <input
                        type="text"
                        required={memberNumber !== 3}
                        value={member.section}
                        onChange={(e) =>
                          handleMemberChange(index, "section", e.target.value)
                        }
                        className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3F51B5]"
                        placeholder="BCS-1A"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Project Details Section */}
          <div className="border-b border-gray-100 pb-4">
            <h3 className="text-md font-medium text-gray-800 mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#3F51B5]" />
              Project Details
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.projectTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, projectTitle: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3F51B5]"
                  placeholder="Enter your project title"
                />
              </div>

              {/* Domain Selection with Custom Domain Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Domain(s) * (Select multiple or add custom)
                </label>

                {/* Selected Domains Display */}
                {formData.domain.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.domain.map((domain) => (
                      <span
                        key={domain}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#3F51B5] text-white rounded-full text-sm"
                      >
                        {domain}
                        <button
                          type="button"
                          onClick={() => handleRemoveDomain(domain)}
                          className="hover:text-gray-200 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Predefined Domain Chips */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {domainOptions.map((domain) => (
                    <button
                      key={domain}
                      type="button"
                      onClick={() => handleDomainToggle(domain)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                        formData.domain.includes(domain)
                          ? "bg-[#3F51B5] text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {domain}
                    </button>
                  ))}
                </div>

                {/* Custom Domain Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCustomDomain();
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3F51B5] text-sm"
                    placeholder="Enter custom domain..."
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomDomain}
                    disabled={!customDomain.trim()}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Click on chips to select, or type your own domain and click Add
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supervisor Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.supervisorEmail}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      supervisorEmail: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3F51B5]"
                  placeholder="supervisor@nu.edu.pk"
                />
              </div>
            </div>
          </div>

          {/* Proposal Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Proposal (PDF) *
            </label>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-[#3F51B5] transition-colors">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500 mb-1">
                Click or drag & drop your proposal
              </p>
              <p className="text-xs text-gray-400">PDF files only (Max 5MB)</p>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setProposalFile(e.target.files?.[0] || null)}
                className="hidden"
                id="proposal-upload"
              />
              <button
                type="button"
                onClick={() =>
                  document.getElementById("proposal-upload")?.click()
                }
                className="mt-2 text-sm text-[#3F51B5] hover:text-[#5C6BC0]"
              >
                Browse Files
              </button>
              {proposalFile && (
                <p className="mt-2 text-sm text-green-600 flex items-center justify-center gap-1">
                  <FileText className="w-3 h-3" />
                  {proposalFile.name}
                </p>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !isFormValid()}
            className={`w-full py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 ${
              isFormValid() && !loading
                ? "bg-[#3F51B5] hover:bg-[#5C6BC0] text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit for Admin Review</span>
              </>
            )}
          </button>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="text-[#3F51B5] hover:text-[#5C6BC0]">
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}