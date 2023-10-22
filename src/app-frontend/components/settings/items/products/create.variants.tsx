import { useCallback, useEffect, useState } from "react";
import { Controller, useFieldArray, UseFormReturn, useWatch } from "react-hook-form";
import { Button } from "../../../../../app-common/components/input/button";
import { Input } from "../../../../../app-common/components/input/input";
import { VariantGroup } from "./variant.group";


interface CreateVariantsProps {
  useForm: UseFormReturn;
}

export const CreateVariants = ({
  useForm
}: CreateVariantsProps) => {
  const [filter, setFilter] = useState('');

  const { control, watch, getValues } = useForm;
  const { fields, append, remove, } = useFieldArray({
    control: useForm.control,
    name: 'groups'
  });

  const { fields: variants, replace } = useFieldArray({
    name: 'variants',
    control: useForm.control
  })

  const [groupName, setGroupName] = useState('');

  const addGroup = useCallback(() => {
    if( groupName.length === 0 ) {
      return false;
    }

    append({
      groupName: groupName,
      variants: []
    });

    setGroupName('');
  }, [groupName, append]);

  const buildVariants = () => {
    const options = watch('groups', []);
    let sets = [[]];
    options.forEach((option: any) => {
      const new_sets: any = [];
      option.variants.forEach((item: any) => {
        new_sets.push(Array.from(sets, set => [...set, item.value]));
      });
      sets = new_sets.flatMap((set: any) => set);
    });

    if( sets.length === 1 && sets[0].length === 0 ) {
      return [];
    }

    replace(sets.map((item, index) => ({
      price: getValues('basePrice'),
      attributeValue: item.join('-'),
      barcode: (getValues('barcode') + index).toString(),
      quantity: '10'
    })));
  }

  const groups = useWatch({
    name: 'groups',
    defaultValue: [],
    control: useForm.control
  });

  useEffect(() => {
    buildVariants();
  }, [groups]);

  return (
    <div>
      <div className="input-group w-auto">
        <Input onChange={event => setGroupName(event.target.value)} value={groupName}/>
        <Button type="button" variant="primary" onClick={addGroup}>Add variant group</Button>
      </div>
      <div className="flex gap-5 flex-wrap">
        {fields.map((field: any, index) => (
          <Controller
            control={control}
            render={(props) => (
              <VariantGroup
                field={field}
                index={index}
                remove={remove}
                onChange={props.field.onChange}
              />
            )}
            name={`groups.${index}.variants`}
          />
        ))}
      </div>

      {variants.length > 0 && (
        <div>
          <Input onChange={(event) => setFilter(event.target.value)} value={filter} placeholder="Filter variants" />
        </div>
      )}

      <div>
        {variants.filter((item: any) => {
          if(filter.trim().length > 0){
            return item.attributeValue.toLowerCase().indexOf(filter.trim().toLowerCase()) !== -1;
          }

          return true;
        }).map((item: any, index) => (
          <div className="grid grid-cols-5 mb-5 gap-3" key={index}>
            <div>
              <label>Variant</label>
              <Controller
                render={(props) => (
                  <Input onChange={props.field.onChange} value={item.attributeValue} readOnly className="w-full"/>
                )}
                control={useForm.control}
                name={`variants.${index}.attributeValue`}
              />
            </div>
            <div>
              <label>Price</label>
              <Controller
                render={(props) => (
                  <Input onChange={props.field.onChange} value={props.field.value} className="w-full"/>
                )}
                control={useForm.control}
                name={`variants.${index}.price`}
                defaultValue={item.price}
              />
            </div>
            <div>
              <label>Quantity</label>
              <Controller
                render={(props) => (
                  <Input onChange={props.field.onChange} value={props.field.value} className="w-full"/>
                )}
                control={useForm.control}
                name={`variants.${index}.quantity`}
                defaultValue={item.quantity}
              />
            </div>
            <div>
              <label>Barcode</label>
              <Controller
                render={(props) => (
                  <Input onChange={props.field.onChange} value={props.field.value} className="w-full"/>
                )}
                control={useForm.control}
                name={`variants.${index}.barcode`}
                defaultValue={item.barcode}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
