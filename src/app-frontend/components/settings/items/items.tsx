import {Button} from "../../../../app-common/components/input/button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPencil, faPlus} from "@fortawesome/free-solid-svg-icons";
import React, {useState} from "react";
import {ITEM_FETCHES, Product} from "../../../../api/model/product";
import {TableComponent} from "../../../../app-common/components/table/table";
import {createColumnHelper} from "@tanstack/react-table";
import {ImportItems} from "./import.items";
import {ExportItems} from "./export.items";
import {CreateItem} from "./manage-item/items.create";
import {ConfirmAlert} from "../../../../app-common/components/confirm/confirm.alert";
import {Switch} from "../../../../app-common/components/input/switch";
import {ItemComponent} from "./item";
import {DropdownMenu, DropdownMenuItem} from "../../../../app-common/components/react-aria/dropdown.menu";
import useApi, {SettingsData} from "../../../../api/db/use.api";
import {Tables} from "../../../../api/db/tables";
import {useDB} from "../../../../api/db/db";
import {StringRecordId} from "surrealdb";
import {Terminal} from "../../../../api/model/terminal";
import {Store} from "../../../../api/model/store";
import {ProductStore} from "../../../../api/model/product.store";
import {CsvUploadModal} from "../../../../app-common/components/table/csv.uploader";
import {toRecordId} from "../../../../api/model/common";

export const Items = () => {
  const useLoadHook = useApi<SettingsData<Product>>(
    Tables.product, [], [], 0, 10, ITEM_FETCHES
  );
  const [entity, setEntity] = useState<Product>();
  const [operation, setOperation] = useState("create");
  const [modal, setModal] = useState(false);
  const [csvUploader, settCsvUploader] = useState(false);
  const db = useDB();

  const columnHelper = createColumnHelper<Product>();

  const columns: any[] = [
    columnHelper.accessor("name", {
      header: "Name",
    }),
    columnHelper.accessor("barcode", {
      header: "Barcode",
    }),
    columnHelper.accessor("base_price", {
      header: "Sale Price",
    }),
    columnHelper.accessor("cost", {
      header: "Purchase Price",
    }),
    columnHelper.accessor("department.name", {
      header: "Department",
    }),
    columnHelper.accessor("categories", {
      id: "categories.name",
      header: "Categories",
      cell: (info) =>
        info
          .getValue()
          ?.map((item) => <span key={item.id} className="badge">{item.name}</span>)
    }),
    columnHelper.accessor("suppliers", {
      id: "suppliers.name",
      header: "Suppliers",
      cell: (info) =>
        info
          .getValue()
          ?.map((item) => <span key={item.id} className="badge">{item.name}</span>)
    }),
    columnHelper.accessor("brands", {
      id: "brands.name",
      header: "Brands",
      cell: (info) =>
        info
          .getValue()
          ?.map((item) => <span key={item.id} className="badge">{item.name}</span>)
    }),
    columnHelper.accessor("variants", {
      header: "Variants",
      cell: (info) => `${info.getValue().length} variants`,
      enableSorting: false,
      enableColumnFilter: false,
    }),
    columnHelper.accessor("taxes", {
      id: "taxes.name",
      header: "Taxes",
      cell: (info) =>
        info
          .getValue()
          ?.map((item) => <span key={item.id} className="badge">{item.name}</span>)
    }),
    columnHelper.accessor("stores", {
      header: "Stores",
      cell: (info) =>
        info
          .getValue()
          ?.map((item: ProductStore) => <span key={item.id} className="badge">{item.store.name}</span>),
      enableColumnFilter: false,
      enableSorting: false,
    }),
    columnHelper.accessor("terminals", {
      header: "Terminals",
      cell: (info) =>
        info
          .getValue()
          ?.map((item: Terminal) => <span key={item.id} className="badge">{item.code}</span>),
      enableColumnFilter: false,
      enableSorting: false,
    }),
    columnHelper.accessor("id", {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      enableColumnFilter: false,
      cell: (info) => {
        return (
          <div className="flex gap-1">
            <ConfirmAlert
              onConfirm={() => {
                deleteItem(
                  info.row.original.id.toString(),
                  !info.row.original.is_active
                );
              }}
              confirmText="Yes, please"
              cancelText="No, wait"
              title="Confirmation"
              description={`Are you sure to ${
                info.row.original.is_active ? "de-" : ""
              }activate this item?`}
            >
              <Switch checked={info.row.original.is_active} onChange={() => {
              }}></Switch>
            </ConfirmAlert>
            <ItemComponent product={info.row.original}/>
            <Button
              variant="primary"
              onClick={() => {
                setEntity(info.row.original);
                setOperation("update");
                setModal(true);
              }}
              iconButton
            >
              <FontAwesomeIcon icon={faPencil}/>
            </Button>
          </div>
        );
      },
    }),
  ];

  async function deleteItem(id: string, status: boolean) {
    await db.merge(new StringRecordId(id), {
      is_active: status,
    });

    await useLoadHook.fetchData();
  }

  return (
    <>
      <TableComponent
        columns={columns}
        loaderHook={useLoadHook}
        buttons={[
          <Button
            variant="success"
            onClick={() => {
              settCsvUploader(true)
            }}
          >
            Import items
          </Button>,
          <Button
            variant="primary"
            onClick={() => {
              setModal(true);
              setOperation("create");
            }}>
            <FontAwesomeIcon icon={faPlus} className="mr-2"/> Item
          </Button>
        ]}
        loaderLineItems={12}
        loaderLines={10}
      />

      {modal && (
        <CreateItem
          addModal={modal}
          entity={entity}
          onClose={() => {
            setModal(false);
            setOperation("create");
            useLoadHook.fetchData();
            setEntity(undefined);
          }}
          operation={operation}
        />
      )}

      {csvUploader && (
        <CsvUploadModal
          isOpen={true}
          onClose={() => {
            settCsvUploader(false);
            useLoadHook.fetchData();
          }}
          fields={[{
            label: 'Name',
            name: 'name'
          }, {
            label: 'Barcode',
            name: 'barcode'
          }, {
            label: 'Department',
            name: 'department'
          }, {
            label: 'Sale price',
            name: 'base_price'
          }, {
            label: 'Sale unit',
            name: 'sale_unit'
          }, {
            label: 'Purchase price',
            name: 'cost'
          }, {
            label: 'Purchase unit',
            name: 'purchase_unit'
          }, {
            label: 'Taxes',
            name: 'taxes'
          }, {
            label: 'Terminals',
            name: 'terminals'
          }, {
            label: 'Categories',
            name: 'categories'
          }, {
            label: 'Suppliers',
            name: 'suppliers'
          }, {
            label: 'Brands',
            name: 'brands'
          }, {
            label: 'Stores',
            name: 'stores'
          }]}
          onCreateRow={async (rowData) => {
            try{
              // check for barcode uniquness
              const [item] = await db.query(`SELECT id from ${Tables.product} where barcode = $barcode or variants.barcode.any($barcode)`, {
                barcode: rowData.barcode
              });
              if(item.length > 0){
                throw new Error('Barcode already exists or is assigned to any item or variant');
              }

              const [department] = await db.query(`SELECT id from ${Tables.department} where name = $department`, {
                department: rowData.department.trim()
              });

              if(department.length === 0){
                throw new Error('Invalid department');
              }

              const [categories] = await db.query(`SELECT id FROM ${Tables.category} where name IN $categories`, {
                categories: rowData.categories.split('|')
              });

              if(categories.length !== rowData.categories.split('|').filter(item => item !== '').length){
                throw new Error('Invalid categories');
              }

              const [stores] = await db.query(`SELECT * from ${Tables.store} where name IN $stores`, {
                stores: rowData.stores.split('|')
              });

              if(stores.length !== rowData.stores.split('|').filter(item => item !== '').length){
                throw new Error('Invalid stores');
              }

              const [brands] = await db.query(`SELECT id from ${Tables.brand} where name IN $brands`, {
                brands: rowData.brands.split('|')
              });

              if(brands.length !== rowData.brands.split('|').filter(item => item !== '').length){
                throw new Error('Invalid brands');
              }

              const [suppliers] = await db.query(`SELECT id from ${Tables.supplier} where name IN $suppliers`, {
                suppliers: rowData.suppliers.split('|')
              });

              if(suppliers.length !== rowData.suppliers.split('|').filter(item => item !== '').length){
                throw new Error('Invalid suppliers');
              }

              const [taxes] = await db.query(`SELECT id from ${Tables.tax} where name IN $taxes`, {
                taxes: rowData.taxes.split('|')
              });

              if(taxes.length !== rowData.taxes.split('|').filter(item => item !== '').length){
                throw new Error('Invalid taxes');
              }

              const [terminals] = await db.query(`SELECT * from ${Tables.terminal} where code IN $terminals`, {
                terminals: rowData.terminals.split('|')
              });

              if(terminals.length !== rowData.terminals.split('|').filter(item => item !== '').length){
                throw new Error('Invalid terminals');
              }

              const productData = {
                name: rowData.name,
                barcode: rowData.barcode,
                prices: [],
                base_price: Number(rowData.base_price),
                cost: Number(rowData.cost),
                sale_unit: rowData.sale_unit,
                purchase_unit: rowData.purchase_unit,
                quantity: Number(0),
                base_quantity: 1,
                brands: brands.map(item => toRecordId(item.id)),
                categories: categories.map(item => toRecordId(item.id)),
                department: department ? toRecordId(department[0].id) : null,
                manage_inventory: true,
                is_available: true,
                is_expire: false,
                suppliers: suppliers.map(item => toRecordId(item.id)),
                taxes: taxes.map(item => toRecordId(item.id)),
                terminals: terminals.map(item => toRecordId(item.id)),
                variants: []
              };

              const [itemId] = await db.create(Tables.product, productData);
              //
              const productStoreIds = [];
              if (stores.length > 0) {
                for (const s of stores) {
                  const psData = {
                    location: s.location,
                    product: itemId.id,
                    quantity: Number(0),
                    re_order_level: Number(1),
                    store: s.id
                  };

                  const [psRecord] = await db.insert(Tables.product_store, psData);
                  productStoreIds.push(toRecordId(psRecord.id));
                }
              }

              await db.merge(toRecordId(itemId), {stores: productStoreIds});

              for (const t of terminals) {
                await db.merge(t, {
                  products: Array.from(new Set([...(t?.products || []), itemId.id])),
                });
              }

            }catch(e){
              throw e;
            }
          }}
        />
      )}
    </>
  );
};
