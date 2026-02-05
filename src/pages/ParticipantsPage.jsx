import { useEffect, useState } from 'react';
import Participants from '../components/Participants';
import { getParticipants, addParticipant, removeParticipant } from '../db/participants';

function ParticipantsPage() {
  const [people, setPeople] = useState([]);
  const [fullName, setFullName] = useState('');
  const [note, setNote] = useState('');

  function loadParticipants() {
    getParticipants().then(setPeople);
  }

  useEffect(() => {
    loadParticipants();
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    if (!fullName.trim()) return;

    addParticipant(fullName.trim(), note.trim()).then(() => {
      setFullName('');
      setNote('');
      loadParticipants();
    });
  }

  function handleDelete(id) {
    if (!confirm('Видалити учасника?')) return;
    removeParticipant(id).then(loadParticipants);
  }

  return (
    <Participants
      people={people}
      fullName={fullName}
      note={note}
      onFullNameChange={setFullName}
      onNoteChange={setNote}
      onSubmit={handleSubmit}
      onDelete={handleDelete}
    />
  );
}

export default ParticipantsPage;
