type Platform = {
  id: string;
  name: string;
  company_name: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  package_name: string | null;
  status: string | null;
};

type Props = {
  platforms: Platform[];
};

export default function PlatformCards({
  platforms,
}: Props) {
  return (
    <div className="bg-white rounded-xl shadow p-6 mt-6">
      <h2 className="text-xl font-bold mb-4">Platforms</h2>

      {platforms.length === 0 && (
        <p className="text-gray-500">No platforms created yet.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {platforms.map((platform) => (
          <div
            key={platform.id}
            className="border rounded-xl p-5"
          >
            <p className="text-xl font-bold text-[#061B33]">
              {platform.name}
            </p>

            <p>
              <strong>Company:</strong> {platform.company_name}
            </p>

            <p>
              <strong>Contact:</strong> {platform.contact_name}
            </p>

            <p>
              <strong>Email:</strong> {platform.contact_email}
            </p>

            <p>
              <strong>Phone:</strong> {platform.contact_phone}
            </p>

            <p>
              <strong>Package:</strong> {platform.package_name}
            </p>

            <p>
              <strong>Status:</strong> {platform.status}
            </p>

            <p className="mt-2 text-xs text-gray-500">
              Platform ID: {platform.id}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}