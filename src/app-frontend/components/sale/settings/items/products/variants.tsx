import {FC} from "react";
import {Controller, useFieldArray, UseFormReturn} from "react-hook-form";
import { Button } from "../../../../button";
import {Input} from "../../../../input";

interface ProductVariantsProps{
  useForm: UseFormReturn;
}

export const ProductVariants: FC<ProductVariantsProps> = ({
  useForm
}) => {
  const {fields, remove, append} = useFieldArray({
    control: useForm.control,
    name: 'variants'
  });

  return (
    <>
      <Button variant="primary" onClick={() => append({
        attributeName: '',
        barcode: Math.floor(Math.random() * 10000000000) + 1,
        price: null
      })} type="button">
        Add Variant
      </Button>
      {fields.map((item, index) => (
        <ProductVariant
          id={item.id}
          useForm={useForm}
          index={index}
          remove={remove} />
      ))}
    </>
  );
};

interface ProductVariantProps {
  id?: string;
  useForm: UseFormReturn;
  index?: number;
  remove?: (index: number) => void;
}
export const ProductVariant = ({
  id, useForm, index, remove
}: ProductVariantProps) => {
  return (
    <div className="grid grid-cols-4 my-5 gap-3" key={id}>
      <div>
        <label>Variant</label>
        <Controller
          render={(props) => (
            <Input onChange={props.field.onChange} value={props.field.value} className="w-full"/>
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
        />
      </div>
      <div>
        {(remove !== undefined && index !== undefined) && (
          <>
            <label className="block w-full">&nbsp;</label>
            <Button className="btn-danger" onClick={() => remove(index)}>Remove</Button>
          </>
        )}
      </div>
    </div>
  );
};

