import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import SchedulePage from './pages/SchedulePage';
import ParticipantsPage from './pages/ParticipantsPage';
import HistoryPage from './pages/HistoryPage';


function App() {
  // const [count, setCount] = useState(0);

  return (
    <>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<SchedulePage />} />
          <Route path="/participants" element={<ParticipantsPage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
