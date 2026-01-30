import {Controller, UseFormReturn} from "react-hook-form";
import {StoresInput} from "../../../../../app-common/components/input/stores";
import {Input} from "../../../../../app-common/components/input/input";
import {getErrors} from "../../../../../lib/error/error";
import {Switch} from "../../../../../app-common/components/input/switch";

interface Props {
  useForm: UseFormReturn;
}

export const ItemInventory = ({
  useForm: {control, formState: {errors}, watch, register}
}: Props) => {

  const stores = watch('storesDropdown');
  const variants = watch('variants');
  const id = watch('id');
  const variantStores = watch('variant_stores');

  if(id){
    const stores = watch('stores');
    return (
      <>
        <div>
          <label className="w-full block">&nbsp;</label>
          <Controller
            control={control}
            name="manage_inventory"
            render={(props) => (
              <Switch
                checked={props.field.value}
                onChange={props.field.onChange}
              >
                Manage inventory?
              </Switch>
            )}
          />
          {getErrors(errors.manage_inventory)}
        </div>
        <div className="grid grid-cols-4 gap-3 gap-y-2 mb-4">
          <div className="col-span-4"></div>
          {stores?.length > 0 && (
            <div className="col-span-4">
              <div className="grid grid-cols-4 gap-3 font-bold">
                <div>Store</div>
                <div>Stock</div>
                <div>Location</div>
                <div>Re Order Level</div>
              </div>
            </div>
          )}

          <div className="col-span-4">
            {stores?.map((store: any, index: number) => (
              <div className="bg-gray-100 rounded p-3" key={index}>
                <div key={index} className="grid grid-cols-4 mb-3 gap-3 hover:bg-gray-200">
                  <div>
                    <input type="hidden" {...register(`stores.${index}.store`)} value={store.id}/>
                    {store.label}
                  </div>
                  <div>
                    <Controller
                      render={({field}) => (
                        <Input type="number" placeholder="Stock" onChange={field.onChange} value={field.value}
                               className="w-full"/>
                      )}
                      name={`stores.${index}.quantity`}
                      control={control}
                      defaultValue={10}
                    />
                  </div>
                  <div>
                    <Controller
                      render={({field}) => (
                        <Input placeholder="Location" onChange={field.onChange} value={field.value} className="w-full"/>
                      )}
                      name={`stores.${index}.location`}
                      control={control}
                    />
                  </div>
                  <div>
                    <Controller
                      render={({field}) => (
                        <Input type="number" placeholder="Re Order Level" onChange={field.onChange} value={field.value}
                               className="w-full"/>
                      )}
                      name={`stores.${index}.re_order_level`}
                      control={control}
                      defaultValue={1}
                    />
                  </div>
                </div>

                {variantStores?.length > 0 && (
                  <div className="px-3">
                    <h4 className="border-b-2 border-primary-500 inline-block mb-3">Variants</h4>

                    <div className="col-span-4">
                      {variants?.map((variant: any, variantIndex: number) => (
                        <div key={index + variantIndex} className="grid grid-cols-4 mb-3 gap-3 hover:bg-gray-200">
                          <div>
                            <input type="hidden" {...register(`variant_stores.${index}.${variantIndex}.store`)}
                                   value={store.value}/>
                            {variant.attribute_value}
                          </div>
                          <div>
                            <Controller
                              render={({field}) => (
                                <Input type="number" placeholder="Stock" onChange={field.onChange} value={field.value}
                                       className="w-full"/>
                              )}
                              name={`variant_stores.${index}.${variantIndex}.quantity`}
                              control={control}
                              defaultValue={10}
                            />
                          </div>
                          <div>
                            <Controller
                              render={({field}) => (
                                <Input placeholder="Location" onChange={field.onChange} value={field.value}
                                       className="w-full"/>
                              )}
                              name={`variant_stores.${index}.${variantIndex}.location`}
                              control={control}
                            />
                          </div>
                          <div>
                            <Controller
                              render={({field}) => (
                                <Input type="number" placeholder="Re Order Level" onChange={field.onChange}
                                       value={field.value} className="w-full"/>
                              )}
                              name={`variant_stores.${index}.${variantIndex}.re_order_level`}
                              control={control}
                              defaultValue={1}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div>
        <label className="w-full block">&nbsp;</label>
        <Controller
          control={control}
          name="manage_inventory"
          render={(props) => (
            <Switch
              checked={props.field.value}
              onChange={props.field.onChange}
            >
              Manage inventory?
            </Switch>
          )}
        />
        {getErrors(errors.manage_inventory)}
      </div>
      <div className="grid grid-cols-4 gap-3 gap-y-2 mb-4">

        <div className="col-span-4"></div>
        <StoresInput control={control} errors={errors} name="storesDropdown"/>
        <div className="col-span-4"></div>
        {stores?.length > 0 && (
          <div className="col-span-4">
            <div className="grid grid-cols-4 gap-3 font-bold">
              <div>Store</div>
              <div>Stock</div>
              <div>Location</div>
              <div>Re Order Level</div>
            </div>
          </div>
        )}

        <div className="col-span-4">
          {stores?.map((store: any, index: number) => (
            <div className="bg-gray-100 rounded p-3" key={index}>
              <div key={index} className="grid grid-cols-4 mb-3 gap-3 hover:bg-gray-200">
                <div>
                  <input type="hidden" {...register(`stores.${index}.store`)} value={store.value}/>
                  {store.label}
                </div>
                <div>
                  <Controller
                    render={({field}) => (
                      <Input type="number" placeholder="Stock" onChange={field.onChange} value={field.value}
                             className="w-full"/>
                    )}
                    name={`stores.${index}.quantity`}
                    control={control}
                    defaultValue={10}
                  />
                </div>
                <div>
                  <Controller
                    render={({field}) => (
                      <Input placeholder="Location" onChange={field.onChange} value={field.value} className="w-full"/>
                    )}
                    name={`stores.${index}.location`}
                    control={control}
                  />
                </div>
                <div>
                  <Controller
                    render={({field}) => (
                      <Input type="number" placeholder="Re Order Level" onChange={field.onChange} value={field.value}
                             className="w-full"/>
                    )}
                    name={`stores.${index}.re_order_level`}
                    control={control}
                    defaultValue={1}
                  />
                </div>
              </div>

              {variants?.length > 0 && (
                <div className="px-3">
                  <h4 className="border-b-2 border-primary-500 inline-block mb-3">Variants</h4>

                  <div className="col-span-4">
                    {variants?.map((variant: any, variantIndex: number) => (
                      <div key={index + variantIndex} className="grid grid-cols-4 mb-3 gap-3 hover:bg-gray-200">
                        <div>
                          <input type="hidden" {...register(`variant_stores.${index}.${variantIndex}.store`)}
                                 value={store.value}/>
                          {variant.attribute_value}
                        </div>
                        <div>
                          <Controller
                            render={({field}) => (
                              <Input type="number" placeholder="Stock" onChange={field.onChange} value={field.value}
                                     className="w-full"/>
                            )}
                            name={`variant_stores.${index}.${variantIndex}.quantity`}
                            control={control}
                            defaultValue={10}
                          />
                        </div>
                        <div>
                          <Controller
                            render={({field}) => (
                              <Input placeholder="Location" onChange={field.onChange} value={field.value}
                                     className="w-full"/>
                            )}
                            name={`variant_stores.${index}.${variantIndex}.location`}
                            control={control}
                          />
                        </div>
                        <div>
                          <Controller
                            render={({field}) => (
                              <Input type="number" placeholder="Re Order Level" onChange={field.onChange}
                                     value={field.value} className="w-full"/>
                            )}
                            name={`variant_stores.${index}.${variantIndex}.re_order_level`}
                            control={control}
                            defaultValue={1}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}