import {useMemo} from "react";
import {Modal} from "../../../app-common/components/modal/modal";
import {useNavigate} from "react-router";
import {POS} from "../../routes/frontend.routes";
import {AccountGroups} from "../../components/accounts/account.groups";
import {ChartOfAccounts} from "../../components/accounts/chart.of.accounts";
import {JournalEntries} from "../../components/accounts/journal.entries";
import {GeneralLedger} from "../../components/accounts/general.ledger";
import {TrialBalance} from "../../components/accounts/trial.balance";
import {ProfitLoss} from "../../components/accounts/profit.loss";
import {BalanceSheet} from "../../components/accounts/balance.sheet";
import {CashFlow} from "../../components/accounts/cash.flow";
import {CustomerStatement} from "../../components/accounts/customer.statement";
import {SupplierStatement} from "../../components/accounts/supplier.statement";
import {Tab, TabContent, TabControl, TabNav} from "../../../app-common/components/tabs/tabs";
import {useMediaQuery} from "react-responsive";

export const Accounts = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery({
    query: "(max-width: 1224px)",
  });

  const sidebarItems = useMemo(() => {
    return [
      {
        key: "account_groups",
        title: "Groups",
        component: <AccountGroups/>,
      },
      {
        key: "chart_of_accounts",
        title: "Chart of Accounts",
        component: <ChartOfAccounts/>,
      },
      {
        key: "journal_entries",
        title: "Journal Entries",
        component: <JournalEntries/>,
      },
      {
        key: "general_ledger",
        title: "General Ledger",
        component: <GeneralLedger/>,
      },
      {
        key: "trial_balance",
        title: "Trial Balance",
        component: <TrialBalance/>,
      },
      {
        key: "profit_loss",
        title: "Profit & Loss",
        component: <ProfitLoss/>,
      },
      {
        key: "balance_sheet",
        title: "Balance Sheet",
        component: <BalanceSheet/>,
      },
      {
        key: "cash_flow",
        title: "Cash Flow",
        component: <CashFlow/>,
      },
      {
        key: "customer_statement",
        title: "Customer Statement",
        component: <CustomerStatement/>,
      },
      {
        key: "supplier_statement",
        title: "Supplier Statement",
        component: <SupplierStatement/>,
      }
    ];
  }, []);

  return (
    <Modal
      open={true}
      onClose={() => navigate(POS)}
      size="full"
      title="Accounts"
      transparentContainer={false}
    >
      <TabControl
        defaultTab="account_groups"
        position={isMobile ? "top" : "left"}
        render={({isTabActive, setActiveTab}) => (
          <>
            <TabNav position={isMobile ? "top" : "left"}>
              {sidebarItems.map((item) => (
                <Tab
                  key={item.key}
                  isActive={isTabActive(item.key)}
                  onClick={() => setActiveTab(item.key)}
                >
                  {item.title}
                </Tab>
              ))}
            </TabNav>
            {sidebarItems.map((item) => (
              <TabContent
                holdState={false}
                key={item.key}
                isActive={isTabActive(item.key)}
              >
                {item.component}
              </TabContent>
            ))}
          </>
        )}
      />
    </Modal>
  );
};
