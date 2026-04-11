import {DateRangePickerProps as BaseDateRangePickerProps, DateValue, ValidationResult} from "react-aria-components";
import {useState} from "react";
import {DateTime} from "luxon";
import {DateRangePicker} from "../../../../app-common/components/react-aria/date.range.picker";
import {parseDate} from '@internationalized/date';

interface DateRangePickerProps<T extends DateValue> extends BaseDateRangePickerProps<T> {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
}

export function DateRange<T extends DateValue>({
  startName = 'start', endName = 'end', ...props
}: DateRangePickerProps<T>) {
  const dateFormat = import.meta.env.VITE_DATE_FORMAT;
  const currentDay = DateTime.now().toFormat(dateFormat);
  const dates = {
    "All time": "to",
    "Today": `${currentDay}to${currentDay}`,
    "Yesterday": `${DateTime.now().minus({'day': 1}).toFormat(dateFormat)}to${DateTime.now().minus({'day': 1}).toFormat(dateFormat)}`,
    "This week": `${DateTime.now().startOf('week').toFormat(dateFormat)}to${DateTime.now().endOf('week').toFormat(dateFormat)}`,
    "Last week": `${DateTime.now().minus({week: 1}).startOf('week').toFormat(dateFormat)}to${DateTime.now().minus({week: 1}).endOf('week').toFormat(dateFormat)}`,
    "This month": `${DateTime.now().startOf('month').toFormat(dateFormat)}to${DateTime.now().endOf('month').toFormat(dateFormat)}`,
    "Last month": `${DateTime.now().minus({month: 1}).startOf('month').toFormat(dateFormat)}to${DateTime.now().minus({month: 1}).endOf('month').toFormat(dateFormat)}`,
    "This year": `${DateTime.now().startOf('year').toFormat(dateFormat)}to${DateTime.now().endOf('year').toFormat(dateFormat)}`,
    "Last year": `${DateTime.now().minus({year: 1}).startOf('year').toFormat(dateFormat)}to${DateTime.now().minus({year: 1}).endOf('week').toFormat(dateFormat)}`,
    "Custom": "CUS"
  }

  const [isCustom, setCustom] = useState(false);
  const [preset, setPreset] = useState(['', '']);

  return (
    <div className="flex flex-col w-full">
      <label htmlFor="date-preset">Select a date</label>
      <select
        id="date-preset"
        onChange={(event) => {
          const value = event.target.value.split('to');
          if(value[0] === 'CUS') {
            setCustom(true);
          }else {
            setPreset(value);
            setCustom(false);
          }
        }}
        className="form-control bg-white self-center w-full"
      >
        {Object.keys(dates).map(item => (
          <option key={item} value={dates[item]}>{item}</option>
        ))}
      </select>
      {/*{!isCustom && (*/}
        <>
          <input type="hidden" name="start" value={preset[0]}/>
          <input type="hidden" name="end" value={preset[1]}/>
        </>
      {/*)}*/}

      {isCustom && (
        <DateRangePicker
          onChange={(value) => {
            setPreset([
              DateTime.fromJSDate(value?.start?.toDate()).toFormat(dateFormat),
              DateTime.fromJSDate(value?.end?.toDate()).toFormat(dateFormat),
            ])
          }}
          startName={'start-date'}
          endName={'end-date'}
          hideTimeZone
          shouldForceLeadingZeros
          defaultValue={{
            start: parseDate(DateTime.now().toISODate()),
            end: parseDate(DateTime.now().toISODate()),
          }}
          {...props}
        />
      )}

    </div>
  );
}