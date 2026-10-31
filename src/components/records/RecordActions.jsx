import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { api } from '../../lib/api.js';
import { recordEditing } from '../../pages/records/recordConfig.js';
import { RecordEditor } from './RecordEditor.jsx';
import { VehicleDetailsModal } from './VehicleDetailsModal.jsx';

export function RecordActions({ endpoint, row, canManageVehicles = false }) {
  const qc = useQueryClient();
  const config = recordEditing[endpoint];
  const [editing, setEditing] = useState(false);
  const [viewing, setViewing] = useState(false);
  const refresh = () => {
    qc.invalidateQueries({ queryKey: [endpoint] });
    qc.invalidateQueries({ queryKey: ['dashboard'] });
  };
  const remove = useMutation({
    mutationFn: () => api.delete(`/records/${config.resource}/${row._id}`),
    onSuccess: refresh,
  });
  if (!config) return null;
  const destroy = () => {
    if (window.confirm('Delete this record permanently? This cannot be undone.')) remove.mutate();
  };
  return (
    <>
      <div className="flex items-center gap-2">
        {endpoint === 'vehicles' && (
          <button
            type="button"
            className="icon-btn"
            title="View vehicle details and images"
            aria-label={`View ${row.registration || 'vehicle'} details`}
            onClick={() => setViewing(true)}
          >
            <Eye size={15} />
          </button>
        )}
        <button className="icon-btn" title="Edit" onClick={() => setEditing(true)}>
          <Pencil size={15} />
        </button>
        <button
          className="icon-btn icon-btn-danger"
          title="Delete"
          onClick={destroy}
          disabled={remove.isPending}
        >
          <Trash2 size={15} />
        </button>
      </div>
      {viewing && (
        <VehicleDetailsModal
          row={row}
          close={() => setViewing(false)}
          canManageVehicles={canManageVehicles}
        />
      )}
      {editing &&
        createPortal(
          <RecordEditor config={config} row={row} close={() => setEditing(false)} saved={refresh} />,
          document.body
        )}
    </>
  );
}
