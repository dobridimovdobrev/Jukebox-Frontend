import { IoIosSettings } from "react-icons/io";
import { IoMdPower } from "react-icons/io";
import { FaHome } from "react-icons/fa";

const MainNavigation = ({ onHomeClick, onSettingsClick, onLogoutClick, isFlipped }) => {
  return (
    <nav className="main-nav">
      <ul className="main-nav__list d-flex justify-content-center align-items-center gap-3">
        <li>
          <a
            href="#"
            className={`main-nav__link fs-2${!isFlipped ? " main-nav__link--active" : ""}`}
            onClick={onHomeClick}
          >
            <FaHome />
            <h2 className="fs-6">Home</h2>
          </a>
        </li>
        <li>
          <a
            href="#"
            className={`main-nav__link fs-2${isFlipped ? " main-nav__link--active" : ""}`}
            onClick={onSettingsClick}
          >
            <IoIosSettings />
            <h2 className="fs-6">Settings</h2>
          </a>
        </li>
        <li>
          <a href="#" className="main-nav__link fs-2" onClick={onLogoutClick}>
            <IoMdPower />
            <h2 className="fs-6">Logout</h2>
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default MainNavigation;
