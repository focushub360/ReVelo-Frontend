import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api.js';

export function ParkingReleaseButton({ row }) {
  const qc = useQueryClient();
  const [releaseError, setReleaseError] = useState('');
  const release = useMutation({
    mutationFn: ({ vehicle, reason }) => api.post('/parking/release', { vehicle, reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['parking/slots'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['vehicles'] });
    },
    onError: (error) =>
      setReleaseError(error.response?.data?.error?.message || 'Unable to release this vehicle.'),
  });
  const releaseVehicle = () => {
    const registration = row.activeVehicle?.registration || 'this vehicle';
    if (!window.confirm(`Release ${registration} from ${row.code}? The slot will become available.`))
      return;
    const reason = window.prompt('Reason for releasing this vehicle:', 'Vehicle departed parking yard');
    if (!reason?.trim()) return;
    setReleaseError('');
    release.mutate({
      vehicle: row.activeVehicle?._id || row.activeVehicle?.id,
      reason: reason.trim(),
    });
  };
  if (
    row.status !== 'Occupied' ||
    !(row.activeVehicle?._id || row.activeVehicle?.id)
  ) return null;
  return (
    <div className="mt-3 border-t border-current/10 pt-3">
      <button
        type="button"
        className="btn-secondary w-full justify-center border-red-200 bg-white/80 px-3 py-2 text-xs font-semibold text-red-700 hover:border-red-300 hover:bg-red-50 hover:text-red-800"
        title="Release this vehicle and make the space available"
        onClick={releaseVehicle}
        disabled={release.isPending}
      >
        {release.isPending ? 'Releasing vehicle…' : 'Release vehicle'}
      </button>
      {releaseError && (
        <p role="alert" className="mt-2 text-xs leading-5 text-red-700">
          {releaseError}
        </p>
      )}
    </div>
  );
}
