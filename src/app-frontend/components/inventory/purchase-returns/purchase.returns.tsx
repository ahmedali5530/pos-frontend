import React, {useState} from "react";
import {createColumnHelper} from "@tanstack/react-table";
import {Button} from "../../../../app-common/components/input/button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEye, faPencilAlt, faPlus, faTrash, faDownload, faFile} from "@fortawesome/free-solid-svg-icons";
import {TableComponent} from "../../../../app-common/components/table/table";
import {CreatePurchaseReturn} from "./create.purchase.return";
import {ConfirmAlert} from "../../../../app-common/components/confirm/confirm.alert";
import {withCurrency} from "../../../../lib/currency/currency";
import {DateTime} from "luxon";
import {ViewPurchaseReturn} from "./view.purchase.return";
import useApi, {SettingsData} from "../../../../api/db/use.api";
import {Tables} from "../../../../api/db/tables";
import {useAtom} from "jotai";
import {appState} from "../../../../store/jotai";
import {useDB} from "../../../../api/db/db";
import {toRecordId} from "../../../../api/model/common";
import {PurchaseReturn} from "../../../../api/model/purchase_return";
import {Modal} from "../../../../app-common/components/modal/modal";
import {downloadArrayBuffer} from "../../../../lib/files/files";

export const PURCHASE_RETURN_FETCHES = ['purchase', 'created_by', 'store', 'items', 'items.item', 'documents'];

export const PurchaseReturns = () => {
  const [operation, setOperation] = useState('create');
  const [purchaseReturn, setPurchaseReturn] = useState<PurchaseReturn>();
  const [{store}] = useAtom(appState);
  const db = useDB();
  
  const [documentsModalOpen, setDocumentsModalOpen] = useState(false);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsReturnInvoice, setDocumentsReturnInvoice] = useState<number | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);

  const useLoadHook = useApi<SettingsData<PurchaseReturn>>(
    Tables.purchase_return,
    [`store = ${store?.id}`],
    ['created_at DESC'],
    0,
    10,
    PURCHASE_RETURN_FETCHES
  );

  const columnHelper = createColumnHelper<PurchaseReturn>();

  const columns: any = [
    columnHelper.accessor('invoice_number', {
      header: 'Return No.',
      cell: info => <ViewPurchaseReturn purchaseReturn={info.row.original}>
        <FontAwesomeIcon icon={faEye} className="mr-2"/>
        {info.getValue()}
      </ViewPurchaseReturn>
    }),
    columnHelper.accessor('purchase.purchase_number', {
      header: 'Purchase No.',
    }),
    columnHelper.accessor('store.name', {
      header: 'Store',
    }),
    columnHelper.accessor('created_by', {
      header: 'Created by',
      cell: info => info.getValue()?.name || info.getValue()?.username
    }),
    columnHelper.accessor('id', {
      id: 'total',
      header: 'Return total',
      cell: info => withCurrency(calculateReturnTotal(info.row.original)),
      enableColumnFilter: false,
      enableSorting: false
    }),
    columnHelper.accessor('created_at', {
      header: 'Return date',
      cell: info => DateTime.fromJSDate(new Date(info.getValue())).toFormat(import.meta.env.VITE_DATE_TIME_HUMAN_FORMAT)
    }),
    columnHelper.accessor("documents", {
      id: "return_documents",
      header: "Documents",
      enableSorting: false,
      enableColumnFilter: false,
      cell: (info) => {
        const docs = info.getValue();
        if (!docs || docs.length === 0) {
          return <span className="text-gray-400">-</span>;
        }
        return (
          <Button type="button" variant="secondary" className="w-[40px]" onClick={() => {
            openDocumentsModal(info.row.original);
          }}>
            <FontAwesomeIcon icon={faFile}/>
          </Button>
        );
      }
    }),
    columnHelper.accessor('id', {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      enableColumnFilter: false,
      cell: (info) => {
        return (
          <>
            <Button type="button" variant="primary" className="w-[40px]" onClick={() => {
              setOperation('update');
              setPurchaseReturn(info.row.original);
              setAddModal(true);
            }} tabIndex={-1}>
              <FontAwesomeIcon icon={faPencilAlt}/>
            </Button>
            <span className="mx-2 text-gray-300">|</span>
            <ConfirmAlert
              onConfirm={() => {
                deletePurchaseReturn(info.getValue().toString());
              }}
              confirmText="Yes, please"
              cancelText="No, wait"
              title="Confirm deletion"
              description="Are you sure to delete this purchase return?"
            >
              <Button type="button" variant="danger" className="w-[40px]" tabIndex={-1}>
                <FontAwesomeIcon icon={faTrash}/>
              </Button>
            </ConfirmAlert>
          </>
        )
      }
    })
  ];

  const calculateReturnTotal = (purchaseReturn: PurchaseReturn): number => {
    if (!purchaseReturn.items) return 0;
    
    const itemsCost = purchaseReturn.items.reduce((total, item) => {
      return total + (Number(item.price) || 0) * Number(item.quantity);
    }, 0);
    
    const variantsCost = purchaseReturn.items.reduce((total, item) => {
      const itemVariantTotal = item.variants?.reduce((vTotal, variant) => {
        return vTotal + (Number(variant.price) || 0) * Number(variant.quantity);
      }, 0) || 0;
      return total + itemVariantTotal;
    }, 0);
    
    return itemsCost + variantsCost;
  };

  const openDocumentsModal = async (entry: PurchaseReturn) => {
    setDocumentsModalOpen(true);
    setDocumentsLoading(true);
    setDocumentsReturnInvoice(entry.invoice_number || null);
    try {
      const [rows] = await db.query(
        `SELECT documents FROM ${Tables.purchase_return} WHERE id = $id FETCH documents`,
        { id: toRecordId(entry.id) }
      );
      setDocuments(rows?.[0]?.documents || []);
    } catch (error: any) {
      setDocuments([]);
      notify({
        type: "error",
        description: error?.message || "Failed to load purchase return documents"
      });
    } finally {
      setDocumentsLoading(false);
    }
  };

  const downloadDocument = (document: any) => {
    if (document?.content) {
      downloadArrayBuffer(document.content, document.name);
    }
  };

  async function deletePurchaseReturn(id: string) {
    await db.merge(toRecordId(id), {
      deleted_at: DateTime.now().toJSDate()
    });

    await useLoadHook.fetchData();
  }

  const [addModal, setAddModal] = useState(false);

  return (
    <>
      <TableComponent
        columns={columns}
        loaderLineItems={10}
        buttons={[
          <Button variant="primary" onClick={() => {
            setAddModal(true);
            setOperation('create');
          }}>
            <FontAwesomeIcon icon={faPlus} className="mr-2"/> Purchase Return
          </Button>
        ]}
        loaderHook={useLoadHook}
      />

      {addModal && (
        <CreatePurchaseReturn
          purchaseReturn={purchaseReturn}
          addModal={addModal}
          operation={operation}
          onClose={() => {
            setAddModal(false);
            useLoadHook.fetchData();
            setOperation('create');
            setPurchaseReturn(undefined);
          }}
        />
      )}

      <Modal
        open={documentsModalOpen}
        onClose={() => {
          setDocumentsModalOpen(false);
          setDocuments([]);
          setDocumentsReturnInvoice(null);
        }}
        title={documentsReturnInvoice ? `Purchase Return #${documentsReturnInvoice} documents` : "Purchase return documents"}
        size="sm"
      >
        {documentsLoading ? (
          <div>Loading documents...</div>
        ) : documents.length === 0 ? (
          <div>No documents found.</div>
        ) : (
          <div className="border border-gray-200 rounded p-2">
            {documents.map((document, index) => (
              <div key={`return_document_${index}`} className="flex items-center justify-between py-1 border-b border-gray-100 last:border-b-0">
                <span>{document.name} ({document.size} bytes)</span>
                <Button type="button" variant="secondary" onClick={() => downloadDocument(document)}>
                  <FontAwesomeIcon icon={faDownload} className="mr-2"/> Download
                </Button>
              </div>
            ))}
          </div>
        )}
      </Modal>

    </>
  );
}
