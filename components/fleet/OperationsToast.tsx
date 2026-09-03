"use client";

type Props = {
  title: string;
  message: string;
  type?: "success" | "warning" | "danger" | "info";
  onClose: () => void;
};

export default function OperationsToast({
  title,
  message,
  type = "info",
  onClose,
}: Props) {
  const colours = {
    success: "border-green-500 bg-green-50",
    warning: "border-yellow-500 bg-yellow-50",
    danger: "border-red-500 bg-red-50",
    info: "border-blue-500 bg-blue-50",
  };

  return (
    <div
      className={`fixed top-6 right-6 z-50 w-96 rounded-xl border-l-4 p-4 shadow-xl ${colours[type]}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold">{title}</h3>

          <p className="mt-1 text-sm text-gray-700">
            {message}
          </p>
        </div>

        <button
          onClick={onClose}
          className="ml-4 text-lg font-bold text-gray-500 hover:text-black"
        >
          ×
        </button>
      </div>
    </div>
  );
}