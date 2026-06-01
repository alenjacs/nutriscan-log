"use client";

import { useEffect, useState, type FormEvent } from "react";
import type {
  FoodLogEntry,
  NutritionFormDraft,
  NutritionValues,
  ServingUnit,
} from "../lib/types";
import {
  calculateLoggedNutrition,
  calculateScaleFactor,
} from "../lib/nutritionMath";

type FoodEntryFormProps = {
  onAddEntry: (entry: FoodLogEntry) => void;
  draft: NutritionFormDraft | null;
};

type FormState = {
  name: string;
  brand: string;
  servingSizeValue: string;
  servingSizeUnit: ServingUnit;
  consumedAmountValue: string;
  consumedAmountUnit: ServingUnit;
  calories: string;
  proteinG: string;
  carbsG: string;
  fatG: string;
  sugarG: string;
  sodiumMg: string;
};

const initialFormState: FormState = {
  name: "",
  brand: "",
  servingSizeValue: "100",
  servingSizeUnit: "g",
  consumedAmountValue: "100",
  consumedAmountUnit: "g",
  calories: "",
  proteinG: "",
  carbsG: "",
  fatG: "",
  sugarG: "",
  sodiumMg: "",
};

function toNumber(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function FoodEntryForm({
  onAddEntry,
  draft,
}: FoodEntryFormProps) {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!draft) return;

    setForm((current) => ({
      ...current,
      servingSizeValue: draft.servingSizeValue,
      servingSizeUnit: draft.servingSizeUnit,
      consumedAmountValue: draft.consumedAmountValue,
      consumedAmountUnit: draft.consumedAmountUnit,
      calories: draft.calories,
      proteinG: draft.proteinG,
      carbsG: draft.carbsG,
      fatG: draft.fatG,
      sugarG: draft.sugarG,
      sodiumMg: draft.sodiumMg,
    }));
  }, [draft]);

  const servingSize = toNumber(form.servingSizeValue);
  const consumedAmount = toNumber(form.consumedAmountValue);
  const scaleFactor = calculateScaleFactor(consumedAmount, servingSize);

  const perServing: NutritionValues = {
    calories: toNumber(form.calories),
    proteinG: toNumber(form.proteinG),
    carbsG: toNumber(form.carbsG),
    fatG: toNumber(form.fatG),
    sugarG: toNumber(form.sugarG),
    sodiumMg: toNumber(form.sodiumMg),
  };

  const preview = calculateLoggedNutrition(perServing, scaleFactor);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current: FormState) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Food name is required.");
      return;
    }

    if (servingSize <= 0) {
      setError("Serving size must be greater than 0.");
      return;
    }

    if (consumedAmount <= 0) {
      setError("Consumed amount must be greater than 0.");
      return;
    }

    if (form.servingSizeUnit !== form.consumedAmountUnit) {
      setError("For now, serving size unit and consumed amount unit must match.");
      return;
    }

    const entry: FoodLogEntry = {
      id: crypto.randomUUID(),
      name: form.name.trim(),
      brand: form.brand.trim(),
      servingSizeValue: servingSize,
      servingSizeUnit: form.servingSizeUnit,
      consumedAmountValue: consumedAmount,
      consumedAmountUnit: form.consumedAmountUnit,
      scaleFactor,
      perServing,
      logged: preview,
      createdAt: new Date().toISOString(),
    };

    onAddEntry(entry);
    setForm(initialFormState);
  }

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-white">Manual Food Entry</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Review/edit values before logging the food.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextInput
            label="Food name"
            value={form.name}
            onChange={(value) => updateField("name", value)}
            placeholder="Tuna"
            required
          />

          <TextInput
            label="Brand"
            value={form.brand}
            onChange={(value) => updateField("brand", value)}
            placeholder="Optional"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumberInput
            label="Label serving size"
            value={form.servingSizeValue}
            onChange={(value) => updateField("servingSizeValue", value)}
          />

          <UnitSelect
            label="Serving unit"
            value={form.servingSizeUnit}
            onChange={(value) => updateField("servingSizeUnit", value)}
          />

          <NumberInput
            label="Consumed amount"
            value={form.consumedAmountValue}
            onChange={(value) => updateField("consumedAmountValue", value)}
          />

          <UnitSelect
            label="Consumed unit"
            value={form.consumedAmountUnit}
            onChange={(value) => updateField("consumedAmountUnit", value)}
          />
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">
            Nutrition per label serving
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <NumberInput
              label="Calories"
              value={form.calories}
              onChange={(value) => updateField("calories", value)}
            />

            <NumberInput
              label="Protein (g)"
              value={form.proteinG}
              onChange={(value) => updateField("proteinG", value)}
            />

            <NumberInput
              label="Carbs (g)"
              value={form.carbsG}
              onChange={(value) => updateField("carbsG", value)}
            />

            <NumberInput
              label="Fat (g)"
              value={form.fatG}
              onChange={(value) => updateField("fatG", value)}
            />

            <NumberInput
              label="Sugar (g)"
              value={form.sugarG}
              onChange={(value) => updateField("sugarG", value)}
            />

            <NumberInput
              label="Sodium (mg)"
              value={form.sodiumMg}
              onChange={(value) => updateField("sodiumMg", value)}
            />
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <p className="text-sm font-medium text-zinc-300">
            Scale factor:{" "}
            <span className="text-white">{scaleFactor.toFixed(2)}x</span>
          </p>

          <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-zinc-300 sm:grid-cols-2">
            <p>Calories: {preview.calories} kcal</p>
            <p>Protein: {preview.proteinG} g</p>
            <p>Carbs: {preview.carbsG} g</p>
            <p>Fat: {preview.fatG} g</p>
            <p>Sugar: {preview.sugarG} g</p>
            <p>Sodium: {preview.sodiumMg} mg</p>
          </div>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-900 bg-red-950/40 p-3 text-sm text-red-300">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          className="w-full rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
        >
          Add to Food Log
        </button>
      </form>
    </section>
  );
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="grid min-w-0 gap-2 text-sm">
      <span className="font-medium text-zinc-300">{label}</span>
      <input
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full min-w-0 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-zinc-500"
      />
    </label>
  );
}

function NumberInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid min-w-0 gap-2 text-sm">
      <span className="font-medium text-zinc-300">{label}</span>
      <input
        type="number"
        min="0"
        step="any"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full min-w-0 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-zinc-500"
      />
    </label>
  );
}

function UnitSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: ServingUnit;
  onChange: (value: ServingUnit) => void;
}) {
  return (
    <label className="grid min-w-0 gap-2 text-sm">
      <span className="font-medium text-zinc-300">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as ServingUnit)}
        className="w-full min-w-0 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-zinc-500"
      >
        <option value="g">g</option>
        <option value="ml">ml</option>
        <option value="serving">serving</option>
      </select>
    </label>
  );
}