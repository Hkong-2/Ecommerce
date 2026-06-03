import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { useAddAddress, useUpdateAddress } from '../../hooks/useAddress';
import { type Address } from '../../hooks/useProfile';
import {
  useShippingDistricts,
  useShippingProvinces,
  useShippingWards,
} from '../../hooks/useShipping';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { type RootState, type AppDispatch } from '../../stores/store';
import { closeAddressModal } from '../../stores/uiSlice';

const addressSchema = z.object({
  receiverName: z.string().min(2, { message: 'Receiver Name is required' }),
  receiverPhone: z
    .string()
    .regex(/^[0-9]{10,11}$/, { message: 'Phone must be valid' }),
  street: z.string().min(2, { message: 'Street is required' }),
  ward: z.string().min(1, { message: 'Ward is required' }),
  district: z.string().min(1, { message: 'District is required' }),
  city: z.string().min(1, { message: 'City is required' }),
  provinceId: z.number({ message: 'Province is required' }),
  districtId: z.number({ message: 'District is required' }),
  wardCode: z.string().min(1, { message: 'Ward is required' }),
  isDefault: z.boolean().optional(),
});

type AddressFormValues = z.infer<typeof addressSchema>;

interface AddressModalProps {
  addresses: Address[];
}

export function AddressModal({ addresses }: AddressModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { isAddressModalOpen, addressToEdit } = useSelector(
    (state: RootState) => state.ui,
  );

  const { mutate: addAddress, isPending: isAdding } = useAddAddress();
  const { mutate: updateAddress, isPending: isUpdating } = useUpdateAddress();

  const isEditing = addressToEdit !== null;
  const currentAddress = isEditing
    ? addresses.find((address) => address.id === addressToEdit)
    : null;

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      receiverName: '',
      receiverPhone: '',
      street: '',
      ward: '',
      district: '',
      city: '',
      provinceId: undefined,
      districtId: undefined,
      wardCode: '',
      isDefault: false,
    },
  });

  const selectedProvinceId = form.watch('provinceId');
  const selectedDistrictId = form.watch('districtId');
  const { data: provinces = [], isLoading: isLoadingProvinces } =
    useShippingProvinces();
  const { data: districts = [], isLoading: isLoadingDistricts } =
    useShippingDistricts(selectedProvinceId);
  const { data: wards = [], isLoading: isLoadingWards } =
    useShippingWards(selectedDistrictId);

  useEffect(() => {
    if (isAddressModalOpen && currentAddress) {
      form.reset({
        receiverName: currentAddress.receiverName,
        receiverPhone: currentAddress.receiverPhone,
        street: currentAddress.street,
        ward: currentAddress.ward,
        district: currentAddress.district,
        city: currentAddress.city,
        provinceId: currentAddress.provinceId ?? undefined,
        districtId: currentAddress.districtId ?? undefined,
        wardCode: currentAddress.wardCode ?? '',
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
        provinceId: undefined,
        districtId: undefined,
        wardCode: '',
        isDefault: false,
      });
    }
  }, [isAddressModalOpen, currentAddress, isEditing, form]);

  function handleProvinceChange(value: string) {
    const provinceId = Number(value);
    const province = provinces.find((item) => item.id === provinceId);

    form.setValue('provinceId', provinceId, { shouldValidate: true });
    form.setValue('city', province?.name || '', { shouldValidate: true });
    form.setValue('districtId', undefined as unknown as number);
    form.setValue('district', '');
    form.setValue('wardCode', '');
    form.setValue('ward', '');
  }

  function handleDistrictChange(value: string) {
    const districtId = Number(value);
    const district = districts.find((item) => item.id === districtId);

    form.setValue('districtId', districtId, { shouldValidate: true });
    form.setValue('district', district?.name || '', { shouldValidate: true });
    form.setValue('wardCode', '');
    form.setValue('ward', '');
  }

  function handleWardChange(value: string) {
    const ward = wards.find((item) => item.code === value);

    form.setValue('wardCode', value, { shouldValidate: true });
    form.setValue('ward', ward?.name || '', { shouldValidate: true });
  }

  function onSubmit(data: AddressFormValues) {
    if (isEditing && addressToEdit !== null) {
      updateAddress(
        { id: addressToEdit, data },
        {
          onSuccess: () => {
            toast.success('Address updated successfully');
            dispatch(closeAddressModal());
          },
          onError: () => toast.error('Failed to update address'),
        },
      );
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
    <Dialog
      open={isAddressModalOpen}
      onOpenChange={(open) => !open && dispatch(closeAddressModal())}
    >
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Address' : 'Add New Address'}
          </DialogTitle>
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="provinceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City/Province</FormLabel>
                    <Select
                      value={field.value ? String(field.value) : undefined}
                      onValueChange={handleProvinceChange}
                      disabled={isLoadingProvinces}
                    >
                      <FormControl>
                        <SelectTrigger className="h-10 w-full rounded-md text-sm">
                          <SelectValue
                            placeholder={
                              isLoadingProvinces
                                ? 'Loading...'
                                : 'Select province'
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {provinces.map((province) => (
                          <SelectItem
                            key={province.id}
                            value={String(province.id)}
                          >
                            {province.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="districtId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>District</FormLabel>
                    <Select
                      value={field.value ? String(field.value) : undefined}
                      onValueChange={handleDistrictChange}
                      disabled={!selectedProvinceId || isLoadingDistricts}
                    >
                      <FormControl>
                        <SelectTrigger className="h-10 w-full rounded-md text-sm">
                          <SelectValue
                            placeholder={
                              isLoadingDistricts
                                ? 'Loading...'
                                : 'Select district'
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {districts.map((district) => (
                          <SelectItem
                            key={district.id}
                            value={String(district.id)}
                          >
                            {district.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="wardCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ward</FormLabel>
                    <Select
                      value={field.value || undefined}
                      onValueChange={handleWardChange}
                      disabled={!selectedDistrictId || isLoadingWards}
                    >
                      <FormControl>
                        <SelectTrigger className="h-10 w-full rounded-md text-sm">
                          <SelectValue
                            placeholder={
                              isLoadingWards ? 'Loading...' : 'Select ward'
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {wards.map((ward) => (
                          <SelectItem key={ward.code} value={ward.code}>
                            {ward.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
