import React, {useEffect, useMemo, useState} from "react";
import useApi, {SettingsData} from "../../../../api/db/use.api";
import {Tables} from "../../../../api/db/tables";
import {Product} from "../../../../api/model/product";
import {Category} from "../../../../api/model/category";
import {Printer} from "../../../../api/model/printer";
import {ReactSelect} from "../../../../app-common/components/input/custom.react.select";
import {Switch} from "../../../../app-common/components/input/switch";
import {Input} from "../../../../app-common/components/input/input";
import {Button} from "../../../../app-common/components/input/button";
import {Checkbox} from "../../../../app-common/components/input/checkbox";
import {useDB} from "../../../../api/db/db";
import {dispatchPrint} from "../../../../lib/print/print.service";
import {notify} from "../../../../app-common/components/confirm/notification";
import {formatNumber} from "../../../../lib/currency/currency";
import {
  DEFAULT_LABEL_PRINT_CONFIG,
  LABEL_PRINT_SETTING_NAME,
  normalizeLabelPrintConfig,
} from "../../../../lib/print/label.print.config";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPrint} from "@fortawesome/free-solid-svg-icons";

type RowKey = string;

interface LabelRow {
  key: RowKey;
  productId: string;
  name: string;
  barcode: string;
  price: number;
  sku?: string;
  category?: string;
  isVariant: boolean;
  copies: number;
}

export const BulkBarcodePrint = () => {
  const db = useDB();

  const {data: productsData, isLoading: loadingProducts} = useApi<SettingsData<Product>>(
    Tables.product,
    ['is_active = true'],
    ['name asc'],
    0,
    9999,
    ['categories', 'variants'],
    {},
    ['id', 'name', 'barcode', 'sku', 'base_price', 'categories', 'variants']
  );

  const {data: categoriesData, isLoading: loadingCategories} = useApi<SettingsData<Category>>(
    Tables.category,
    [],
    ['name asc'],
    0,
    9999,
    [],
    {},
    ['id', 'name']
  );

  const {data: printersData, isLoading: loadingPrinters} = useApi<SettingsData<Printer>>(
    Tables.printer,
    [],
    ['name asc'],
    0,
    9999,
    [],
    {},
    ['id', 'name', 'type', 'role', 'ip_address', 'port', 'prints']
  );

  const [selectedCategories, setSelectedCategories] = useState<any[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [includeVariants, setIncludeVariants] = useState(true);
  const [requireBarcode, setRequireBarcode] = useState(true);
  const [selected, setSelected] = useState<Record<RowKey, boolean>>({});
  const [copies, setCopies] = useState<Record<RowKey, number>>({});
  const [globalCopies, setGlobalCopies] = useState(1);
  const [printer, setPrinter] = useState<any>(null);
  const [printing, setPrinting] = useState(false);

  const categoryOptions = useMemo(
    () => (categoriesData?.data || []).map((c) => ({
      label: c.name,
      value: c.id?.toString?.() ?? String(c.id),
    })),
    [categoriesData]
  );

  const productOptions = useMemo(
    () => (productsData?.data || []).map((p) => ({
      label: `${p.name}${p.barcode ? ` - ${p.barcode}` : ''}`,
      value: p.id?.toString?.() ?? String(p.id),
    })),
    [productsData]
  );

  const labelPrinterOptions = useMemo(
    () => (printersData?.data || [])
      .filter((p) => (p.role || 'receipt') === 'label')
      .map((p) => ({
        label: `${p.name}${p.ip_address ? ` (${p.ip_address})` : ''}`,
        value: p.id?.toString?.() ?? String(p.id),
        printer: p,
      })),
    [printersData]
  );

  const rows: LabelRow[] = useMemo(() => {
    const products = productsData?.data || [];
    const catIds = new Set(selectedCategories.map((c) => c.value));
    const productIds = new Set(selectedProducts.map((p) => p.value));
    const q = search.trim().toLowerCase();
    const out: LabelRow[] = [];

    for (const product of products) {
      const pid = product.id?.toString?.() ?? String(product.id);
      if (productIds.size > 0 && !productIds.has(pid)) continue;

      if (catIds.size > 0) {
        const cats = product.categories || [];
        const match = cats.some((c) => catIds.has(c.id?.toString?.() ?? String(c.id)));
        if (!match) continue;
      }

      const categoryName = (product.categories || []).map((c) => c.name).filter(Boolean).join(', ');

      const pushRow = (
        key: string,
        name: string,
        barcode: string | undefined,
        price: number,
        sku: string | undefined,
        isVariant: boolean
      ) => {
        if (requireBarcode && !barcode) return;
        if (q) {
          const hay = `${name} ${barcode || ''} ${sku || ''}`.toLowerCase();
          if (!hay.includes(q)) return;
        }
        out.push({
          key,
          productId: pid,
          name,
          barcode: barcode || '',
          price,
          sku,
          category: categoryName || undefined,
          isVariant,
          copies: copies[key] ?? 1,
        });
      };

      pushRow(pid, product.name, product.barcode, Number(product.base_price) || 0, product.sku, false);

      if (includeVariants) {
        for (const variant of product.variants || []) {
          const vid = variant.id?.toString?.() ?? String(variant.id);
          const vName = variant.attribute_value
            ? `${product.name} - ${variant.attribute_value}`
            : (variant.name || product.name);
          pushRow(
            `${pid}::${vid}`,
            vName,
            variant.barcode,
            Number(variant.price ?? product.base_price) || 0,
            product.sku,
            true
          );
        }
      }
    }

    return out;
  }, [
    productsData,
    selectedCategories,
    selectedProducts,
    search,
    includeVariants,
    requireBarcode,
    copies,
  ]);

  const selectedKeys = useMemo(
    () => rows.filter((r) => selected[r.key]).map((r) => r.key),
    [rows, selected]
  );

  const allSelected = rows.length > 0 && selectedKeys.length === rows.length;
  const someSelected = selectedKeys.length > 0 && !allSelected;

  useEffect(() => {
    // Drop selection for rows that disappeared after filter changes
    setSelected((prev) => {
      const next: Record<RowKey, boolean> = {};
      const keys = new Set(rows.map((r) => r.key));
      for (const key of Object.keys(prev)) {
        if (keys.has(key) && prev[key]) next[key] = true;
      }
      return next;
    });
  }, [selectedCategories, selectedProducts, search, includeVariants, requireBarcode]);

  const toggleAll = (checked: boolean) => {
    const next: Record<RowKey, boolean> = {};
    if (checked) {
      for (const row of rows) next[row.key] = true;
    }
    setSelected(next);
  };

  const applyGlobalCopies = () => {
    const n = Math.max(1, Number(globalCopies) || 1);
    const next = {...copies};
    for (const key of selectedKeys) {
      next[key] = n;
    }
    // If nothing selected, apply to all visible rows
    if (selectedKeys.length === 0) {
      for (const row of rows) next[row.key] = n;
    }
    setCopies(next);
  };

  const ensureLabelConfig = async () => {
    const [rowsRes] = await db.query(
      `SELECT * FROM ${Tables.setting} WHERE name = $name LIMIT 1`,
      {name: LABEL_PRINT_SETTING_NAME}
    );
    if (!rowsRes?.length) {
      await db.create(Tables.setting, {
        name: LABEL_PRINT_SETTING_NAME,
        values: DEFAULT_LABEL_PRINT_CONFIG,
      });
      return DEFAULT_LABEL_PRINT_CONFIG;
    }
    return normalizeLabelPrintConfig(rowsRes[0].values);
  };

  const printSelected = async () => {
    if (selectedKeys.length === 0) {
      notify({type: 'error', description: 'Select at least one item to print'});
      return;
    }
    if (!printer?.printer) {
      notify({type: 'error', description: 'Select a label printer'});
      return;
    }

    const selectedRows = rows.filter((r) => selected[r.key] && r.barcode);
    if (selectedRows.length === 0) {
      notify({type: 'error', description: 'Selected items have no barcode'});
      return;
    }

    setPrinting(true);
    try {
      const config = await ensureLabelConfig();
      const labels = selectedRows.map((r) => ({
        barcode: r.barcode,
        name: r.name,
        price: r.price,
        sku: r.sku,
        category: r.category,
        copies: Math.max(1, Number(copies[r.key]) || 1),
      }));

      const ok = await dispatchPrint(db, 'barcode-labels', {labels}, {
        printers: [{
          prints: 1,
          printers: [printer.printer],
        }],
        config: config as any,
      });

      if (ok) {
        notify({title: `Sent ${labels.length} label(s) to printer`});
      }
    } catch (e: any) {
      notify({type: 'error', description: e?.message || 'Print failed'});
    } finally {
      setPrinting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3">
        <div>
          <label>Categories</label>
          <ReactSelect
            isMulti
            isLoading={loadingCategories}
            options={categoryOptions}
            value={selectedCategories}
            onChange={(v: any) => setSelectedCategories(v || [])}
            className="w-full"
          />
        </div>
        <div>
          <label>Items</label>
          <ReactSelect
            isMulti
            isLoading={loadingProducts}
            options={productOptions}
            value={selectedProducts}
            onChange={(v: any) => setSelectedProducts(v || [])}
            className="w-full"
          />
        </div>
        <div>
          <Input
            label="Search name / barcode"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />
        </div>
        <div>
          <label>Label printer</label>
          <ReactSelect
            isLoading={loadingPrinters}
            options={labelPrinterOptions}
            value={printer}
            onChange={setPrinter}
            className="w-full"
            placeholder={labelPrinterOptions.length ? 'Select printer' : 'No label printers'}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-5 items-center">
        <Switch
          checked={includeVariants}
          onChange={(e) => setIncludeVariants(e.target.checked)}
        >
          Include variants
        </Switch>
        <Switch
          checked={requireBarcode}
          onChange={(e) => setRequireBarcode(e.target.checked)}
        >
          Only items with barcode
        </Switch>
        <div className="flex items-end gap-2">
          <Input
            type="number"
            label="Copies"
            className="w-24"
            value={globalCopies}
            onChange={(e) => setGlobalCopies(Number(e.target.value) || 1)}
            min={1}
          />
          <Button type="button" variant="secondary" onClick={applyGlobalCopies}>
            Apply to {selectedKeys.length > 0 ? 'selected' : 'all'}
          </Button>
        </div>
        <Button
          type="button"
          variant="primary"
          disabled={printing || selectedKeys.length === 0}
          onClick={printSelected}
        >
          <FontAwesomeIcon icon={faPrint} className="mr-2"/>
          Print {selectedKeys.length || ''} label{selectedKeys.length === 1 ? '' : 's'}
        </Button>
      </div>

      <div className="overflow-auto border border-neutral-200 rounded-lg bg-white">
        <table className="table table-hover w-full mb-0">
          <thead>
          <tr>
            <th className="w-12">
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                onChange={(e) => toggleAll(e.target.checked)}
              />
            </th>
            <th>Name</th>
            <th>Barcode</th>
            <th>Price</th>
            <th>Category</th>
            <th className="w-28">Copies</th>
          </tr>
          </thead>
          <tbody>
          {loadingProducts && (
            <tr>
              <td colSpan={6} className="text-center py-6 text-gray-500">Loading items…</td>
            </tr>
          )}
          {!loadingProducts && rows.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center py-6 text-gray-500">No items match the filters</td>
            </tr>
          )}
          {rows.map((row) => (
            <tr key={row.key} className={row.isVariant ? 'bg-neutral-50' : undefined}>
              <td>
                <Checkbox
                  checked={!!selected[row.key]}
                  onChange={(e) => setSelected((prev) => ({
                    ...prev,
                    [row.key]: e.target.checked,
                  }))}
                />
              </td>
              <td>
                {row.name}
                {row.isVariant && <span className="badge ml-2">variant</span>}
              </td>
              <td className="font-mono text-sm">{row.barcode || '—'}</td>
              <td>{formatNumber(row.price)}</td>
              <td>{row.category || '—'}</td>
              <td>
                <Input
                  type="number"
                  min={1}
                  className="w-20"
                  value={copies[row.key] ?? 1}
                  onChange={(e) => setCopies((prev) => ({
                    ...prev,
                    [row.key]: Math.max(1, Number(e.target.value) || 1),
                  }))}
                />
              </td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-gray-500">
        Configure label layout under Print settings → Label Print. Printers must have role Label (network / ZPL).
      </p>
    </div>
  );
};
