import CreatableSelect from "react-select/creatable";
import {
  classNamePrefix,
  styleConfig,
  themeConfig
} from "../../../../../../app-common/components/input/custom.react.select";
import {Button} from "../../../../button";
import {KeyboardEventHandler, useEffect, useState} from "react";
import {OnChangeValue} from "react-select";
import {UseFormReturn} from "react-hook-form";


const components = {
  DropdownIndicator: null,
};

interface Option {
  readonly label: string;
  readonly value: string;
}

const createOption = (label: string) => ({
  label,
  value: label,
});

interface VariantGroupProps {
  field: any;
  index: number;
  remove: (index: number) => void;
  onChange: (value: Option[]) => void;
}
export const VariantGroup = ({
  field, index, remove, onChange
}: VariantGroupProps) => {
  const [inputValue, setInputValue] = useState('');
  const [value, setValue] = useState<Option[]>([]);

  const handleChange = (
    value: any
  ) => {
    setValue(value);
  };
  const handleInputChange = (inputValue: string) => {
    setInputValue(inputValue);
  };

  const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = (event) => {
    if (!inputValue) return;
    switch (event.key) {
      case 'Enter':
      case 'Tab':
        setInputValue('');
        setValue((prev) => {
          if(!prev.find(item => item === createOption(inputValue))) {
            return [...prev, createOption(inputValue)]
          }

          return [...prev];
        })
        event.preventDefault();
    }
  };

  useEffect(() => {
    onChange(value);
  }, [value, onChange]);

  return (
    <div className="input-group my-5">
      <label className="input-addon">{field.groupName}</label>
      <CreatableSelect
        id={`group-${index}`}
        components={components}
        inputValue={inputValue}
        isClearable
        isMulti
        menuIsOpen={false}
        onChange={handleChange}
        onInputChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Type something and press enter..."
        value={value}
        theme={themeConfig}
        styles={styleConfig}
        classNamePrefix={classNamePrefix}
      />
      <Button onClick={() => remove(index)} className="btn-danger" type="button">Remove</Button>
    </div>
  );
}
