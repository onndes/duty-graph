import { NavLink } from 'react-router-dom';

function Header() {
  return (
    <header className="border-bottom">
      <nav className="navbar navbar-expand navbar-light bg-light fixed-top">
        <div className="container">
          <span className="navbar-brand">График дежурств</span>

          <ul className="navbar-nav">
            <li className="nav-item">
              <NavLink to="/" end className="nav-link">
                График
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink to="/participants" className="nav-link">
                Участники
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink to="/history" className="nav-link">
                История
              </NavLink>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}

export default Header;
