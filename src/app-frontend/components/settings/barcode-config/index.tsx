import {useEffect} from "react";
import {Controller, useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import * as yup from "yup";
import {Switch} from "../../../../app-common/components/input/switch";
import {Input} from "../../../../app-common/components/input/input";
import {Button} from "../../../../app-common/components/input/button";
import {useDB} from "../../../../api/db/db";
import {Tables} from "../../../../api/db/tables";
import {toRecordId} from "../../../../api/model/common";
import {notify} from "../../../../app-common/components/confirm/notification";
import {
  BARCODE_CONFIG_SETTING_NAME,
  BarcodeConfig,
  DEFAULT_BARCODE_CONFIG,
} from "../../../../lib/barcode/barcode.config";
import {DynamicBarcodes} from "../dynamic-barcodes";

const schema = yup.object({
  enabled: yup.boolean().required(),
  prefix: yup.string().when("enabled", {
    is: true,
    then: (s) =>
      s
        .required("Prefix is required when dynamic EAN-13 is enabled")
        .matches(/^\d{2}$/, "Prefix must be exactly 2 digits"),
    otherwise: (s) => s.optional(),
  }),
});

export const BarcodeConfiguration = () => {
  const db = useDB();

  const {handleSubmit, control, reset, formState: {errors}} = useForm<BarcodeConfig>({
    resolver: yupResolver(schema),
    defaultValues: DEFAULT_BARCODE_CONFIG,
  });

  useEffect(() => {
    const load = async () => {
      const [rows] = await db.query(
        `SELECT * FROM ${Tables.setting} WHERE name = $name LIMIT 1`,
        {name: BARCODE_CONFIG_SETTING_NAME}
      );

      if (rows.length > 0) {
        const values = rows[0].values as Partial<BarcodeConfig>;
        reset({
          enabled: values.enabled ?? DEFAULT_BARCODE_CONFIG.enabled,
          prefix: String(values.prefix ?? DEFAULT_BARCODE_CONFIG.prefix).padStart(2, "0"),
        });
      }
    };

    load();
  }, [reset]);

  const onSave = async (values: BarcodeConfig) => {
    const data = {
      name: BARCODE_CONFIG_SETTING_NAME,
      values: {
        enabled: values.enabled,
        prefix: values.prefix.padStart(2, "0"),
      },
    };

    const [existing] = await db.query(
      `SELECT * FROM ${Tables.setting} WHERE name = $name LIMIT 1`,
      {name: BARCODE_CONFIG_SETTING_NAME}
    );

    if (existing.length > 0) {
      await db.merge(toRecordId(existing[0].id), data);
      notify({title: "Barcode configuration updated"});
    } else {
      await db.create(Tables.setting, data);
      notify({title: "Barcode configuration saved"});
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="shadow-xl bg-white rounded-xl border border-primary-300">
        <div className="p-5 border-b border-primary-300 bg-primary-100 text-primary-900 rounded-t-xl">
          Dynamic EAN-13 barcode
        </div>
        <form onSubmit={handleSubmit(onSave)} className="p-5 flex flex-col gap-5">
          <p className="text-sm text-gray-600">
            Scanned layout: [prefix 2 digits][product id 5 digits][quantity 5 digits][check digit] — 13 digits total.
            After saving, use <strong>Reload Cache</strong> in terminal Settings so POS picks up changes.
          </p>

          <div>
            <label htmlFor="barcode-prefix">Prefix (2 digits)</label>
            <Controller
              name="prefix"
              control={control}
              render={({field}) => (
                <Input
                  id="barcode-prefix"
                  type="text"
                  inputMode="numeric"
                  maxLength={2}
                  value={field.value}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "").slice(0, 2);
                    field.onChange(v);
                  }}
                  placeholder="20"
                  className="w-24 mt-1"
                />
              )}
            />
            {errors.prefix && (
              <span className="text-danger-500 text-sm">{errors.prefix.message}</span>
            )}
          </div>

          <div>
            <Button type="submit" variant="primary">
              Save configuration
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
