import EquipmentDetails from "./details-client";

export default async function EquipmentDetailsPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  return <EquipmentDetails name={name} />;
}
