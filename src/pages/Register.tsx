import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Role, register } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { User, Mail, Lock, Shield, CheckCircle, AlertCircle, UserPlus } from 'lucide-react';

const roles: Role[] = ['student', 'teacher', 'staff', 'alumni', 'admin'];

const roleColors = {
  student: 'bg-blue-100 text-blue-700 border-blue-200',
  teacher: 'bg-emerald-100 text-emerald-700 border-emerald-200', 
  staff: 'bg-purple-100 text-purple-700 border-purple-200',
  alumni: 'bg-orange-100 text-orange-700 border-orange-200',
  admin: 'bg-red-100 text-red-700 border-red-200'
};

export default function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<Role>('student');
  const [adminCode, setAdminCode] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic validation
    if (!name.trim() || !email.trim() || !password) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const res = await register(name.trim(), email.trim(), password, role, adminCode);
      setSuccess(true);
      
      // Redirect after a brief delay to show success message
      setTimeout(() => {
        if (res.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }, 1500);
      
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Registration failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = name.trim() && email.trim() && password && confirmPassword && !loading;

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-600 font-bold">Registration Successful!</CardTitle>
              <CardDescription className="text-gray-600">
                Your account has been created successfully. Redirecting you now...
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="w-8 h-1 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mx-auto animate-pulse"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-lg w-full">
        <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Create Account
            </CardTitle>
            <CardDescription className="text-gray-600">
              Join our university feedback community to make your voice heard
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-6">
              
              {/* Name and Role Row */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <User className="w-4 h-4 text-indigo-500" />
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-sm font-medium text-gray-700">
                    Role
                  </Label>
                  <Select value={role} onValueChange={(v: Role) => setRole(v)}>
                    <SelectTrigger className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((r) => (
                        <SelectItem key={r} value={r}>
                          <div className={`px-2 py-1 rounded-md text-xs font-medium border ${roleColors[r]}`}>
                            {r.charAt(0).toUpperCase() + r.slice(1)}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-indigo-500" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@university.edu"
                  className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                  required
                />
              </div>

              {/* Password Row */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-indigo-500" />
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-indigo-500" />
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className={`border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 transition-colors ${
                      confirmPassword && password !== confirmPassword 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : confirmPassword && password === confirmPassword 
                        ? 'border-green-300 focus:border-green-500 focus:ring-green-500' 
                        : ''
                    }`}
                    required
                  />
                </div>
              </div>

              {/* Admin Code (conditional) */}
              {role === 'admin' && (
                <div className="space-y-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <Label htmlFor="adminCode" className="text-sm font-medium text-red-700 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-red-500" />
                    Admin Code
                  </Label>
                  <Input
                    id="adminCode"
                    type="password"
                    value={adminCode}
                    onChange={(e) => setAdminCode(e.target.value)}
                    placeholder="Enter admin registration code"
                    className="border-red-300 focus:border-red-500 focus:ring-red-500"
                  />
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Admin code may be required depending on system configuration
                  </p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-2.5 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]" 
                disabled={!canSubmit}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating Account...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Create Account
                  </div>
                )}
              </Button>

              {/* Login Link */}
              <div className="text-center text-sm text-gray-600 pt-4 border-t border-gray-100">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="text-indigo-600 hover:text-indigo-700 font-medium hover:underline transition-colors"
                >
                  Sign in here
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
        
        {/* Background decoration */}
        <div className="absolute top-20 left-10 w-2 h-2 bg-indigo-300 rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute bottom-32 right-16 w-3 h-3 bg-purple-300 rounded-full opacity-40 animate-bounce"></div>
        <div className="absolute top-1/3 right-8 w-1.5 h-1.5 bg-pink-300 rounded-full opacity-50 animate-ping"></div>
      </div>
    </div>
  );
}