"use client";
type Props = {
  trips: number;
  passengers: number;
  drivers: number;
  vehicles: number;
};

export default function DispatchSummary({
  trips,
  passengers,
  drivers,
  vehicles,
}: Props) {
  return (
    <div className="rounded-xl bg-gradient-to-r from-[#061B33] to-blue-700 p-6 text-white shadow-lg">
      <h2 className="text-3xl font-bold">
        🚀 Today&apos;s Dispatch Summary
      </h2>
      <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-4">
        <div>
          <p className="text-sm opacity-80">Trips</p>
          <p className="text-4xl font-black">{trips}</p>
        </div>
        <div>
          <p className="text-sm opacity-80">Passengers</p>
          <p className="text-4xl font-black">{passengers}</p>
        </div>
        <div>
          <p className="text-sm opacity-80">Drivers</p>
          <p className="text-4xl font-black">{drivers}</p>
        </div>
        <div>
          <p className="text-sm opacity-80">Vehicles</p>
          <p className="text-4xl font-black">{vehicles}</p>
        </div>
      </div>
    </div>
  );
}
