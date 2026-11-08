import VehicleForm from '../../../components/VehicleForm';

export const metadata = { title: 'Edit vehicle | Best Drive Motors Admin' };

export default async function EditVehiclePage({ params }) {
  const { id } = await params;
  return <VehicleForm vehicleId={id} />;
}