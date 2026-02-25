import {Switch} from "../../../../app-common/components/input/switch";
import {useAtom} from "jotai";
import {appState as AppState, defaultData, defaultState} from "../../../../store/jotai";
import {useEffect, useState} from "react";
import {useLoadData} from "../../../../api/hooks/use.load.data";
import {message as AntMessage} from "antd";
import localforage from "../../../../lib/localforage/localforage";
import {ReactSelect} from "../../../../app-common/components/input/custom.react.select";
import {Button} from "../../../../app-common/components/input/button";
import {useDB} from "../../../../api/db/db";
import useApi, {SettingsData} from "../../../../api/db/use.api";
import {Tables} from "../../../../api/db/tables";
import {Controller, useFieldArray, useForm} from "react-hook-form";
import {Printer} from "../../../../api/model/printer";
import {Input} from "../../../../app-common/components/input/input";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faRefresh, faRemove} from "@fortawesome/free-solid-svg-icons";
import {toRecordId} from "../../../../api/model/common";
import {yupResolver} from "@hookform/resolvers/yup";
import * as yup from 'yup';
import _ from 'lodash';
import {notify} from "../../../../app-common/components/confirm/notification";

export const GeneralSetting = () => {
  const [, setAppState] = useAtom(defaultState);
  const [defaultOptions, setDefaultOptions] = useAtom(defaultData);
  const {
    defaultDiscount,
    defaultPaymentType,
    defaultTax,
    // enableTouch,
    customerBox, requireCustomerBox
  } = defaultOptions;
  const [state] = useLoadData();
  const [messageApi, ] = AntMessage.useMessage();
  const [{progress, store, user, terminal}] = useAtom(AppState);

  const db = useDB();
  const {
    data: printers
  } = useApi<SettingsData<Printer>>(Tables.printer, [`store = ${store?.id}`]);

  useEffect(() => {
    if (progress === "Done") {
      messageApi.open({
        key: "loading",
        type: "success",
        content: `${progress}`,
      });

      setTimeout(() => messageApi.destroy(), 1000);
    } else {
      messageApi.open({
        key: "loading",
        type: "loading",
        content: `Loading ${progress}`,
        duration: 120,
      });
    }
  }, [progress]);

  const [isLoading, setLoading] = useState(false);

  const clearCache = async () => {
    setLoading(true);
    await localforage.removeItem("list");
    await localforage.removeItem("deviceList");
    await localforage.removeItem("discountList");
    await localforage.removeItem("taxList");
    await localforage.removeItem("paymentTypesList");
    // await action.load();

    setLoading(false);

    window.location.reload();
  };

  const {handleSubmit, control, formState: {errors}, reset} = useForm({
    resolver: yupResolver(yup.object({
      printers: yup.array(yup.object({
        printers: yup.array(yup.object({
          label: yup.string(),
          value: yup.string(),
        })).min(1, 'Please select some printers'),
        prints: yup.string().required('This is required')
      }))
    }))
  });

  const {
    fields,
    append,
    remove
  } = useFieldArray({
    name: 'printers',
    control: control
  });

  useEffect(() => {
    const loadSettings = async () => {
      const [setting] = await db.query(`SELECT * FROM ${Tables.setting} where name = $name and terminal = $terminal FETCH values.printers.printers`, {
        name: 'final_printers',
        terminal: toRecordId(terminal?.id)
      });

      if(setting.length > 0){
        reset({
          printers: setting[0].values.printers.map(item => ({
            printers: item.printers.map(p => ({
              label: p.name,
              value: p.id
            })),
            prints: item.prints
          }))
        });
      }
    }

    loadSettings();
  }, []);

  const savePrinters = async (values: any) => {
    const data = {
      terminal: toRecordId(terminal?.id),
      name: 'final_printers',
      values: {printers: []}
    };

    if(Array.isArray(values.printers)){
      let printers = [];
      values.printers.forEach(p => {
        printers.push({
          printers: p.printers.map(item => toRecordId(item.value)),
          prints: p.prints
        });
      });

      data.values.printers = printers;
    }

    const [setting] = await db.query(`SELECT * FROM ${Tables.setting} where name = $name and terminal = $terminal`, {
      name: data.name,
      terminal: data.terminal
    });

    if(setting.length > 0){
      await db.merge(toRecordId(setting[0].id), data);

      notify({
        title: 'Printer settings updated'
      })
    }else{
      await db.create(Tables.setting, data);
      notify({
        title: 'Printer settings added'
      })
    }
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-5 my-5">
        <table className="table">
          <tbody>
          <tr>
            <th className="text-end">User</th>
            <td>{user?.display_name}</td>
          </tr>
          <tr>
            <th className="text-end">Store</th>
            <td>{store?.name}</td>
          </tr>
          <tr>
            <th className="text-end">Terminal</th>
            <td>{terminal?.code}</td>
          </tr>
          </tbody>
        </table>
        <div className="inline-flex flex-col gap-5 justify-start">
          <div>
            <Button
              variant="warning"
              onClick={() => {
                clearCache();
              }}
              className="mr-3 flex-grow-0 gap-3"
              size="lg"
              disabled={isLoading}>
              {isLoading ? "Reloading..." : (
                <>
                  <FontAwesomeIcon icon={faRefresh} /> Reload Cache
                </>
              )}
            </Button>
          </div>

          {/*<Switch*/}
          {/*  checked={enableTouch}*/}
          {/*  onChange={(value) => {*/}
          {/*    setDefaultOptions((prev) => ({*/}
          {/*      ...prev,*/}
          {/*      enableTouch: value.target.checked,*/}
          {/*    }));*/}
          {/*  }}>*/}
          {/*  Enable Touch support? <span*/}
          {/*  className="badge rounded-full bg-primary-500 text-primary-100 p-1 px-2 uppercase text-xs">Experimental</span>*/}
          {/*</Switch>*/}

          <div className="flex gap-3">
            <Switch
              checked={customerBox}
              onChange={(value) => {
                setDefaultOptions((prev) => ({
                  ...prev,
                  customerBox: value.target.checked,
                }));

                if (!value.target.checked) {
                  setDefaultOptions((prev) => ({
                    ...prev,
                    requireCustomerBox: false
                  }));
                }
              }}>
              Show customer input?
            </Switch>

            {customerBox && (
              <Switch
                checked={requireCustomerBox}
                onChange={(value) => {
                  setDefaultOptions((prev) => ({
                    ...prev,
                    requireCustomerBox: value.target.checked,
                  }));
                }}>
                Require customer name with every order?
              </Switch>
            )}
          </div>
        </div>
      </div>
      <hr/>
      <h3 className="text-xl my-3">
        Default options (<span className="text-sm text-neutral-500">Saved in this device.</span>)
      </h3>
      <div className="grid grid-cols-4 gap-5 my-5">
        <div>
          <label>Tax</label>
          <ReactSelect
            options={state.taxList.list.map((item) => {
              return {
                label: item.name + " " + item.rate,
                value: JSON.stringify(item),
              };
            })}
            isClearable
            onChange={(value: any) => {
              if (value) {
                setAppState((prev) => ({
                  ...prev,
                  tax: JSON.parse(value.value),
                }));

                setDefaultOptions((prev) => ({
                  ...prev,
                  defaultTax: JSON.parse(value.value),
                }));
              } else {
                setAppState((prev) => ({
                  ...prev,
                  tax: undefined,
                }));

                setDefaultOptions((prev) => ({
                  ...prev,
                  defaultTax: undefined,
                }));
              }
            }}
            value={
              defaultTax
                ? {
                  label: defaultTax?.name + " " + defaultTax?.rate,
                  value: JSON.stringify(defaultTax),
                }
                : null
            }
          />
        </div>
        <div>
          <label>Discount</label>
          <ReactSelect
            options={state.discountList.list.map((item) => {
              return {
                label: item.name,
                value: JSON.stringify(item),
              };
            })}
            isClearable
            onChange={(value: any) => {
              if (value) {
                setAppState((prev) => ({
                  ...prev,
                  discount: JSON.parse(value.value),
                }));

                setDefaultOptions((prev) => ({
                  ...prev,
                  defaultDiscount: JSON.parse(value.value),
                }));
              } else {
                setAppState((prev) => ({
                  ...prev,
                  discount: undefined,
                }));

                setDefaultOptions((prev) => ({
                  ...prev,
                  defaultDiscount: undefined,
                }));
              }
            }}
            value={
              defaultDiscount
                ? {
                  label: defaultDiscount?.name,
                  value: JSON.stringify(defaultDiscount),
                }
                : null
            }
          />
        </div>
        <div>
          <label>Payment type</label>
          <ReactSelect
            options={state.paymentTypesList.list.map((item) => {
              return {
                label: item.name,
                value: JSON.stringify(item),
              };
            })}
            isClearable
            onChange={(value: any) => {
              if (value) {
                setDefaultOptions((prev) => ({
                  ...prev,
                  defaultPaymentType: JSON.parse(value.value),
                }));
              } else {
                setDefaultOptions((prev) => ({
                  ...prev,
                  defaultPaymentType: undefined,
                }));
              }
            }}
            value={
              defaultPaymentType
                ? {
                  label: defaultPaymentType?.name,
                  value: JSON.stringify(defaultPaymentType),
                }
                : null
            }
          />
        </div>
      </div>
      <hr/>
      <div>
        <h3 className="text-xl my-3">Set printers for this terminal</h3>
        <form onSubmit={handleSubmit(savePrinters)}>
          <button
            className="btn btn-secondary"
            type="button"
            onClick={() => {
              append({
                printers: [],
                prints: 1
              })
            }}
          >Add printer</button>

          {fields.length > 0 && (
            <div className="grid grid-cols-3 gap-5 my-3">
              <div>Printers</div>
              <div>Number of prints</div>
              <div>Remove</div>
            </div>
          )}
          {fields.map((printer, index) => (
            <div
              className="grid grid-cols-3 gap-5 my-3"
              key={printer.id}
            >
              <div>
                <Controller
                  render={({field}) => (
                    <ReactSelect
                      options={printers?.data?.map((item) => {
                        return {
                          label: item.name,
                          value: item.id,
                        };
                      })}
                      isClearable
                      onChange={field.onChange}
                      value={field.value}
                      isMulti
                    />
                  )}
                  name={`printers.${index}.printers`}
                  control={control}
                />
                {_.get(errors, ['printers', index, 'printers']) && (
                  <span className="text-danger-500">{_.get(errors, ['printers', index, 'printers', 'message'])}</span>
                )}
              </div>
              <div>
                <Controller
                  render={({field}) => (
                    <Input
                      type="number"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Prints"
                    />
                    )}
                  name={`printers.${index}.prints`}
                  control={control}
                />
                {_.get(errors, ['printers', index, 'prints']) && (
                  <span className="text-danger-500">{_.get(errors, ['printers', index, 'prints', 'message'])}</span>
                )}
              </div>
              <div>
                <Button
                  type="button"
                  className="btn btn-danger" iconButton
                  onClick={() => remove(index)}
                >
                  <FontAwesomeIcon icon={faRemove} />
                </Button>
              </div>
            </div>
          ))}

          <div className="mt-3">
            <button
              className="btn btn-primary"
              type="submit"
            >Save printers</button>
          </div>
        </form>
      </div>
    </div>
  );
}