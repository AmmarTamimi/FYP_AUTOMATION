// app/register-teacher/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User, 
  Mail, 
  Lock, 
  Briefcase, 
  BookOpen, 
  Award, 
  School,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  GraduationCap
} from 'lucide-react';

export default function RegisterTeacherPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    specialization: '',
    qualification: '',
    experience: '',
    designation: '',
  });

  const departmentOptions = [
    'Computer Science',
    'Software Engineering',
    'Data Science',
    'Artificial Intelligence',
    'Electrical Engineering'
  ];

  const designationOptions = [
    'Lab Instructor',
    'Lecturer',
    'Assistant Professor',
    'Professor'
  ];

  const qualificationOptions = [
    'BS',
    'MS',
    'MPhil',
    'PhD',
    'Post Doctorate'
  ];

  const validateEmail = (email: string): boolean => {
    return /^[A-Za-z0-9._%+-]+@nu\.edu\.pk$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateEmail(formData.email)) {
      setError('Please use a valid @nu.edu.pk email address');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register-teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          department: formData.department,
          specialization: formData.specialization,
          qualification: formData.qualification,
          experience: parseInt(formData.experience),
          designation: formData.designation,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Registration successful! Your account is pending admin approval.');
        setTimeout(() => router.push('/login'), 5000);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#3F51B5] rounded-lg shadow-md mb-4">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-800">Register as Teacher</h1>
          <p className="text-sm text-gray-500 mt-1">Create your faculty account for the FYP Automation System</p>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start gap-2">
              <CheckCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Registration Submitted!</p>
                <p className="text-sm mt-1">{success}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Error</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3F51B5]"
                  placeholder="Dr. John Smith"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3F51B5]"
                  placeholder="john.smith@nu.edu.pk"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Must be a valid @nu.edu.pk email address</p>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-9 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3F51B5]"
                  placeholder="Min 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full pl-9 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3F51B5]"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                </button>
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <School className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  required
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3F51B5]"
                >
                  <option value="">Select Department</option>
                  {departmentOptions.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Specialization */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specialization *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <BookOpen className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3F51B5]"
                  placeholder="Artificial Intelligence"
                />
              </div>
            </div>

            {/* Qualification */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Qualification *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Award className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  required
                  value={formData.qualification}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3F51B5]"
                >
                  <option value="">Select Qualification</option>
                  {qualificationOptions.map((qual) => (
                    <option key={qual} value={qual}>{qual}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Experience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years) *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Briefcase className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="number"
                  required
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3F51B5]"
                  placeholder="Years of experience"
                  min="0"
                />
              </div>
            </div>

            {/* Designation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Designation *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Briefcase className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  required
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3F51B5]"
                >
                  <option value="">Select Designation</option>
                  {designationOptions.map((desig) => (
                    <option key={desig} value={desig}>{desig}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#3F51B5] hover:bg-[#5C6BC0] text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <GraduationCap className="w-4 h-4" />
                  <span>Register as Teacher</span>
                </>
              )}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="text-[#3F51B5] hover:text-[#5C6BC0] font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}