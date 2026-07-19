import {toast} from "sonner";
import {Controller, useForm} from "react-hook-form";
import {useEffect} from "react";
import {Setting} from "../../../../api/model/setting";
import {useDB} from "../../../../api/db/db";
import {Modal} from "../../../../app-common/components/modal/modal";
import {Switch} from "../../../../app-common/components/input/switch";
import {Input} from "../../../../app-common/components/input/input";
import {Button} from "../../../../app-common/components/input/button";
import {ReactSelect} from "../../../../app-common/components/input/custom.react.select";
import {toRecordId} from "../../../../api/model/common";
import {
  DEFAULT_LABEL_PRINT_CONFIG,
  LabelPrintConfig,
  normalizeLabelPrintConfig,
} from "../../../../lib/print/label.print.config";

interface Props {
  open: boolean;
  onClose: () => void;
  data?: Setting;
}

const CODE_MODE_OPTIONS = [
  {label: 'Barcode', value: 'barcode'},
  {label: 'QR code', value: 'qrcode'},
  {label: 'Both', value: 'both'},
];

const BARCODE_TYPE_OPTIONS = [
  {label: 'Code 128', value: 'CODE128'},
  {label: 'EAN-13', value: 'EAN13'},
];

const FONT_SIZE_OPTIONS = [
  {label: 'Small', value: 'small'},
  {label: 'Medium', value: 'medium'},
];

export const LabelPrintForm = ({open, onClose, data}: Props) => {
  const db = useDB();
  const {handleSubmit, control, reset} = useForm<LabelPrintConfig>({
    defaultValues: DEFAULT_LABEL_PRINT_CONFIG,
  });

  useEffect(() => {
    if (open) {
      reset(normalizeLabelPrintConfig(data?.values));
    }
  }, [data?.values, open, reset]);

  const onSubmit = async (values: LabelPrintConfig) => {
    try {
      if (data?.id) {
        await db.merge(toRecordId(data.id), {
          values: {
            ...DEFAULT_LABEL_PRINT_CONFIG,
            ...values,
          },
        });
      }
      onClose();
      toast.success('Label print settings saved');
    } catch (e: any) {
      toast.error(e?.message || String(e));
    }
  };

  return (
    <Modal
      title={data ? `Update ${data.name}` : 'Label Print'}
      open={open}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex gap-5 flex-col mb-3">
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label>Code mode</label>
              <Controller
                name="codeMode"
                control={control}
                render={({field}) => (
                  <ReactSelect
                    value={CODE_MODE_OPTIONS.find((o) => o.value === field.value) || null}
                    onChange={(opt: any) => field.onChange(opt?.value || 'barcode')}
                    options={CODE_MODE_OPTIONS}
                  />
                )}
              />
            </div>
            <div>
              <label>Barcode type</label>
              <Controller
                name="barcodeType"
                control={control}
                render={({field}) => (
                  <ReactSelect
                    value={BARCODE_TYPE_OPTIONS.find((o) => o.value === field.value) || null}
                    onChange={(opt: any) => field.onChange(opt?.value || 'CODE128')}
                    options={BARCODE_TYPE_OPTIONS}
                  />
                )}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            <Controller
              name="showCodeHumanReadable"
              control={control}
              render={({field}) => (
                <Switch
                  checked={!!field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                >
                  Human-readable under barcode
                </Switch>
              )}
            />
            <Controller
              name="showName"
              control={control}
              render={({field}) => (
                <Switch
                  checked={!!field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                >
                  Show item name
                </Switch>
              )}
            />
            <Controller
              name="showBarcodeText"
              control={control}
              render={({field}) => (
                <Switch
                  checked={!!field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                >
                  Show barcode text
                </Switch>
              )}
            />
            <Controller
              name="showPrice"
              control={control}
              render={({field}) => (
                <Switch
                  checked={!!field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                >
                  Show price
                </Switch>
              )}
            />
            <Controller
              name="showSku"
              control={control}
              render={({field}) => (
                <Switch
                  checked={!!field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                >
                  Show SKU
                </Switch>
              )}
            />
            <Controller
              name="showCategory"
              control={control}
              render={({field}) => (
                <Switch
                  checked={!!field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                >
                  Show category
                </Switch>
              )}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div className="flex items-end">
              <Controller
                name="showCompanyName"
                control={control}
                render={({field}) => (
                  <Switch
                    checked={!!field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  >
                    Show company name
                  </Switch>
                )}
              />
            </div>
            <div>
              <Controller
                name="companyName"
                control={control}
                render={({field}) => (
                  <Input
                    label="Company name"
                    value={field.value || ''}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-3">
            <Controller
              name="labelWidthMm"
              control={control}
              render={({field}) => (
                <Input
                  type="number"
                  label="Width (mm)"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              name="labelHeightMm"
              control={control}
              render={({field}) => (
                <Input
                  type="number"
                  label="Height (mm)"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              name="dpi"
              control={control}
              render={({field}) => (
                <Input
                  type="number"
                  label="DPI"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              name="marginMm"
              control={control}
              render={({field}) => (
                <Input
                  type="number"
                  label="Margin (mm)"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>

          <div className="w-full md:w-1/2">
            <label>Font size</label>
            <Controller
              name="fontSize"
              control={control}
              render={({field}) => (
                <ReactSelect
                  value={FONT_SIZE_OPTIONS.find((o) => o.value === field.value) || null}
                  onChange={(opt: any) => field.onChange(opt?.value || 'medium')}
                  options={FONT_SIZE_OPTIONS}
                />
              )}
            />
          </div>
        </div>
        <Button type="submit" variant="primary">Save</Button>
      </form>
    </Modal>
  );
};
