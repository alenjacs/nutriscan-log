import type { FoodLogEntry } from "@/lib/types";

type DailySummaryProps = {
  entries: FoodLogEntry[];
};

function sum(entries: FoodLogEntry[], key: keyof FoodLogEntry["logged"]) {
  return entries.reduce((total, entry) => total + entry.logged[key], 0);
}

export default function DailySummary({ entries }: DailySummaryProps) {
  const totalCalories = Math.round(sum(entries, "calories"));
  const totalProtein = sum(entries, "proteinG").toFixed(1);
  const totalCarbs = sum(entries, "carbsG").toFixed(1);
  const totalFat = sum(entries, "fatG").toFixed(1);
  const totalSugar = sum(entries, "sugarG").toFixed(1);
  const totalSodium = Math.round(sum(entries, "sodiumMg"));

  const calorieTarget = 1900;
  const proteinTarget = 150;

  const caloriePercent = Math.min((totalCalories / calorieTarget) * 100, 100);
  const proteinPercent = Math.min((Number(totalProtein) / proteinTarget) * 100, 100);

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-sm">
      <div className="mb-5 flex flex-col gap-1">
        <h2 className="text-xl font-semibold text-white">Today&apos;s Summary</h2>
        <p className="text-sm text-zinc-400">
          Daily totals from all logged foods.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <SummaryCard label="Calories" value={`${totalCalories}`} unit="kcal" />
        <SummaryCard label="Protein" value={totalProtein} unit="g" />
        <SummaryCard label="Carbs" value={totalCarbs} unit="g" />
        <SummaryCard label="Fat" value={totalFat} unit="g" />
        <SummaryCard label="Sugar" value={totalSugar} unit="g" />
        <SummaryCard label="Sodium" value={`${totalSodium}`} unit="mg" />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <ProgressBar
          label="Calories"
          value={totalCalories}
          target={calorieTarget}
          unit="kcal"
          percent={caloriePercent}
        />

        <ProgressBar
          label="Protein"
          value={Number(totalProtein)}
          target={proteinTarget}
          unit="g"
          percent={proteinPercent}
        />
      </div>
    </section>
  );
}

function SummaryCard({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">
        {value}
        <span className="ml-1 text-sm font-normal text-zinc-400">{unit}</span>
      </p>
    </div>
  );
}

function ProgressBar({
  label,
  value,
  target,
  unit,
  percent,
}: {
  label: string;
  value: number;
  target: number;
  unit: string;
  percent: number;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-zinc-200">{label}</span>
        <span className="text-zinc-400">
          {value} / {target} {unit}
        </span>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full rounded-full bg-white"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}