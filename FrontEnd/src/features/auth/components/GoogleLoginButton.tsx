import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../stores/useAuthStore';
import axiosClient from '../../../api/axiosClient';

export const GoogleLoginButton = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleSuccess = async (credentialResponse: any) => {
    try {
      const response: any = await axiosClient.post('/auth/google', {
        token: credentialResponse.credential,
      });

      login(response.user, response.access_token);

      if (response.user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Login failed', error);
      // Handle error notification here
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={() => {
        console.error('Login Failed');
      }}
    />
  );
};
