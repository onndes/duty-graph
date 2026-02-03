import { useEffect, useState } from 'react';
import { getParticipants, addParticipant, removeParticipant } from '../db/participants';

function Participants() {
  const [people, setPeople] = useState([]);
  const [fullName, setFullName] = useState('');
  const [note, setNote] = useState('');

  function load() {
    getParticipants().then(setPeople);
  }

  useEffect(() => {
    load();
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    if (!fullName.trim()) return;

    addParticipant(fullName.trim(), note.trim()).then(() => {
      setFullName('');
      setNote('');
      load();
    });
  }

  function handleDelete(id) {
    if (!confirm('Удалить человека?')) return;
    removeParticipant(id).then(load);
  }

  return (
    <div className=" ">
      <h4>Участники</h4>

      {/* Форма */}
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="form-group">
          <input
            className="form-control"
            placeholder="ФИО"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <input
            className="form-control"
            placeholder="Примечание"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <button className="btn btn-primary">Добавить</button>
      </form>

      {/* Список */}
      <table className="table table-sm table-bordered">
        <thead>
          <tr>
            <th>ФИО</th>
            <th>Примечание</th>
            <th style={{ width: '40px' }}></th>
          </tr>
        </thead>
        <tbody>
          {people.map((p) => (
            <tr key={p.id}>
              <td>{p.fullName}</td>
              <td>{p.note}</td>
              <td>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleDelete(p.id)}
                >
                  ✕
                </button>
              </td>
            </tr>
          ))}

          {people.length === 0 && (
            <tr>
              <td colSpan="3" className="text-center text-muted">
                Пока никого нет
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Participants;
