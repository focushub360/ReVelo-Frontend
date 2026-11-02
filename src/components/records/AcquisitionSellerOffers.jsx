import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api.js';

export function AcquisitionSellerOffers() {
  const offers = useQuery({
    queryKey: ['acquisition-offers'],
    queryFn: () =>
      api.get('/acquisition-offers', { params: { limit: 100 } }).then((response) => response.data),
    retry: false,
  });
  const rows = offers.data?.items || [];
  return (
    <section className="card mt-6 overflow-hidden">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="font-bold text-navy">Seller offers from acquisitions</h2>
        <p className="mt-1 text-xs text-slate-500">
          Offers created in Acquisition appear here automatically.
        </p>
      </div>
      {offers.isLoading ? (
        <p className="p-5 text-sm text-slate-500">Loading acquisition offers…</p>
      ) : offers.isError ? (
        <p className="p-5 text-sm text-red-700">
          {offers.error?.response?.data?.error?.message || 'Unable to load acquisition offers.'}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Offer amount</th>
                <th>Status</th>
                <th>Expires</th>
                <th>Seller response</th>
              </tr>
            </thead>
            <tbody>
              {rows.length ? (
                rows.map((offer) => {
                  const vehicle = offer.acquisition?.vehicle;
                  return (
                    <tr key={offer._id}>
                      <td className="font-semibold text-navy">
                        {vehicle?.registration || vehicle?.vehicleCode || 'Vehicle'}
                      </td>
                      <td>{offer.amount?.toLocaleString() ?? '—'}</td>
                      <td>
                        <span className="badge bg-slate-100 text-slate-700">{offer.status}</span>
                      </td>
                      <td>{offer.expiresAt ? new Date(offer.expiresAt).toLocaleDateString() : '—'}</td>
                      <td>{offer.responseNote || '—'}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-sm text-slate-500">
                    No seller offers have been created from acquisitions yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {offers.data?.pages > 1 && (
            <p className="border-t px-5 py-3 text-sm text-slate-500">
              Showing the latest {rows.length} of {offers.data.total} acquisition offers
            </p>
          )}
        </div>
      )}
    </section>
  );
}
