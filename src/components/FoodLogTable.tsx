import type { FoodLogEntry } from "@/lib/types";

type FoodLogTableProps = {
  entries: FoodLogEntry[];
  onDeleteEntry: (id: string) => void;
  onClearEntries: () => void;
};

function formatTime(isoDate: string) {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(isoDate));
}

export default function FoodLogTable({
  entries,
  onDeleteEntry,
  onClearEntries,
}: FoodLogTableProps) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-sm">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Food Log</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Logged foods appear here after calculation.
          </p>
        </div>

        {entries.length > 0 ? (
          <button
            onClick={onClearEntries}
            className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:bg-zinc-900"
          >
            Clear all
          </button>
        ) : null}
      </div>

      {entries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 p-8 text-center text-sm text-zinc-500">
          No foods logged yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-xs uppercase tracking-wide text-zinc-500">
                <th className="py-3 pr-4">Time</th>
                <th className="py-3 pr-4">Food</th>
                <th className="py-3 pr-4">Amount</th>
                <th className="py-3 pr-4 text-right">Calories</th>
                <th className="py-3 pr-4 text-right">Protein</th>
                <th className="py-3 pr-4 text-right">Carbs</th>
                <th className="py-3 pr-4 text-right">Fat</th>
                <th className="py-3 pr-4 text-right">Sugar</th>
                <th className="py-3 pr-4 text-right">Sodium</th>
                <th className="py-3 text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-b border-zinc-900">
                  <td className="py-4 pr-4 text-zinc-400">
                    {formatTime(entry.createdAt)}
                  </td>

                  <td className="py-4 pr-4">
                    <p className="font-medium text-white">{entry.name}</p>
                    {entry.brand ? (
                      <p className="text-xs text-zinc-500">{entry.brand}</p>
                    ) : null}
                  </td>

                  <td className="py-4 pr-4 text-zinc-300">
                    {entry.consumedAmountValue} {entry.consumedAmountUnit}
                    <p className="text-xs text-zinc-500">
                      {entry.scaleFactor.toFixed(2)}x serving
                    </p>
                  </td>

                  <td className="py-4 pr-4 text-right text-zinc-200">
                    {entry.logged.calories} kcal
                  </td>

                  <td className="py-4 pr-4 text-right text-zinc-200">
                    {entry.logged.proteinG} g
                  </td>

                  <td className="py-4 pr-4 text-right text-zinc-200">
                    {entry.logged.carbsG} g
                  </td>

                  <td className="py-4 pr-4 text-right text-zinc-200">
                    {entry.logged.fatG} g
                  </td>

                  <td className="py-4 pr-4 text-right text-zinc-200">
                    {entry.logged.sugarG} g
                  </td>

                  <td className="py-4 pr-4 text-right text-zinc-200">
                    {entry.logged.sodiumMg} mg
                  </td>

                  <td className="py-4 text-right">
                    <button
                      onClick={() => onDeleteEntry(entry.id)}
                      className="rounded-lg border border-zinc-700 px-3 py-1 text-xs text-zinc-300 transition hover:bg-zinc-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}