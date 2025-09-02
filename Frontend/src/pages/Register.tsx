import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserPlus, ArrowLeft } from 'lucide-react';
import RegisterForm from '@/components/auth/RegisterForm';
import GoogleAuthButton from '@/components/auth/GoogleAuthButton';

const Register = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white flex items-center justify-center p-6">
      {/* Animated background effects */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2260%22%20height=%2260%22%20viewBox=%220%200%2060%2060%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill=%22none%22%20fill-rule=%22evenodd%22%3E%3Cg%20fill=%22%23ffffff%22%20fill-opacity=%220.03%22%3E%3Ccircle%20cx=%2230%22%20cy=%2230%22%20r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] animate-pulse"></div>
      <div className="relative z-10 w-full max-w-md">
        {/* Back to home button */}
        <Button 
          asChild 
          variant="ghost" 
          className="mb-6 text-slate-400 hover:text-white"
        >
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>
        <Card className="bg-black/40 backdrop-blur-lg border border-purple-500/30 shadow-2xl shadow-purple-500/10">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <UserPlus className="h-12 w-12 text-cyan-400" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
              </div>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Join the Battle
            </CardTitle>
            <p className="text-slate-400">Create your warrior account</p>
            <Badge variant="outline" className="border-green-400 text-green-400 animate-pulse">
              NEW WARRIOR
            </Badge>
          </CardHeader>
          <CardContent>
            <RegisterForm onSuccess={() => navigate('/dashboard')} />
            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-700" />
              <span className="text-slate-400 text-sm">or</span>
              <div className="h-px flex-1 bg-slate-700" />
            </div>
            <GoogleAuthButton onSuccessNavigate={() => navigate('/dashboard')} className="w-full flex justify-center" />
            <div className="mt-6 text-center">
              <p className="text-slate-400">
                Already a warrior?{' '}
                <Link 
                  to="/login" 
                  className="text-cyan-400 hover:text-cyan-300 font-medium underline"
                >
                  Login to battle
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;