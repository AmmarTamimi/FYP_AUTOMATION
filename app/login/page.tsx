// app/(auth)/login/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, LogIn, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [activeRole, setActiveRole] = useState<'student' | 'admin' | 'teacher'>('student');
    const [emailError, setEmailError] = useState('');

    useEffect(() => {
        fetchDepartments()
    }, [])

    const fetchDepartments = async() => {
        try {
            
        } catch (error) {
            
        }
    }

    // Email validation function for @nu.edu.pk domain
    const validateEmail = (email: string): boolean => {
        // Trim and convert to lowercase for case-insensitive comparison
        const trimmedEmail = email.trim().toLowerCase();
        
        // Check if email ends with @nu.edu.pk
        if (!trimmedEmail.endsWith('@nu.edu.pk')) {
            return false;
        }

        // Check if there's a username before the @ symbol
        const usernamePart = trimmedEmail.split('@')[0];
        if (!usernamePart || usernamePart.length === 0) {
            return false;
        }

        return true;
    };

    // Real-time email validation on input change
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setIdentifier(value);
        
        // Only validate for admin and teacher roles (not student)
        if (activeRole !== 'student') {
            if (value && !validateEmail(value)) {
                setEmailError('Email must be @nu.edu.pk domain');
            } else {
                setEmailError('');
            }
        } else {
            setEmailError('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // Validate email before submitting (for admin and teacher)
        if (activeRole !== 'student') {
            if (!validateEmail(identifier)) {
                setError('Please use a valid @nu.edu.pk email address');
                setLoading(false);
                return;
            }
        }

        // Use UPPERCASE consistently
        const role = activeRole === 'student' ? 'STUDENT' : 
                    activeRole === 'admin' ? 'ADMIN' : 'TEACHER';

        const formData = new FormData();
        formData.append('email', identifier);
        formData.append('pass', password);
        formData.append('role', role);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            
            if (!response.ok) {
                setError(data.message || "Login failed");
                return;
            }
            
            console.log("User logged in:", data.user);
            
            // Create NextAuth session with consistent role
            await signIn('credentials', {
                identifier: data.user.email || data.user.name,
                password: password,
                role: role,
                redirect: false,
            });
            
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Redirect based on role
            if (data.user.role === 'ADMIN') {
                router.push('/admin/dashboard');
            } else if (data.user.role === 'TEACHER') {
                router.push('/teacher/dashboard');
            } else if (data.user.role === 'STUDENT') {
                router.push('/student/dashboard');
            }
            
        } catch (error) {
            console.error("Login error:", error);
            setError("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md">
                {/* Logo/Brand Section */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-[#3F51B5] rounded-lg shadow-md mb-4">
                        <span className="text-white text-xl font-bold">FYP</span>
                    </div>
                    <h1 className="text-2xl font-semibold text-gray-800">FYP Automation System</h1>
                    <p className="text-sm text-gray-500 mt-1">Final Year Project Management</p>
                </div>

                {/* Role Selector - Clean Tabs */}
                <div className="bg-gray-100 rounded-lg p-1 mb-6">
                    <div className="flex gap-1">
                        <button
                            onClick={() => {
                                setActiveRole('student');
                                setEmailError('');
                                setError('');
                            }}
                            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                                activeRole === 'student'
                                    ? 'bg-white text-[#3F51B5] shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Student Group
                        </button>
                        <button
                            onClick={() => {
                                setActiveRole('teacher');
                                setEmailError('');
                                setError('');
                            }}
                            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                                activeRole === 'teacher'
                                    ? 'bg-white text-[#3F51B5] shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Teacher
                        </button>
                        <button
                            onClick={() => {
                                setActiveRole('admin');
                                setEmailError('');
                                setError('');
                            }}
                            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                                activeRole === 'admin'
                                    ? 'bg-white text-[#3F51B5] shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Admin
                        </button>
                    </div>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {/* Identifier Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {activeRole === 'student' ? 'Group Username' : 'Email Address'}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type={activeRole === 'student' ? 'text' : 'email'}
                                    required
                                    value={identifier}
                                    onChange={handleEmailChange}
                                    className={`w-full pl-9 pr-3 py-2 border rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3F51B5] focus:border-transparent transition-all ${
                                        emailError && activeRole !== 'student' 
                                            ? 'border-red-500' 
                                            : 'border-gray-200'
                                    }`}
                                    placeholder={
                                        activeRole === 'student' 
                                            ? "Enter group username" 
                                            : activeRole === 'admin' 
                                                ? "admin@nu.edu.pk" 
                                                : "teacher@nu.edu.pk"
                                    }
                                />
                            </div>
                            {emailError && activeRole !== 'student' && (
                                <p className="mt-1 text-xs text-red-500">{emailError}</p>
                            )}
                           
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-9 pr-10 py-2 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3F51B5] focus:border-transparent transition-all"
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Forgot Password */}
                        <div className="flex justify-end">
                            <button
                                type="button"
                                className="text-xs text-[#3F51B5] hover:text-[#5C6BC0] transition-colors"
                            >
                                Forgot password?
                            </button>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || (activeRole !== 'student' && !!emailError)}
                            className="w-full bg-[#3F51B5] hover:bg-[#5C6BC0] text-white font-medium py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-4 h-4" />
                                    <span>Sign In</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Register Link */}
                    {activeRole === 'student' &&  <p className="mt-6 text-center text-sm text-gray-500">
                        Don't have an account?{' '}
                        <Link href="/register" className="text-[#3F51B5] hover:text-[#5C6BC0] font-medium">
                            Register as Student Group
                        </Link>
                    </p>}
                </div>
            </div>
        </div>
    );
}