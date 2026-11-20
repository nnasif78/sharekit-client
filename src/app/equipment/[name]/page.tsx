import EquipmentDetails from "./details-client";

export default async function EquipmentDetailsPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  return (
    <div className="min-h-screen bg-stone-100 text-zinc-900 dark:bg-zinc-950 dark:text-stone-100">
      <EquipmentDetails name={name} />
    </div>
  );
}
