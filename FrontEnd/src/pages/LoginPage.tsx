import { GoogleLoginButton } from '../features/auth/components/GoogleLoginButton';

export const LoginPage = () => {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900">Sign in to your account</h2>
        <div className="flex justify-center mt-4">
          <GoogleLoginButton />
        </div>
      </div>
    </div>
  );
};
