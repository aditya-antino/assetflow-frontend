import { FormEvent, useState } from "react";
import Modal from "./Modal";
import * as assetService from "../services/assets";
import { getErrorMessage } from "../services/api";
import { useToast } from "../hooks/useToast";
import { Upload } from "lucide-react";

interface AddAssetsModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

type Mode = "manual" | "bulk" | "csv";

const CATEGORIES = ["Laptop", "Monitor", "Phone", "Tablet", "Accessory", "Other"];

export default function AddAssetsModal({ onClose, onSuccess }: AddAssetsModalProps) {
  const [mode, setMode] = useState<Mode>("manual");
  const { showToast } = useToast();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Manual fields
  const [assetTag, setAssetTag] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [manufacturer, setManufacturer] = useState("");
  const [model, setModel] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [location, setLocation] = useState("");

  // Bulk fields
  const [bulkName, setBulkName] = useState("");
  const [bulkCategory, setBulkCategory] = useState(CATEGORIES[0]);
  const [bulkManufacturer, setBulkManufacturer] = useState("");
  const [bulkModel, setBulkModel] = useState("");
  const [quantity, setQuantity] = useState("10");
  const [prefix, setPrefix] = useState("");
  const [startingNumber, setStartingNumber] = useState("1");
  const [bulkPurchaseDate, setBulkPurchaseDate] = useState("");
  const [bulkPurchasePrice, setBulkPurchasePrice] = useState("");

  // CSV
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<{
    rows: Record<string, string>[];
    errors: { row: number; message: string }[];
    valid: boolean;
  } | null>(null);

  async function handleManualSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await assetService.createAsset({
        assetTag,
        name,
        category,
        manufacturer: manufacturer || undefined,
        model: model || undefined,
        serialNumber: serialNumber || undefined,
        purchaseDate: purchaseDate || undefined,
        purchasePrice: purchasePrice ? Number(purchasePrice) : undefined,
        location: location || undefined,
      });
      showToast("Asset added successfully");
      onSuccess();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleBulkSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const created = await assetService.bulkCreateAssets({
        name: bulkName,
        category: bulkCategory,
        manufacturer: bulkManufacturer || undefined,
        model: bulkModel || undefined,
        quantity: Number(quantity),
        assetTagPrefix: prefix,
        startingNumber: Number(startingNumber),
        purchaseDate: bulkPurchaseDate || undefined,
        purchasePrice: bulkPurchasePrice ? Number(bulkPurchasePrice) : undefined,
      });
      showToast(`${created.length} assets created successfully`);
      onSuccess();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleFileChange(f: File | null) {
    setFile(f);
    setPreview(null);
    setError("");
    if (!f) return;
    try {
      const result = await assetService.previewImportAssets(f);
      setPreview(result);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleCsvImport() {
    if (!file) return;
    setError("");
    setSubmitting(true);
    try {
      const created = await assetService.importAssets(file);
      showToast(`${created.length} assets imported successfully`);
      onSuccess();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  const tabs: { key: Mode; label: string }[] = [
    { key: "manual", label: "Add manually" },
    { key: "bulk", label: "Bulk create" },
    { key: "csv", label: "Import CSV" },
  ];

  return (
    <Modal open onClose={onClose} title="Add Assets" maxWidth="max-w-xl">
      <div className="mb-5 flex gap-2 rounded-lg bg-slate-100 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setMode(tab.key);
              setError("");
            }}
            className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
              mode === tab.key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      {mode === "manual" && (
        <form onSubmit={handleManualSubmit}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Asset Tag">
              <input required value={assetTag} onChange={(e) => setAssetTag(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Category">
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Name" full>
              <input required value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Manufacturer">
              <input value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Model">
              <input value={model} onChange={(e) => setModel(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Serial Number">
              <input value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Location">
              <input value={location} onChange={(e) => setLocation(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Purchase Date">
              <input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Purchase Price">
              <input type="number" min="0" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} className={inputCls} />
            </Field>
          </div>
          <ModalActions onCancel={onClose} submitting={submitting} label="Add Asset" />
        </form>
      )}

      {mode === "bulk" && (
        <form onSubmit={handleBulkSubmit}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Asset Name" full>
              <input required value={bulkName} onChange={(e) => setBulkName(e.target.value)} className={inputCls} placeholder="Dell Latitude 5440" />
            </Field>
            <Field label="Category">
              <select value={bulkCategory} onChange={(e) => setBulkCategory(e.target.value)} className={inputCls}>
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Manufacturer">
              <input value={bulkManufacturer} onChange={(e) => setBulkManufacturer(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Model">
              <input value={bulkModel} onChange={(e) => setBulkModel(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Quantity">
              <input type="number" min="1" max="1000" required value={quantity} onChange={(e) => setQuantity(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Asset Tag Prefix">
              <input required value={prefix} onChange={(e) => setPrefix(e.target.value.toUpperCase())} className={inputCls} placeholder="LAP" />
            </Field>
            <Field label="Starting Number">
              <input type="number" min="1" value={startingNumber} onChange={(e) => setStartingNumber(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Purchase Date">
              <input type="date" value={bulkPurchaseDate} onChange={(e) => setBulkPurchaseDate(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Purchase Price">
              <input type="number" min="0" value={bulkPurchasePrice} onChange={(e) => setBulkPurchasePrice(e.target.value)} className={inputCls} />
            </Field>
          </div>
          {prefix && quantity && (
            <p className="mt-3 text-xs text-slate-400">
              Will generate tags {prefix}-{String(startingNumber).padStart(3, "0")} through{" "}
              {prefix}-{String(Number(startingNumber) + Number(quantity) - 1).padStart(3, "0")}
            </p>
          )}
          <ModalActions onCancel={onClose} submitting={submitting} label={`Create ${quantity || 0} Assets`} />
        </form>
      )}

      {mode === "csv" && (
        <div>
          <p className="mb-3 text-sm text-slate-500">
            Expected columns: assetTag, name, category, manufacturer, model, serialNumber, purchaseDate,
            purchasePrice, location, description
          </p>
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 px-6 py-8 text-center hover:border-slate-400">
            <Upload className="h-6 w-6 text-slate-400" />
            <span className="mt-2 text-sm text-slate-600">
              {file ? file.name : "Click to upload a CSV file"}
            </span>
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
            />
          </label>

          {preview && (
            <div className="mt-4">
              <p className="text-sm font-medium text-slate-700">
                {preview.rows.length} rows detected
                {preview.valid ? (
                  <span className="ml-2 text-emerald-600">— ready to import</span>
                ) : (
                  <span className="ml-2 text-red-600">— {preview.errors.length} issue(s) found</span>
                )}
              </p>
              {!preview.valid && (
                <ul className="mt-2 max-h-32 space-y-1 overflow-y-auto rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                  {preview.errors.map((err, i) => (
                    <li key={i}>
                      Row {err.row}: {err.message}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-3 max-h-40 overflow-auto rounded-lg border border-slate-200">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50">
                    <tr>
                      {Object.keys(preview.rows[0] ?? {}).map((h) => (
                        <th key={h} className="px-2 py-1 text-left font-medium text-slate-500">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows.slice(0, 5).map((row, i) => (
                      <tr key={i} className="border-t border-slate-100">
                        {Object.values(row).map((v, j) => (
                          <td key={j} className="px-2 py-1 text-slate-600">
                            {v}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleCsvImport}
              disabled={!file || !preview?.valid || submitting}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {submitting ? "Importing…" : "Import Assets"}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

const inputCls =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900";

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      {children}
    </div>
  );
}

function ModalActions({
  onCancel,
  submitting,
  label,
}: {
  onCancel: () => void;
  submitting: boolean;
  label: string;
}) {
  return (
    <div className="mt-6 flex justify-end gap-3">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
      >
        {submitting ? "Saving…" : label}
      </button>
    </div>
  );
}
