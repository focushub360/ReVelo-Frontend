import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Plus } from 'lucide-react';
import { quickAdd } from './records/recordConfig.js';
import { QuickAdd } from '../components/records/QuickAdd.jsx';
import { DocumentRegister } from './Documents.jsx';
import { Records } from './Records.jsx';

export function RecordPage({ title, endpoint, canUploadDocuments = false, canManageVehicles = false }) {
  const [adding, setAdding] = useState(null);
  const add = quickAdd[endpoint];
  const isDocumentPage = endpoint === 'documents';
  return (
    <>
      {add && (endpoint !== 'vehicles' || canManageVehicles) && (
        <div className="mb-4 flex justify-end">
          <button className="btn-primary" onClick={() => setAdding({})}>
            <Plus size={16} />
            {add.label}
          </button>
        </div>
      )}
      {adding !== null &&
        !isDocumentPage &&
        (adding.zone ? (
          createPortal(
            <div
              className="fixed inset-0 z-50 grid place-items-center bg-[#071d36]/55 p-4 backdrop-blur-sm"
              role="dialog"
              aria-modal="true"
              aria-label="Add parking space"
            >
              <div className="w-full max-w-3xl">
                <QuickAdd
                  key={`${endpoint}:${JSON.stringify(adding)}`}
                  endpoint={endpoint}
                  initialValues={adding}
                  close={() => setAdding(null)}
                />
              </div>
            </div>,
            document.body
          )
        ) : (
          <QuickAdd
            key={`${endpoint}:${JSON.stringify(adding)}`}
            endpoint={endpoint}
            initialValues={adding}
            close={() => setAdding(null)}
          />
        ))}
      {isDocumentPage ? (
        <DocumentRegister canUploadDocuments={canUploadDocuments} />
      ) : (
        <Records
          title={title}
          endpoint={endpoint}
          onAddSpace={setAdding}
          canManageVehicles={canManageVehicles}
        />
      )}
    </>
  );
}
