import {ReactNode, useMemo, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowLeft, faCheckCircle, faChevronRight} from "@fortawesome/free-solid-svg-icons";
import {SalesAdvancedFilter} from "../../components/reports/filters/sales.advanced.filter";
import {CurrentInventoryFilter} from "../../components/reports/filters/current.inventory.filter";
import {DetailedInventoryFilter} from "../../components/reports/filters/detailed.inventory.filter";
import {PurchaseFilter} from "../../components/reports/filters/purchase.filter";
import {PurchaseReturnFilter} from "../../components/reports/filters/purchase.return.filter";
import {WasteFilter} from "../../components/reports/filters/waste.filter";
import {Button} from "../../../app-common/components/input/button";
import {Link} from "react-router-dom";
import {POS} from "../../routes/frontend.routes";
import {Modal} from "../../../app-common/components/modal/modal";
import {useNavigate} from "react-router";

export const Reports = () => {

  const reportCategories = useMemo(() => {
    return {
      // "Cash closing": {
      //   "Cash closing": <CashClosingFilter/>
      // },
      // "Dashboard": {
      //   "Sales": "",
      //   "Inventory": ""
      // },
      "Sales": {
        "Sales report": <SalesAdvancedFilter/>,

      },
      // "Products": {},
      "Inventory": {
        "Current Inventory": <CurrentInventoryFilter/>,
        "Detailed Inventory": <DetailedInventoryFilter/>,
        "Purchase": <PurchaseFilter/>,
        "Purchase Return": <PurchaseReturnFilter/>,
        "Waste": <WasteFilter/>,
      }
    };
  }, []);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [subCategory, setSubCategory] = useState({});
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [filter, setFilter] = useState<ReactNode>();

  const navigate = useNavigate();

  return (
    <Modal
      open={true}
      onClose={() => navigate(POS)}
      size="full"
      title="Reports"
      transparentContainer={false}
    >
      <div className="">
        <div className="grid grid-cols-9 gap-5">
          <div className="col-span-2">
            <div className="bg-white shadow py-5 rounded-lg">
              <h1 className="text-xl text-gray-600 px-5">Reports</h1>
              <div className="py-5">
                <ul>
                  {Object.keys(reportCategories).map((key) => (
                    <li
                      className="border-b py-2 px-5 flex justify-between cursor-pointer hover:bg-gray-100 items-center"
                      onClick={() => {
                        setSelectedCategory(key);
                        setSubCategory(reportCategories[key]);
                      }}
                      key={key}
                    >
                      {key}
                      {selectedCategory === key && (
                        <FontAwesomeIcon icon={faCheckCircle} className="text-success-700" size="lg"/>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="col-span-2">
            <div className="bg-white shadow py-5 rounded-lg">
              <h1 className="text-xl text-gray-600 px-5">Sub reports</h1>
              <div className="py-5">
                <ul>
                  {Object.keys(subCategory).map((key) => (
                    <li
                      className="border-b py-2 px-5 flex justify-between cursor-pointer hover:bg-gray-100 items-center"
                      onClick={() => {
                        setSelectedSubCategory(key);
                        setFilter(subCategory[key]);
                      }}
                      key={key}
                    >
                      {key}
                      {selectedSubCategory === key && (
                        <FontAwesomeIcon icon={faCheckCircle} className="text-success-700" size="lg"/>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="col-span-5">
            <div className="bg-white shadow p-5 rounded-lg">
              <h1 className="text-xl">
                {selectedCategory && selectedSubCategory ? (
                  <span className="text-gray-600">{selectedCategory} <FontAwesomeIcon icon={faChevronRight}
                                                                                      size="xs"/> {selectedSubCategory}</span>
                ) : 'Report filters'}
              </h1>
              <div className="py-5">
                {filter && filter}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}