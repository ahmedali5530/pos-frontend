import React, { useState, useMemo } from "react";
import classNames from "classnames";
import {Modal} from "../modal/modal";
import {Button} from "../input/button";
import * as XLSX from "xlsx";
import {faDownload, faUpload} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

// Very small CSV parser (not perfect, but good for simple CSVs).
// Replace with PapaParse if you want more robust parsing.
function parseCsv(text: string): { headers: string[]; rows: string[][] } {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  const splitLine = (line: string) => line.split(",").map((v) => v.trim());

  const headers = splitLine(lines[0]);
  const rows = lines.slice(1).map(splitLine);

  return { headers, rows };
}

export type CsvFieldConfig = {
  /** Internal field name (used in payload to `onCreateRow`) */
  name: string;
  /** User-friendly label shown in the UI */
  label: string;
  /** Optional: default CSV header name to preselect */
  defaultCsvHeader?: string;
};

type CsvUploadModalProps = {
  /** Whether the modal is visible */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;

  /** Fields you want to create per row (these become object keys) */
  fields: CsvFieldConfig[];

  /**
   * Called once for every row (sequentially).
   * Return a promise that performs the DB create (or any side-effect).
   */
  onCreateRow: (rowData: Record<string, string>) => Promise<void>;

  /** Optional: limit rows shown in preview table */
  previewRowLimit?: number;

  onDone?: (data: {total: number, success: number}) => void;
};

export const CsvUploadModal: React.FC<CsvUploadModalProps> = ({
  isOpen,
  onClose,
  fields,
  onCreateRow,
  onDone
}) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Record<string, string | "">>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<number, string>>({});

  const hasFile = headers.length > 0;

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setError(null);
    setResultMessage(null);
    setErrors({});

    const file = e.target.files?.[0];
    if (!file) return;

    if(file.type !== 'text/csv'){
      setError("Please upload a CSV file.");
      return;
    }

    try {
      const text = await file.text();
      const { headers: h, rows: r } = parseCsv(text);

      if (h.length === 0) {
        setError("No headers found in CSV.");
        return;
      }

      setFileName(file.name);
      setHeaders(h);
      setRows(r);

      // Initialize mapping (try to match by defaultCsvHeader or label)
      const newMapping: Record<string, string | ""> = {};
      fields.forEach((field) => {
        const preferred =
          field.defaultCsvHeader || field.label || field.name;
        const found =
          h.find((hdr) => hdr.toLowerCase() === preferred.toLowerCase()) ||
          "";
        newMapping[field.name] = found;
      });
      setMapping(newMapping);
    } catch (err: any) {
      console.error(err);
      setError("Failed to read or parse CSV file.");
    }
  };

  const handleChangeMapping = (fieldName: string, csvHeader: string) => {
    setMapping((prev) => ({ ...prev, [fieldName]: csvHeader }));
  };

  const allRequiredMapped = useMemo(
    () =>
      fields.every(
        (field) =>
          mapping[field.name] && mapping[field.name]!.trim() !== ""
      ),
    [fields, mapping]
  );

  const handleCreate = async () => {
    if (!hasFile) {
      setError("Please upload a CSV file first.");
      return;
    }
    if (!allRequiredMapped) {
      setError("Please map all fields before creating records.");
      return;
    }

    setError('');
    setResultMessage(null);
    setIsProcessing(true);
    setErrors({});

    try {
      const headerIndex: Record<string, number> = {};
      headers.forEach((h, idx) => {
        headerIndex[h] = idx;
      });

      let successCount = 0;
      let failureCount = 0;
      const rowErrors: Record<number, string> = {};

      for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
        const row = rows[rowIndex];
        const payload: Record<string, string> = {};

        for (const field of fields) {
          const csvHeader = mapping[field.name];
          if (!csvHeader) continue;
          const idx = headerIndex[csvHeader];
          payload[field.name] = row[idx] ?? "";
        }

        try {
          // Sequential create
          await onCreateRow(payload);
          successCount++;
        } catch (err: any) {
          console.error("Row create failed", err, payload);
          failureCount++;
          rowErrors[rowIndex] =
            (err && err.message) || "Failed to create this row.";
        }
      }

      setErrors(rowErrors);

      setResultMessage(
        `Processed ${rows.length} rows. Success: ${successCount}.`
      );
      setError(`Failed: ${failureCount}`);

      if(onDone !== undefined){
        onDone({
          total: rows.length,
          success: successCount
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (isProcessing) return;
    setFileName(null);
    setHeaders([]);
    setRows([]);
    setMapping({});
    setError(null);
    setResultMessage(null);
    onClose();
  };

  const downloadTemplate = async () => {
    const ws = XLSX.utils.aoa_to_sheet([
      fields.map(item => item.label)
    ]);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");

    // Download file
    XLSX.writeFile(wb, "template.csv");
  }

  if (!isOpen) return null;

  return (
    <Modal
      open={true}
      onClose={handleClose}
      size="xl"
      title="Upload records using CSV"
    >
      <div className="space-y-4 px-6 py-4">
        {/* File input */}
        <div className="flex items-center gap-4 mb-5">
          <Button
            className="btn btn-secondary"
            type="button"
            onClick={downloadTemplate}
            variant="secondary"
            icon={faDownload}
          >Download template</Button>
          <label htmlFor="file" className="btn btn-primary gap-3">
            <input
              type="file"
              accept="csv,text/csv"
              className="appearance-none hidden"
              onChange={handleFileChange}
              disabled={isProcessing}
              id="file"
            /><FontAwesomeIcon icon={faUpload} /> Upload CSV file
          </label>
          {fileName && (
            <div className="text-xs text-gray-900 bg-gray-300 p-3">
              Current file: <span className="font-medium">{fileName}</span>
            </div>
          )}
        </div>
        <div className="text-primary-500">You pipe operator "|" for multiple values. For example "store 1|store 2" etc...</div>

        {/* Mapping */}
        {hasFile && (
          <div className="rounded border bg-gray-50 p-4">
            <h3 className="mb-2 text-sm font-semibold text-gray-800">
              Column Mapping
            </h3>

            {!allRequiredMapped && (
              <p className="mt-2 text-danger-600">
                Map all fields before creating records.
              </p>
            )}

            <div className="grid gap-3 md:grid-cols-5">
              {fields.map((field) => (
                <div key={field.name} className="flex flex-col">
                    <label htmlFor={field.name} className="text-xs font-medium text-gray-700">
                      {field.label}
                    </label>
                  <select
                    className="form-control"
                    value={mapping[field.name] ?? ""}
                    onChange={(e) =>
                      handleChangeMapping(field.name, e.target.value)
                    }
                    disabled={isProcessing}
                    id={field.name}
                  >
                    <option value="">-- Not mapped --</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* Preview table */}
        {hasFile && (
          <div className="max-h-80 overflow-auto rounded border">
            <table className="table table-hover">
              <thead className="bg-gray-100">
              <tr>
                {headers.map((h) => (
                  <th key={h} className="px-3 py-2 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
              </thead>
              <tbody>
              {rows
                // .slice(0, previewRowLimit)
                .map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={classNames(
                    rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50",
                    errors[rowIndex] && 'bg-danger-200'
                  )}
                  title={errors[rowIndex] && errors[rowIndex]}
                >
                  {headers.map((_, colIndex) => (
                    <td key={colIndex} className="px-3 py-2">
                      {row[colIndex]}
                    </td>
                  ))}
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Messages */}
        {error && (
          <div className="text-danger-600">
            {error}
          </div>
        )}
        {resultMessage && (
          <div className="text-success-600">
            {resultMessage}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t px-6 py-3">
          <span className="text-gray-500">
            Rows: {rows.length}
          </span>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="primary"
            onClick={handleCreate}
            disabled={!hasFile || !allRequiredMapped || isProcessing}
          >
            {isProcessing ? "Creating..." : "Create"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};