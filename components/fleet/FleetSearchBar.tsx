type Props = {
  search: string;
  setSearch: (value: string) => void;
};

export default function FleetSearchBar({
  search,
  setSearch,
}: Props) {
  return (
    <div className="mb-6">
      <input
        type="text"
        placeholder="Search driver, vehicle or trip..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-lg border px-4 py-2 focus:border-[#0B3A82] focus:outline-none"
      />
    </div>
  );
}