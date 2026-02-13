import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  togglePlay,
  nextSong,
  prevSong,
  addCoins as addCoinsAction,
  spendCoin,
  setShowVideo as setShowVideoAction,
  setPlaylists,
} from "@/redux/playerSlice";
import { logout } from "@/redux/authSlice";
import playlistService from "@/services/playlistService";
import "@/components/Shared/JukeboxLayout/JukeboxLayout.scss";
import Header from "@/components/Shared/Header/Header";
import "@/components/Shared/Header/Header.scss";
import HomeContent from "@/pages/home/Home";
import MainNavigation from "@/components/Shared/Navigation/MainNavigation";
import "@/components/Shared/Navigation/MainNavigation.scss";
import Controls from "@/components/FrontHome/Bottom/Controls/Controls";
import "@/components/FrontHome/Bottom/Controls/Controls.scss";
import Visualizer from "@/components/FrontHome/Bottom/Visualizer/Visualizer";
import "@/components/FrontHome/Bottom/Visualizer/Visualizer.scss";
import InsertCoins from "@/components/FrontHome/Bottom/InsertCoins/InsertCoins";
import "@/components/FrontHome/Bottom/InsertCoins/InsertCoins.scss";

const JukeboxLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Redux state (single source of truth for playback + coins)
  const isPlaying = useSelector((s) => s.player.isPlaying);
  const showVideo = useSelector((s) => s.player.showVideo);
  const coins = useSelector((s) => s.player.coins);
  const currentSong = useSelector((s) => s.player.currentSong);
  const noCoinAttempt = useSelector((s) => s.player.noCoinAttempt);

  // Flip state: derived from URL, but decoupled during animation
  const [isAnimatingToHome, setIsAnimatingToHome] = useState(false);
  const isFlipped = location.pathname.startsWith("/settings") && !isAnimatingToHome;

  /* Local UI states */
  const [isHomeShaking, setIsHomeShaking] = useState(false);
  const [isSettingsShaking, setIsSettingsShaking] = useState(false);
  const [isQuizShaking, setIsQuizShaking] = useState(false);
  const [lightOn, setLightOn] = useState(true);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [isWizardActive, setIsWizardActive] = useState(false);
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const playerRef = useRef(null);
  const layoutRef = useRef(null);

  // Sync YouTube iframe with Redux isPlaying state
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.controlYouTube(isPlaying ? "play" : "pause");
    }
  }, [isPlaying]);

  // Watch for no-coin play attempts → trigger quiz shake
  useEffect(() => {
    if (noCoinAttempt > 0) {
      setIsQuizShaking(true);
      setTimeout(() => setIsQuizShaking(false), 500);
    }
  }, [noCoinAttempt]);

  // Fetch user's playlists on mount
  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const data = await playlistService.getMy();
        dispatch(setPlaylists(Array.isArray(data) ? data : []));
      } catch {
        // Not logged in or API unavailable — ignore
      }
    };
    fetchPlaylists();
  }, [dispatch]);

  /* Lights function turn on, turn off */
  const handleLights = () => {
    setLightOn(!lightOn);
  };

  /* Rotation 180 deg on click Home icon from main navigation */
  const handleFlipToHome = () => {
    if (!location.pathname.startsWith("/settings")) {
      setIsHomeShaking(true);
      setTimeout(() => setIsHomeShaking(false), 500);
    } else {
      // Start CSS flip animation, navigate only after transition ends
      setIsAnimatingToHome(true);

      const onTransitionEnd = (e) => {
        if (e.propertyName === "transform") {
          layoutRef.current?.removeEventListener("transitionend", onTransitionEnd);
          navigate("/");
          setIsAnimatingToHome(false);
        }
      };

      layoutRef.current?.addEventListener("transitionend", onTransitionEnd);
    }
  };

  /* Rotation 180 deg on click Settings icon from main navigation */
  const handleFlipToSettings = () => {
    if (isFlipped) {
      setIsSettingsShaking(true);
      setTimeout(() => setIsSettingsShaking(false), 500);
    } else {
      navigate("/settings/dashboard");
    }
  };

  /* Insert coin: no manual increment, only shake quiz icon to prompt user to play */
  const handleInsertCoin = () => {
    setIsQuizShaking(true);
    setTimeout(() => setIsQuizShaking(false), 500);
  };

  /* Add coins earned from quiz */
  const handleAddCoins = (amount) => {
    dispatch(addCoinsAction(amount));
  };

  /* Only one center-player overlay active at a time.
     Close all others, then open the new one immediately (cross-fade). */
  const openOverlay = (openFn) => {
    setIsQuizActive(false);
    setIsWizardActive(false);
    setIsPlaylistOpen(false);
    setIsLogoutOpen(false);
    openFn();
  };

  /* Quiz game open/close */
  const handleStartQuiz = () => {
    openOverlay(() => setIsQuizActive(true));
  };

  const handleCloseQuiz = () => {
    setIsQuizActive(false);
  };

  /* Playlist wizard open/close */
  const handleStartWizard = () => {
    openOverlay(() => setIsWizardActive(true));
  };

  const handleCloseWizard = () => {
    setIsWizardActive(false);
  };

  /* Logout confirm */
  const handleLogoutClick = (e) => {
    e.preventDefault();
    openOverlay(() => setIsLogoutOpen(true));
  };

  const handleLogoutConfirm = () => {
    setIsLogoutOpen(false);
    dispatch(logout());
    navigate("/login");
  };

  /* Audio/Video Control buttons */
  const handlePlayPause = () => {
    if (!currentSong) return;
    if (!isPlaying && coins <= 0) {
      // Trying to resume with no coins → shake
      setIsQuizShaking(true);
      setTimeout(() => setIsQuizShaking(false), 500);
      return;
    }
    if (!isPlaying) {
      dispatch(spendCoin());
    }
    dispatch(togglePlay());
  };

  const handleToggleView = (video) => {
    dispatch(setShowVideoAction(video));
  };

  const handleSkipBack = () => {
    dispatch(prevSong());
  };

  const handleSkipForward = () => {
    dispatch(nextSong());
  };

  const handleSeekBack = () => {
    if (playerRef.current?.seekYouTube) {
      playerRef.current.seekYouTube(-10);
    }
  };

  const handleSeekForward = () => {
    if (playerRef.current?.seekYouTube) {
      playerRef.current.seekYouTube(10);
    }
  };

  const handlePlaylistClick = () => {
    if (isPlaylistOpen) {
      setIsPlaylistOpen(false);
    } else {
      openOverlay(() => setIsPlaylistOpen(true));
    }
  };

  const handleToggleMute = () => {
    if (isMuted) {
      playerRef.current?.unmuteYouTube();
    } else {
      playerRef.current?.muteYouTube();
    }
    setIsMuted(!isMuted);
  };

  return (
    <main className="main-page">
      <div className="jukebox-container">
        {/* Header Logo - Song Title */}
        <Header />
        {/* Home page */}
        <div ref={layoutRef} className={`jukebox-layout ${isFlipped ? "flipped" : ""}`}>
          <div className={`jukebox-layout__front ${isHomeShaking ? "shake" : ""}`}>
            <HomeContent
              lightOn={lightOn}
              isPlaying={isPlaying}
              showVideo={showVideo}
              playerRef={playerRef}
              isQuizShaking={isQuizShaking}
              coins={coins}
              onAddCoins={handleAddCoins}
              isQuizActive={isQuizActive}
              onStartQuiz={handleStartQuiz}
              onCloseQuiz={handleCloseQuiz}
              isWizardActive={isWizardActive}
              onStartWizard={handleStartWizard}
              onCloseWizard={handleCloseWizard}
              isPlaylistOpen={isPlaylistOpen}
              onClosePlaylist={() => setIsPlaylistOpen(false)}
              isLogoutOpen={isLogoutOpen}
              onLogoutConfirm={handleLogoutConfirm}
              onLogoutCancel={() => setIsLogoutOpen(false)}
            />
          </div>
          {/* Settings page */}
          <div className={`jukebox-layout__back ${isSettingsShaking ? "shake" : ""}`}>
            <Outlet />
          </div>
        </div>
        {/* Main Navigation */}
        <section className="jukebox-bottom">
          <div className="jukebox-bottom__panels">
            <MainNavigation
              onHomeClick={handleFlipToHome}
              onSettingsClick={handleFlipToSettings}
              onLogoutClick={handleLogoutClick}
              isFlipped={isFlipped}
            />
            {/* Controls */}
            <div className="jukebox-bottom__center-panel">
              <Controls
                isPlaying={isPlaying}
                onPlayPause={handlePlayPause}
                showVideo={showVideo}
                onToggleView={handleToggleView}
                onSkipBack={handleSkipBack}
                onSkipForward={handleSkipForward}
                onSeekBack={handleSeekBack}
                onSeekForward={handleSeekForward}
                onPlaylistClick={handlePlaylistClick}
                isMuted={isMuted}
                onToggleMute={handleToggleMute}
              />
              <Visualizer isPlaying={isPlaying} />
            </div>
            {/* Insert coins */}
            <InsertCoins
              coins={coins}
              onInsertCoin={handleInsertCoin}
              isInsertCoinFlipped={isFlipped}
            />
          </div>
        </section>
        {/* copyright */}
        <span className="jukebox-container__copyright">
          <p>Dobri Dimov Dobrev &copy; 2026</p>
        </span>
      </div>
    </main>
  );
};

export default JukeboxLayout;
