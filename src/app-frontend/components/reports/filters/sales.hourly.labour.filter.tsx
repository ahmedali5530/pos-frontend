import _ from "lodash";
import {REPORTS_SALES_HOURLY_LABOUR} from "../../../routes/frontend.routes";
import {ReactSelect} from "../../../../app-common/components/input/custom.react.select";
import {DateRange} from "./date.range";
import {Button} from "../../../../app-common/components/input/button";

export const SalesHourlyLabourFilter = () => {
  return (
    <form
      action={REPORTS_SALES_HOURLY_LABOUR}
      className="flex flex-col gap-3 items-start"
      target="_blank"
    >
      <DateRange isRequired label="Select a range"/>

      <div>
        <label htmlFor="hours">Hours</label>
        <ReactSelect name="hours[]" isMulti options={_.range(0, 23).map(item => ({
          label: item,
          value: item
        }))} id="hours" className="flex-1 self-stretch" />
      </div>

      <Button
        variant="primary"
        type="submit"
      >Generate</Button>
    </form>
  );
}