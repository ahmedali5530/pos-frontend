import React, {useState} from "react";
import {createColumnHelper} from "@tanstack/react-table";
import {DateTime} from "luxon";
import useApi, {SettingsData} from "../../../../api/db/use.api";
import {Tables} from "../../../../api/db/tables";
import {InventoryWaste} from "../../../../api/model/waste";
import {TableComponent} from "../../../../app-common/components/table/table";
import {formatNumber} from "../../../../lib/currency/currency";
import {Button} from "../../../../app-common/components/input/button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faDownload, faFile, faPencilAlt, faPlus, faTrash} from "@fortawesome/free-solid-svg-icons";
import {CreateWaste} from "./create.waste";
import {ConfirmAlert} from "../../../../app-common/components/confirm/confirm.alert";
import {useDB} from "../../../../api/db/db";
import {toRecordId} from "../../../../api/model/common";
import {Modal} from "../../../../app-common/components/modal/modal";
import {File as WasteFile} from "../../../../api/model/file";
import {downloadArrayBuffer} from "../../../../lib/files/files";
import {notify} from "../../../../app-common/components/confirm/notification";

export const Wastes = () => {
  const db = useDB();
  const [showModal, setShowModal] = useState(false);
  const [operation, setOperation] = useState<"create" | "update">("create");
  const [waste, setWaste] = useState<InventoryWaste>();
  const [documentsModalOpen, setDocumentsModalOpen] = useState(false);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsWasteInvoice, setDocumentsWasteInvoice] = useState<number | null>(null);
  const [documents, setDocuments] = useState<WasteFile[]>([]);

  const useLoadHook = useApi<SettingsData<InventoryWaste>>(Tables.waste, [], [], 0, 10, [
    "created_by",
    "store",
    "purchase",
    "items",
    "items.item"
  ]);

  const columnHelper = createColumnHelper<InventoryWaste>();

  const columns: any = [
    columnHelper.accessor("invoice_number", {
      header: "Invoice #"
    }),
    columnHelper.accessor("purchase.purchase_number", {
      header: "Purchase #",
      cell: (info) => info.getValue() || "-"
    }),
    columnHelper.accessor((row) => (row as any)?.store?.name || "-", {
      id: "store_name",
      header: "Store",
      cell: (info) => info.getValue()
    }),
    columnHelper.accessor("created_by.display_name", {
      header: "Created by",
      cell: (info) => info.getValue() || "-"
    }),
    columnHelper.accessor("items", {
      id: "waste_items",
      header: "Items",
      enableSorting: false,
      enableColumnFilter: false,
      cell: (info) => info.getValue()?.length || 0
    }),
    columnHelper.accessor("items", {
      id: "waste_quantity",
      header: "Quantity",
      enableSorting: false,
      enableColumnFilter: false,
      cell: (info) => {
        const quantity = (info.getValue() || []).reduce((total, current: any) => {
          const itemQuantity = Number(current.quantity || 0);
          const variantQuantity = (current.variants || []).reduce((variantTotal: number, variantItem: any) => {
            return variantTotal + Number(variantItem.quantity || 0);
          }, 0);

          return total + itemQuantity + variantQuantity;
        }, 0);

        return formatNumber(quantity);
      }
    }),
    columnHelper.accessor("documents", {
      id: "waste_documents",
      header: "Documents",
      enableSorting: false,
      enableColumnFilter: false,
      cell: (info) => (
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            openDocumentsModal(info.row.original);
          }}
          tabIndex={-1}>
          <FontAwesomeIcon icon={faFile} className="mr-3"/> {info.getValue()?.length || 0}
        </Button>
      )
    }),
    columnHelper.accessor("created_at", {
      header: "Created at",
      cell: (info) => {
        const value = info.getValue();
        const date = value instanceof Date ? DateTime.fromJSDate(value) : DateTime.fromISO(value);

        return date.isValid ? date.toFormat(import.meta.env.VITE_DATE_TIME_HUMAN_FORMAT) : "-";
      }
    }),
    columnHelper.accessor("id", {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      enableColumnFilter: false,
      cell: (info) => {
        return (
          <>
            <Button type="button" variant="primary" className="w-[40px]" onClick={() => {
              openEditWaste(info.row.original);
            }} tabIndex={-1}>
              <FontAwesomeIcon icon={faPencilAlt}/>
            </Button>
            <span className="mx-2 text-gray-300">|</span>
            <ConfirmAlert
              onConfirm={async () => {
                await deleteWaste(info.row.original);
              }}
              title="Confirm deletion"
              description={`Are you sure to delete waste invoice #${info.row.original.invoice_number}?`}
              confirmText="Delete"
              cancelText="Cancel"
            >
              <Button type="button" variant="danger" className="w-[40px]" tabIndex={-1}>
                <FontAwesomeIcon icon={faTrash}/>
              </Button>
            </ConfirmAlert>
          </>
        );
      }
    })
  ];

  const deleteWaste = async (entry: InventoryWaste) => {
    for (const item of entry.items || []) {
      await db.delete(toRecordId(item.id));
    }

    await db.delete(toRecordId(entry.id));
    await useLoadHook.fetchData();
  };

  const openEditWaste = async (entry: InventoryWaste) => {
    try {
      const [rows] = await db.query(
        `SELECT * FROM ${Tables.waste} WHERE id = $id FETCH store, purchase, items, items.item, items.variants, items.variants.variant`,
        {id: toRecordId(entry.id)}
      );

      setWaste(rows?.[0] || entry);
      setOperation("update");
      setShowModal(true);
    } catch (error: any) {
      notify({
        type: "error",
        description: error?.message || "Failed to load waste details"
      });
    }
  };

  const openDocumentsModal = async (entry: InventoryWaste) => {
    setDocumentsModalOpen(true);
    setDocumentsLoading(true);
    setDocumentsWasteInvoice(entry.invoice_number || null);

    try {
      const [rows] = await db.query(
        `SELECT documents FROM ${Tables.waste} WHERE id = $id FETCH documents`,
        {id: toRecordId(entry.id)}
      );
      setDocuments(rows?.[0]?.documents || []);
    } catch (error: any) {
      setDocuments([]);
      notify({
        type: "error",
        description: error?.message || "Failed to load waste documents"
      });
    } finally {
      setDocumentsLoading(false);
    }
  };

  const downloadWasteDocument = (document: WasteFile) => {
    const content = document?.content?.[0] || document?.content;
    if (!content) {
      notify({
        type: "warning",
        description: `No file content found for ${document.name}`
      });
      return;
    }

    downloadArrayBuffer(content, document.name);
  };

  return (
    <>
      <TableComponent
        columns={columns}
        loaderHook={useLoadHook as any}
        loaderLineItems={10}
        buttons={[
          <Button variant="primary" onClick={() => {
            setOperation("create");
            setWaste(undefined);
            setShowModal(true);
          }}>
            <FontAwesomeIcon icon={faPlus} className="mr-2"/> Waste
          </Button>
        ]}
      />

      {showModal && (
        <CreateWaste
          operation={operation}
          showModal={showModal}
          waste={waste}
          onClose={() => {
            setShowModal(false);
            setOperation("create");
            setWaste(undefined);
            useLoadHook.fetchData();
          }}
        />
      )}

      <Modal
        open={documentsModalOpen}
        onClose={() => {
          setDocumentsModalOpen(false);
          setDocuments([]);
          setDocumentsWasteInvoice(null);
        }}
        title={documentsWasteInvoice ? `Waste #${documentsWasteInvoice} documents` : "Waste documents"}
        size="sm"
      >
        {documentsLoading ? (
          <div>Loading documents...</div>
        ) : documents.length === 0 ? (
          <div>No documents found.</div>
        ) : (
          <div className="border border-gray-200 rounded p-2">
            {documents.map((document, index) => (
              <div key={`waste_document_${index}`} className="flex items-center justify-between py-1 border-b border-gray-100 last:border-b-0">
                <span>{document.name} ({document.size} bytes)</span>
                <Button type="button" variant="secondary" onClick={() => downloadWasteDocument(document)}>
                  <FontAwesomeIcon icon={faDownload} className="mr-2"/> Download
                </Button>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </>
  );
};
