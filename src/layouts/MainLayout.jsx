import Header from '../components/Header';
import { Outlet } from 'react-router-dom';

function MainLayout() {
  return (
    <>
      <Header />

      <main className="container mt-4" style={{ paddingTop: '70px' }}>
        <Outlet />
      </main>
    </>
  );
}

export default MainLayout;
