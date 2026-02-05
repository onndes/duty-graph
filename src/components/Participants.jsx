function Participants({
  people,
  fullName,
  note,
  onFullNameChange,
  onNoteChange,
  onSubmit,
  onDelete,
}) {
  return (
    <div>
      <h4>Учасники</h4>

      {/* Form */}
      <form onSubmit={onSubmit} className="mb-4">
        <div className="form-group">
          <input
            className="form-control"
            placeholder="ПІБ"
            value={fullName}
            onChange={(e) => onFullNameChange(e.target.value)}
          />
        </div>

        <div className="form-group">
          <input
            className="form-control"
            placeholder="Примітка"
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
          />
        </div>

        <button className="btn btn-primary">Додати</button>
      </form>

      {/* List */}
      <table className="table table-sm table-bordered table-hover">
        <thead>
          <tr>
            <th style={{ maxWidth: '80px' }}>Примітка</th>
            <th>ПІБ</th>
            <th style={{ width: '40px' }}></th>
          </tr>
        </thead>
        <tbody>
          {people.map((p) => (
            <tr key={p.id}>
              <td style={{ maxWidth: '80px' }}>{p.note}</td>
              <td>{p.fullName}</td>
              <td style={{ width: '40px' }}>
                <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(p.id)}>
                  ✕
                </button>
              </td>
            </tr>
          ))}

          {people.length === 0 && (
            <tr>
              <td colSpan="3" className="text-center text-muted">
                Поки нікого немає
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Participants;
