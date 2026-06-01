"use client";

import { useEffect, useState } from "react";
import ImageOcrUploader from "../src/components/ImageOcrUploader";
import DailySummary from "../src/components/DailySummary";
import FoodEntryForm from "../src/components/FoodEntryForm";
import FoodLogTable from "../src/components/FoodLogTable";
import type { FoodLogEntry, NutritionFormDraft } from "../src/lib/types";

const STORAGE_KEY = "nutriscan-log-food-entries";

export default function Home() {
  const [entries, setEntries] = useState<FoodLogEntry[]>([]);
  const [nutritionDraft, setNutritionDraft] =
    useState<NutritionFormDraft | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const savedEntries = window.localStorage.getItem(STORAGE_KEY);

    if (savedEntries) {
      try {
        setEntries(JSON.parse(savedEntries) as FoodLogEntry[]);
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }

    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries, isReady]);

  function addEntry(entry: FoodLogEntry) {
    setEntries((current) => [entry, ...current]);
  }

  function deleteEntry(id: string) {
    setEntries((current) => current.filter((entry) => entry.id !== id));
  }

  function clearEntries() {
    setEntries([]);
  }

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6">
        <header className="flex flex-col gap-2">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-zinc-500">
            NutriScan Log
          </p>

          <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            Nutrition label tracker with serving-size calculation.
          </h1>

          <p className="max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
            Phase 2: OCR extraction, editable nutrition review, serving-size
            calculation, and daily food logging.
          </p>
        </header>

        <DailySummary entries={entries} />

        <ImageOcrUploader onUseParsedValues={setNutritionDraft} />

        <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
          <FoodEntryForm onAddEntry={addEntry} draft={nutritionDraft} />

          <FoodLogTable
            entries={entries}
            onDeleteEntry={deleteEntry}
            onClearEntries={clearEntries}
          />
        </div>
      </div>
    </main>
  );
}