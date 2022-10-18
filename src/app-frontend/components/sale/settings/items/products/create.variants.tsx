import {useCallback, useEffect, useState} from "react";
import {Controller, useFieldArray, UseFormReturn, useWatch} from "react-hook-form";
import {Button} from "../../../../button";
import {Input} from "../../../../input";
import {VariantGroup} from "./variant.group";


interface CreateVariantsProps {
  useForm: UseFormReturn;
}

export const CreateVariants = ({
                                 useForm
                               }: CreateVariantsProps) => {
  const {control, watch} = useForm;
  const {fields, append, remove,} = useFieldArray({
    control: useForm.control,
    name: 'groups'
  });

  const {fields: variants, replace } = useFieldArray({
    name: 'variants',
    control: useForm.control
  })

  const [groupName, setGroupName] = useState('');

  const addGroup = useCallback(() => {
    if (groupName.length === 0) {
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

    if (sets.length === 1 && sets[0].length === 0) {
      return [];
    }

    replace(sets.map(item => ({
      price: null,
      attributeValue: item.join('-'),
      barcode: ''
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
      <div>
        {variants.map((item: any, index) => (
          <div className="grid grid-cols-4 mb-5 gap-3" key={index}>
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
