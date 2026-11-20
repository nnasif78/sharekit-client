import EquipmentBrowser from "./equipment-browser";

type SearchParams = {
  search?: string | string[];
  category?: string | string[];
};

export default async function EquipmentPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  return (
    <div className="min-h-screen bg-stone-100 dark:bg-zinc-950">
      <EquipmentBrowser
        initialSearch={typeof params.search === "string" ? params.search : ""}
        initialCategory={typeof params.category === "string" ? params.category : ""}
      />
    </div>
  );
}
