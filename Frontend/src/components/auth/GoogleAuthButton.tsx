import { useState } from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface GoogleAuthButtonProps {
  text?: string;
  className?: string;
  onSuccessNavigate?: () => void;
}

const GoogleAuthButton = ({ text = 'Continue with Google', className, onSuccessNavigate }: GoogleAuthButtonProps) => {
  const { loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  const doBackendLogin = async (idToken: string) => {
    setLoading(true);
    try {
      const ok = await loginWithGoogle(idToken);
      if (ok) {
        toast.success('Signed in with Google');
        onSuccessNavigate?.();
      } else {
        toast.error('Google sign-in failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={className || 'w-full flex justify-center'}>
      <GoogleLogin
        onSuccess={async (credentialResponse: CredentialResponse) => {
          try {
            const idToken = credentialResponse.credential;
            if (!idToken) {
              toast.error('No credential received from Google');
              return;
            }
            await doBackendLogin(idToken);
          } catch (e) {
            console.error(e);
            toast.error('Google authentication error');
          }
        }}
        onError={() => toast.error('Google authentication canceled or failed')}
        useOneTap={false}
        text={text as any}
      />
    </div>
  );
};

export default GoogleAuthButton;
