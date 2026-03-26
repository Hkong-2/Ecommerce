import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAddAddress, useUpdateAddress } from '@/hooks/useAddress';
import { type Address } from '@/hooks/useProfile';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useDispatch, useSelector } from 'react-redux';
import { type RootState, type AppDispatch } from '@/stores/store';
import { closeAddressModal } from '@/stores/uiSlice';
import { toast } from 'sonner';
import { useEffect } from 'react';

const addressSchema = z.object({
  receiverName: z.string().min(2, { message: 'Receiver Name is required' }),
  receiverPhone: z.string().regex(/^[0-9]{10,11}$/, { message: 'Phone must be valid' }),
  street: z.string().min(2, { message: 'Street is required' }),
  ward: z.string().min(2, { message: 'Ward is required' }),
  district: z.string().min(2, { message: 'District is required' }),
  city: z.string().min(2, { message: 'City is required' }),
  isDefault: z.boolean().optional(),
});

type AddressFormValues = z.infer<typeof addressSchema>;

interface AddressModalProps {
  addresses: Address[];
}

export function AddressModal({ addresses }: AddressModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { isAddressModalOpen, addressToEdit } = useSelector((state: RootState) => state.ui);

  const { mutate: addAddress, isPending: isAdding } = useAddAddress();
  const { mutate: updateAddress, isPending: isUpdating } = useUpdateAddress();

  const isEditing = addressToEdit !== null;
  const currentAddress = isEditing ? addresses.find(a => a.id === addressToEdit) : null;

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      receiverName: '',
      receiverPhone: '',
      street: '',
      ward: '',
      district: '',
      city: '',
      isDefault: false,
    },
  });

  useEffect(() => {
    if (isAddressModalOpen && currentAddress) {
      form.reset({
        receiverName: currentAddress.receiverName,
        receiverPhone: currentAddress.receiverPhone,
        street: currentAddress.street,
        ward: currentAddress.ward,
        district: currentAddress.district,
        city: currentAddress.city,
        isDefault: currentAddress.isDefault,
      });
    } else if (isAddressModalOpen && !isEditing) {
      form.reset({
        receiverName: '',
        receiverPhone: '',
        street: '',
        ward: '',
        district: '',
        city: '',
        isDefault: false,
      });
    }
  }, [isAddressModalOpen, currentAddress, isEditing, form]);

  function onSubmit(data: AddressFormValues) {
    if (isEditing && addressToEdit !== null) {
      updateAddress({ id: addressToEdit, data }, {
        onSuccess: () => {
          toast.success('Address updated successfully');
          dispatch(closeAddressModal());
        },
        onError: () => toast.error('Failed to update address'),
      });
    } else {
      addAddress(data, {
        onSuccess: () => {
          toast.success('Address added successfully');
          dispatch(closeAddressModal());
        },
        onError: () => toast.error('Failed to add address'),
      });
    }
  }

  const isPending = isAdding || isUpdating;

  return (
    <Dialog open={isAddressModalOpen} onOpenChange={(open) => !open && dispatch(closeAddressModal())}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Address' : 'Add New Address'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="receiverName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Receiver Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="receiverPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Receiver Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="0912345678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
               <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City/Province</FormLabel>
                      <FormControl>
                        <Input placeholder="Hanoi" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="district"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>District</FormLabel>
                      <FormControl>
                        <Input placeholder="Cau Giay" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="ward"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ward</FormLabel>
                      <FormControl>
                        <Input placeholder="Dich Vong" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street/House No.</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Xuan Thuy" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            <FormField
              control={form.control}
              name="isDefault"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="mt-1"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Set as default address</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving...' : 'Save Address'}
                </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
