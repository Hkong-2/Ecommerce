import { zodResolver } from '@hookform/resolvers/zod';
import { Key, ShieldCheck, User } from '@phosphor-icons/react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '../../components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../components/ui/form';
import { Input } from '../../components/ui/input';
import { PasswordInput } from '../../components/ui/password-input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  useChangePassword,
  useProfile,
  useUpdateProfile,
} from '../../hooks/useProfile';
import { setUser } from '../../stores/authSlice';

const profileSchema = z.object({
  fullName: z.string().trim().min(2, 'Họ tên phải có ít nhất 2 ký tự.').max(50),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9]{10,11}$/, 'Số điện thoại phải có 10 hoặc 11 chữ số.')
    .or(z.literal('')),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại.'),
    newPassword: z
      .string()
      .min(8, 'Mật khẩu mới phải có ít nhất 8 ký tự.')
      .regex(/[a-z]/, 'Mật khẩu mới phải có chữ thường.')
      .regex(/[A-Z]/, 'Mật khẩu mới phải có chữ hoa.')
      .regex(/[0-9]/, 'Mật khẩu mới phải có chữ số.'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu mới.'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp.',
    path: ['confirmPassword'],
  });

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export function AdminProfilePage() {
  const dispatch = useDispatch();
  const { data: profile, isLoading, isError } = useProfile();
  const { mutate: updateProfile, isPending: isUpdatingProfile } =
    useUpdateProfile();
  const { mutate: changePassword, isPending: isChangingPassword } =
    useChangePassword();

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: {
      fullName: profile?.fullName ?? '',
      phone: profile?.phone ?? '',
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const handleProfileSubmit = (values: ProfileFormValues) => {
    updateProfile(values, {
      onSuccess: (updatedProfile) => {
        dispatch(
          setUser({
            id: String(updatedProfile.id),
            email: updatedProfile.email,
            fullName: updatedProfile.fullName,
            role: updatedProfile.role,
          }),
        );
        toast.success('Đã cập nhật thông tin cá nhân.');
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || 'Không thể cập nhật thông tin.',
        );
      },
    });
  };

  const handlePasswordSubmit = (values: PasswordFormValues) => {
    changePassword(
      {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      },
      {
        onSuccess: () => {
          passwordForm.reset();
          toast.success('Đổi mật khẩu thành công.');
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || 'Không thể đổi mật khẩu.');
        },
      },
    );
  };

  if (isLoading) {
    return <div className="py-16 text-center text-sm text-gray-500">Đang tải hồ sơ...</div>;
  }

  if (isError || !profile) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-red-600">
        Không thể tải thông tin tài khoản.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Tài khoản quản trị
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Quản lý thông tin cá nhân và bảo mật tài khoản.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-700">
            {profile.fullName
              .split(' ')
              .filter(Boolean)
              .slice(-2)
              .map((part) => part[0])
              .join('')
              .toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{profile.fullName}</h2>
            <p className="text-sm text-gray-500">{profile.email}</p>
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
              <ShieldCheck className="h-4 w-4" />
              Quản trị viên
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Thông tin cá nhân
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Key className="h-4 w-4" />
            Bảo mật
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Thông tin tài khoản</h2>
              <p className="mt-1 text-sm text-gray-500">
                Email và quyền tài khoản không thể thay đổi tại đây.
              </p>
            </div>

            <div className="mb-6 grid gap-4 rounded-xl bg-gray-50 p-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Email</p>
                <p className="mt-1 text-sm font-medium text-gray-800">{profile.email}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Ngày tạo</p>
                <p className="mt-1 text-sm font-medium text-gray-800">
                  {new Intl.DateTimeFormat('vi-VN').format(new Date(profile.createdAt))}
                </p>
              </div>
            </div>

            <Form {...profileForm}>
              <form
                onSubmit={profileForm.handleSubmit(handleProfileSubmit)}
                className="space-y-5"
              >
                <FormField
                  control={profileForm.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Họ và tên</FormLabel>
                      <FormControl>
                        <Input placeholder="Nguyễn Văn A" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số điện thoại</FormLabel>
                      <FormControl>
                        <Input inputMode="numeric" placeholder="0912345678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isUpdatingProfile}>
                  {isUpdatingProfile ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
              </form>
            </Form>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Đổi mật khẩu</h2>
              <p className="mt-1 text-sm text-gray-500">
                Mật khẩu mới cần ít nhất 8 ký tự, gồm chữ hoa, chữ thường và chữ số.
              </p>
            </div>

            <Form {...passwordForm}>
              <form
                onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}
                className="space-y-5"
              >
                <FormField
                  control={passwordForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mật khẩu hiện tại</FormLabel>
                      <FormControl>
                        <PasswordInput autoComplete="current-password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mật khẩu mới</FormLabel>
                      <FormControl>
                        <PasswordInput autoComplete="new-password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Xác nhận mật khẩu mới</FormLabel>
                      <FormControl>
                        <PasswordInput autoComplete="new-password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isChangingPassword}>
                  {isChangingPassword ? 'Đang đổi mật khẩu...' : 'Đổi mật khẩu'}
                </Button>
              </form>
            </Form>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
