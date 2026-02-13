import { useSelector } from "react-redux";
import "@/components/Shared/Header/Header.scss";

const Header = () => {
  const isPlaying = useSelector((s) => s.player.isPlaying);
  const currentSong = useSelector((s) => s.player.currentSong);

  const showTrack = isPlaying && currentSong;
  const trackText = currentSong
    ? `${currentSong.artistName || "Unknown"} - ${currentSong.title || "Untitled"}`
    : "";

  return (
    <header className="jukebox-header">
      <div className="jukebox-header__pulse jukebox-header__pulse--left">
        <span className="jukebox-header__pulse-center"></span>
        <span className="jukebox-header__pulse-ring jukebox-header__pulse-ring--1"></span>
        <span className="jukebox-header__pulse-ring jukebox-header__pulse-ring--2"></span>
        <span className="jukebox-header__pulse-ring jukebox-header__pulse-ring--3"></span>
      </div>

      <div className="jukebox-header__display">
        {/* Jukebox title — visible when paused */}
        <h1
          className={`jukebox-header__logo text-uppercase${
            showTrack ? " jukebox-header__logo--hidden" : ""
          }`}
        >
          Jukebox
        </h1>

        {/* Now playing track — visible when playing */}
        <div
          className={`jukebox-header__track${
            showTrack ? " jukebox-header__track--active" : ""
          }`}
        >
          <span className="jukebox-header__track-text">
            {trackText}
          </span>
        </div>
      </div>

      <div className="jukebox-header__pulse jukebox-header__pulse--right">
        <span className="jukebox-header__pulse-center"></span>
        <span className="jukebox-header__pulse-ring jukebox-header__pulse-ring--1"></span>
        <span className="jukebox-header__pulse-ring jukebox-header__pulse-ring--2"></span>
        <span className="jukebox-header__pulse-ring jukebox-header__pulse-ring--3"></span>
      </div>
    </header>
  );
};

export default Header;
