import EquipmentBrowser from "./equipment-browser";

type SearchParams = {
  search?: string | string[];
  category?: string | string[];
};

export default async function EquipmentPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  return (
    <EquipmentBrowser
      initialSearch={typeof params.search === "string" ? params.search : ""}
      initialCategory={typeof params.category === "string" ? params.category : ""}
    />
  );
}
