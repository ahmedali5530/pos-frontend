import {REPORTS_CASH_CLOSING} from "../../../routes/frontend.routes";
import {DateRange} from "./date.range";
import {Button} from "../../../../app-common/components/input/button";

export const CashClosingFilter = () => {
  return (
    <form
      action={REPORTS_CASH_CLOSING}
      className="flex flex-col gap-3 items-start"
      target="_blank"
    >
      <DateRange isRequired label="Select a range" />

      <Button
        variant="primary"
        type="submit"
      >Generate</Button>
    </form>
  );
}