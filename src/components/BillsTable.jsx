function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function BillsTable({ bills, onOpenMeasurement, onEdit, onDelete, onToggleStatus }) {
  return (
    <table className="bills-table">
      <thead>
        <tr>
          <th>Bill No.</th>
          <th>Date</th>
          <th>Name</th>
          <th>Phone No.</th>
          <th>Cloth Price</th>
          <th>Stitching Price</th>
          <th>Total</th>
          <th>Shirt</th>
          <th>Pant</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {bills.map((bill) => (
          <tr key={bill.id}>
            <td>
              <button className="bill-no-link" onClick={() => onOpenMeasurement(bill)}>
                {bill.bill_no}
              </button>
            </td>
            <td className="date-cell">{formatDate(bill.created_at)}</td>
            <td className="name-cell">{bill.name}</td>
            <td>{bill.phone}</td>
            <td>{Number(bill.cloth_price).toFixed(2)}</td>
            <td>{Number(bill.stitching_price).toFixed(2)}</td>
            <td><strong>{Number(bill.total).toFixed(2)}</strong></td>
            <td>
              <StatusToggle
                on={bill.shirt_ready}
                label={bill.shirt_ready ? 'Shirt Ready' : 'Shirt Pending'}
                onClick={() => onToggleStatus(bill, 'shirt_ready')}
              />
            </td>
            <td>
              <StatusToggle
                on={bill.pant_ready}
                label={bill.pant_ready ? 'Pant Ready' : 'Pant Pending'}
                onClick={() => onToggleStatus(bill, 'pant_ready')}
              />
            </td>
            <td>
              <div className="row-actions">
                <button className="btn btn-ghost btn-sm" onClick={() => onEdit(bill)}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => onDelete(bill)}>Delete</button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function StatusToggle({ on, label, onClick }) {
  return (
    <button className={`status-toggle ${on ? 'on' : ''}`} onClick={onClick} title="Click to toggle">
      <span className="dot">{on ? '✔' : ''}</span>
      {label}
    </button>
  )
}
