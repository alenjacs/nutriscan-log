"use client";

import { useMemo, useState } from "react";
import Tesseract from "tesseract.js";
import { parseNutritionText } from "../lib/nutritionParser";
import type { NutritionFormDraft } from "../lib/types";

type TesseractProgressMessage = {
  status?: string;
  progress?: number;
};

type OcrMode = "soft" | "hard";

type ImageOcrUploaderProps = {
  onUseParsedValues: (draft: NutritionFormDraft) => void;
};

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Could not read image file."));
      }
    };

    reader.onerror = () => reject(new Error("Could not read image file."));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not load image."));
    image.src = src;
  });
}

function getContentBox(
  imageData: ImageData,
  width: number,
  height: number
): { x: number; y: number; width: number; height: number } {
  const data = imageData.data;

  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      const red = data[index];
      const green = data[index + 1];
      const blue = data[index + 2];

      const isNotWhite = red < 245 || green < 245 || blue < 245;

      if (isNotWhite) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (minX >= maxX || minY >= maxY) {
    return {
      x: 0,
      y: 0,
      width,
      height,
    };
  }

  const padding = 12;

  return {
    x: Math.max(0, minX - padding),
    y: Math.max(0, minY - padding),
    width: Math.min(width - minX, maxX - minX + padding * 2),
    height: Math.min(height - minY, maxY - minY + padding * 2),
  };
}

async function preprocessImageForOcr(file: File, mode: OcrMode): Promise<string> {
  const originalDataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(originalDataUrl);

  const originalCanvas = document.createElement("canvas");
  const originalContext = originalCanvas.getContext("2d");

  if (!originalContext) {
    throw new Error("Could not process image.");
  }

  originalCanvas.width = image.naturalWidth;
  originalCanvas.height = image.naturalHeight;

  originalContext.fillStyle = "white";
  originalContext.fillRect(0, 0, originalCanvas.width, originalCanvas.height);
  originalContext.drawImage(image, 0, 0);

  const originalImageData = originalContext.getImageData(
    0,
    0,
    originalCanvas.width,
    originalCanvas.height
  );

  const contentBox = getContentBox(
    originalImageData,
    originalCanvas.width,
    originalCanvas.height
  );

  const scale = 4;

  const processedCanvas = document.createElement("canvas");
  const processedContext = processedCanvas.getContext("2d");

  if (!processedContext) {
    throw new Error("Could not process image.");
  }

  processedCanvas.width = contentBox.width * scale;
  processedCanvas.height = contentBox.height * scale;

  processedContext.fillStyle = "white";
  processedContext.fillRect(0, 0, processedCanvas.width, processedCanvas.height);

  processedContext.imageSmoothingEnabled = false;
  processedContext.drawImage(
    originalCanvas,
    contentBox.x,
    contentBox.y,
    contentBox.width,
    contentBox.height,
    0,
    0,
    processedCanvas.width,
    processedCanvas.height
  );

  const processedImageData = processedContext.getImageData(
    0,
    0,
    processedCanvas.width,
    processedCanvas.height
  );

  const data = processedImageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const red = data[i];
    const green = data[i + 1];
    const blue = data[i + 2];

    const gray = red * 0.299 + green * 0.587 + blue * 0.114;

    if (mode === "soft") {
      const contrast = 1.35;
      const adjusted = Math.max(0, Math.min(255, (gray - 128) * contrast + 128));

      data[i] = adjusted;
      data[i + 1] = adjusted;
      data[i + 2] = adjusted;
    } else {
      const highContrast = gray < 190 ? 0 : 255;

      data[i] = highContrast;
      data[i + 1] = highContrast;
      data[i + 2] = highContrast;
    }
  }

  processedContext.putImageData(processedImageData, 0, 0);

  return processedCanvas.toDataURL("image/png");
}

async function runTesseractOnImage(
  imageDataUrl: string,
  onProgress: (status: string, progress: number) => void,
  progressStart: number,
  progressEnd: number
): Promise<string> {
  const result = await Tesseract.recognize(imageDataUrl, "eng", {
    logger: (message: unknown) => {
      const data = message as TesseractProgressMessage;

      if (data.status && typeof data.progress === "number") {
        const scaledProgress =
          progressStart + data.progress * (progressEnd - progressStart);

        onProgress(data.status, Math.round(scaledProgress));
      }
    },
  });

  return result.data.text;
}

export default function ImageOcrUploader({
  onUseParsedValues,
}: ImageOcrUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [rawText, setRawText] = useState("");
  const [status, setStatus] = useState("No image selected.");
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const parsed = useMemo(() => parseNutritionText(rawText), [rawText]);

  async function handleFileChange(file: File | null) {
    setSelectedFile(file);
    setRawText("");
    setProgress(0);

    if (!file) {
      setPreviewUrl("");
      setStatus("No image selected.");
      return;
    }

    try {
      const softImage = await preprocessImageForOcr(file, "soft");
      setPreviewUrl(softImage);
      setStatus("Image selected and preprocessed. Run OCR to extract text.");
    } catch {
      setPreviewUrl("");
      setStatus("Could not load this image. Try PNG, JPG, or a clearer screenshot.");
    }
  }

  async function runOcr() {
    if (!selectedFile) {
      setStatus("Select an image first.");
      return;
    }

    setIsProcessing(true);
    setRawText("");
    setProgress(0);
    setStatus("Preparing image...");

    try {
      const softImage = await preprocessImageForOcr(selectedFile, "soft");
      const hardImage = await preprocessImageForOcr(selectedFile, "hard");

      setPreviewUrl(softImage);

      setStatus("Running OCR pass 1...");
      const softText = await runTesseractOnImage(
        softImage,
        (nextStatus, nextProgress) => {
          setStatus(`Soft OCR: ${nextStatus}`);
          setProgress(nextProgress);
        },
        0,
        50
      );

      setStatus("Running OCR pass 2...");
      const hardText = await runTesseractOnImage(
        hardImage,
        (nextStatus, nextProgress) => {
          setStatus(`Hard OCR: ${nextStatus}`);
          setProgress(nextProgress);
        },
        50,
        100
      );

      const combinedText = [
        "=== SOFT OCR PASS ===",
        softText,
        "",
        "=== HARD OCR PASS ===",
        hardText,
      ].join("\n");

      setRawText(combinedText);
      setStatus("OCR finished. Combined soft + hard OCR results.");
      setProgress(100);
    } catch (error) {
      console.error(error);
      setStatus("OCR failed. Try a clearer cropped PNG/JPG image.");
      setProgress(0);
    } finally {
      setIsProcessing(false);
    }
  }

  function useParsedValues() {
    const draft: NutritionFormDraft = {
      id: crypto.randomUUID(),
      servingSizeValue: String(parsed.servingSizeValue),
      servingSizeUnit: parsed.servingSizeUnit,
      consumedAmountValue: String(parsed.servingSizeValue),
      consumedAmountUnit: parsed.servingSizeUnit,
      calories: String(parsed.nutrition.calories),
      proteinG: String(parsed.nutrition.proteinG),
      carbsG: String(parsed.nutrition.carbsG),
      fatG: String(parsed.nutrition.fatG),
      sugarG: String(parsed.nutrition.sugarG),
      sodiumMg: String(parsed.nutrition.sodiumMg),
    };

    onUseParsedValues(draft);
    setStatus("Parsed values sent to manual food entry form.");
  }

  async function copyParsedValues() {
    const textToCopy = [
      `Serving size: ${parsed.servingSizeValue} ${parsed.servingSizeUnit}`,
      `Calories: ${parsed.nutrition.calories}`,
      `Protein: ${parsed.nutrition.proteinG} g`,
      `Carbs: ${parsed.nutrition.carbsG} g`,
      `Fat: ${parsed.nutrition.fatG} g`,
      `Sugar: ${parsed.nutrition.sugarG} g`,
      `Sodium: ${parsed.nutrition.sodiumMg} mg`,
    ].join("\n");

    await navigator.clipboard.writeText(textToCopy);
    setStatus("Parsed values copied.");
  }

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-white">
          Upload Nutrition Label
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Upload an image, run OCR, and parse basic nutrition values.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <div className="grid gap-4">
          <label className="grid gap-2 text-sm">
            <span className="font-medium text-zinc-300">Label image</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={(event) =>
                handleFileChange(event.target.files?.[0] ?? null)
              }
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-300 file:mr-4 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-2 file:text-sm file:font-semibold file:text-black"
            />
          </label>

          {previewUrl ? (
            <div className="overflow-hidden rounded-xl border border-zinc-800 bg-white p-2">
              <img
                src={previewUrl}
                alt="Selected nutrition label"
                className="max-h-96 w-full object-contain"
              />
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-zinc-800 p-8 text-center text-sm text-zinc-500">
              Image preview will appear here.
            </div>
          )}

          <button
            type="button"
            onClick={runOcr}
            disabled={isProcessing || !selectedFile}
            className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isProcessing ? "Reading label..." : "Run OCR"}
          </button>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <p className="text-sm text-zinc-300">{status}</p>

            <div className="mt-3 h-3 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-white"
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="mt-2 text-xs text-zinc-500">{progress}%</p>
          </div>
        </div>

        <div className="grid gap-4">
          <div>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
                Parsed Values
              </h3>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={useParsedValues}
                  disabled={!rawText}
                  className="rounded-lg bg-white px-3 py-1 text-xs font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Use parsed values
                </button>

                <button
                  type="button"
                  onClick={copyParsedValues}
                  disabled={!rawText}
                  className="rounded-lg border border-zinc-700 px-3 py-1 text-xs text-zinc-300 transition hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Copy parsed values
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-zinc-800">
              <table className="w-full min-w-[500px] text-left text-sm">
                <tbody>
                  <ParsedRow
                    label="Serving size"
                    value={`${parsed.servingSizeValue} ${parsed.servingSizeUnit}`}
                  />
                  <ParsedRow
                    label="Calories"
                    value={`${parsed.nutrition.calories} kcal`}
                  />
                  <ParsedRow
                    label="Protein"
                    value={`${parsed.nutrition.proteinG} g`}
                  />
                  <ParsedRow
                    label="Carbs"
                    value={`${parsed.nutrition.carbsG} g`}
                  />
                  <ParsedRow label="Fat" value={`${parsed.nutrition.fatG} g`} />
                  <ParsedRow
                    label="Sugar"
                    value={`${parsed.nutrition.sugarG} g`}
                  />
                  <ParsedRow
                    label="Sodium"
                    value={`${parsed.nutrition.sodiumMg} mg`}
                  />
                </tbody>
              </table>
            </div>
          </div>

          <label className="grid gap-2 text-sm">
            <span className="font-medium text-zinc-300">Raw OCR text</span>
            <textarea
              value={rawText}
              onChange={(event) => setRawText(event.target.value)}
              placeholder="OCR text will appear here. You can also paste nutrition label text here to test the parser."
              className="min-h-64 w-full resize-y rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-zinc-500"
            />
          </label>
        </div>
      </div>
    </section>
  );
}

function ParsedRow({ label, value }: { label: string; value: string }) {
  return (
    <tr className="border-b border-zinc-900 last:border-0">
      <td className="w-1/2 px-4 py-3 text-zinc-400">{label}</td>
      <td className="px-4 py-3 font-medium text-white">{value}</td>
    </tr>
  );
}