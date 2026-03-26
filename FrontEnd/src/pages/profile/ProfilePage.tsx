import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useProfile } from '../../hooks/useProfile';
import { useDeleteAddress } from '../../hooks/useAddress';
import { useDispatch } from 'react-redux';
import { type AppDispatch } from '../../stores/store';
import { openAddressModal } from '../../stores/uiSlice';
import { Button } from '../../components/ui/button';
import { ProfileForm } from './ProfileForm';
import { AddressModal } from './AddressModal';

export default function ProfilePage() {
  const { mutate: deleteAddress } = useDeleteAddress();
  const { data: profile, isLoading, isError } = useProfile();
  const dispatch = useDispatch<AppDispatch>();

  if (isLoading) return <div className="p-8">Loading profile...</div>;
  if (isError) return <div className="p-8 text-red-500">Error loading profile.</div>;
  if (!profile) return null;

  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="info">Personal Info</TabsTrigger>
          <TabsTrigger value="addresses">Address Book</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4">
          <div className="border p-6 rounded-lg bg-white shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Account Details</h2>
            <div className="grid gap-2">
              <p><span className="font-medium">Email:</span> {profile.email}</p>
              <p><span className="font-medium">Full Name:</span> {profile.fullName}</p>
              <p><span className="font-medium">Phone:</span> {profile.phone || 'Not provided'}</p>
              <p><span className="font-medium">Role:</span> {profile.role}</p>
            </div>
            <ProfileForm initialData={{ fullName: profile.fullName, phone: profile.phone }} />
          </div>
        </TabsContent>

        <TabsContent value="addresses" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Saved Addresses</h2>
            <Button onClick={() => dispatch(openAddressModal(null))}>Add New Address</Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {profile.addresses?.map(address => (
              <div key={address.id} className={`border p-4 rounded-lg shadow-sm ${address.isDefault ? 'border-blue-500 ring-1 ring-blue-500' : ''}`}>
                <div className="flex justify-between">
                  <h3 className="font-bold">{address.receiverName}</h3>
                  {address.isDefault && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Default</span>}
                </div>
                <p className="text-sm mt-1">{address.receiverPhone}</p>
                <p className="text-sm text-gray-600 mt-2">{address.street}</p>
                <p className="text-sm text-gray-600">{address.ward}, {address.district}</p>
                <p className="text-sm text-gray-600">{address.city}</p>

                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => dispatch(openAddressModal(address.id))}>Edit</Button>
                  <Button variant="destructive" size="sm" onClick={() => { if(confirm('Are you sure you want to delete this address?')) deleteAddress(address.id) }}>Delete</Button>
                </div>
              </div>
            ))}
            {profile.addresses?.length === 0 && (
              <div className="col-span-2 text-center py-8 text-gray-500 border rounded-lg border-dashed">
                You have no saved addresses.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <AddressModal addresses={profile.addresses} />
    </div>
  );
}
