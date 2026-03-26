import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUpdateProfile } from '../../hooks/useProfile';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../components/ui/form';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';

const profileSchema = z.object({
  fullName: z.string().min(2, { message: 'Full name must be at least 2 characters.' }),
  phone: z.string().regex(/^[0-9]{10,11}$/, { message: 'Phone must be 10 or 11 digits.' }).optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  initialData: {
    fullName: string;
    phone: string | null;
  };
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: initialData.fullName || '',
      phone: initialData.phone || '',
    },
  });

  function onSubmit(data: ProfileFormValues) {
    updateProfile(data, {
      onSuccess: () => {
        toast.success('Profile updated successfully');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to update profile');
      },
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4 border-t pt-4">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="0912345678" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </Form>
  );
}