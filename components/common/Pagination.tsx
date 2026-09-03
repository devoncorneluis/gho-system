"use client";

type PaginationProps = {
	page: number;
	pageSize: number;
	total: number;
	onPageChange: (page: number) => void;
};

export default function Pagination({
	page,
	pageSize,
	total,
	onPageChange,
}: PaginationProps) {
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const isFirstPage = page <= 1;
	const isLastPage = page >= totalPages;

	return (
		<div className="mt-6 flex items-center justify-between rounded-xl border bg-white p-4">
			<button
				type="button"
				onClick={() => onPageChange(page - 1)}
				disabled={isFirstPage}
				className="rounded-lg border px-4 py-2 font-semibold text-[#061B33] disabled:cursor-not-allowed disabled:opacity-50"
			>
				Previous
			</button>

			<p className="text-sm font-semibold text-gray-600">
				Page {page} of {totalPages}
			</p>

			<button
				type="button"
				onClick={() => onPageChange(page + 1)}
				disabled={isLastPage}
				className="rounded-lg border px-4 py-2 font-semibold text-[#061B33] disabled:cursor-not-allowed disabled:opacity-50"
			>
				Next
			</button>
		</div>
	);
}
