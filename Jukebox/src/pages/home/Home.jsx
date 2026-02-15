import "@/pages/home/Home.scss";

import Lights from "@/components/FrontHome/Top/Lights/Lights";
import "@/components/FrontHome/Top/Lights/Lights.scss";
import QuizCoins from "@/components/FrontHome/Top/QuizCoins/QuizCoins";
import "@/components/FrontHome/Top/QuizCoins/QuizCoins.scss";
import QuizPlaylist from "@/components/FrontHome/Top/QuizPlaylist/QuizPlaylist";
import "@/components/FrontHome/Top/QuizPlaylist/QuizPlaylist.scss";
import Player from "@/components/FrontHome/Top/Player/Player";
import "@/components/FrontHome/Top/Player/Player.scss";
import QuizGame from "@/components/FrontHome/Top/QuizGame/QuizGame";
import "@/components/FrontHome/Top/QuizGame/QuizGame.scss";
import PlaylistWizard from "@/components/FrontHome/Top/PlaylistWizard/PlaylistWizard";
import "@/components/FrontHome/Top/PlaylistWizard/PlaylistWizard.scss";
import PlaylistPanel from "@/components/FrontHome/Top/Playlist/PlaylistPanel";
import "@/components/FrontHome/Top/Playlist/PlaylistPanel.scss";
import LogoutConfirm from "@/components/Shared/LogoutConfirm/LogoutConfirm";
import "@/components/Shared/LogoutConfirm/LogoutConfirm.scss";

import Artist from "@/components/FrontHome/Center/Artist/Artist";
import "@/components/FrontHome/Center/Artist/Artist.scss";
import SongList from "@/components/FrontHome/Center/SongList/SongList";
import "@/components/FrontHome/Center/SongList/SongList.scss";

const HomeContent = ({
  isPlaying, showVideo, playerRef, isQuizShaking,
  coins, onAddCoins, isQuizActive, onStartQuiz, onCloseQuiz,
  isWizardActive, onStartWizard, onCloseWizard,
  isPlaylistOpen, onClosePlaylist,
  isLogoutOpen, onLogoutConfirm, onLogoutCancel,
}) => {
  return (
    <>
      <section className="home-content__top-panels">
        {/* Left Panel */}
        <div className="home-content__left-quiz">
          {/* left lights */}
          <Lights turnOn />
          {/* Quiz Coins */}
          <QuizCoins isShaking={isQuizShaking} isStartQuizCoins={onStartQuiz} />
        </div>

        {/* Center Panel */}
        <div className="home-content__center-player">
          {/* Player */}
          <Player
            ref={playerRef}
            isPlaying={isPlaying}
            showVideo={showVideo}
          />
          {/* Quiz Game overlay */}
          <QuizGame
            isActive={isQuizActive}
            coins={coins}
            onAddCoins={onAddCoins}
            onClose={onCloseQuiz}
          />
          {/* Playlist Wizard overlay */}
          <PlaylistWizard
            isActive={isWizardActive}
            onClose={onCloseWizard}
          />
          {/* Playlist Panel overlay (toggled by IoList button) */}
          <PlaylistPanel
            isActive={isPlaylistOpen}
            onClose={onClosePlaylist}
          />
          {/* Logout confirm overlay */}
          <LogoutConfirm
            isActive={isLogoutOpen}
            onConfirm={onLogoutConfirm}
            onCancel={onLogoutCancel}
          />
        </div>

        {/* Right Panel */}
        <div className="home-content__right-playlist">
          {/* right lights */}
          <Lights turnOn />
          {/* Quiz Playlist */}
          <QuizPlaylist onStartWizard={onStartWizard} />
        </div>
      </section>
      {/* Center top */}
      <section className="home-content__center-top">
        {/* Artists */}
        <Artist />
      </section>
      {/* Center bottom */}
      <section className="home-content__center-bottom">
        {/* Song list */}
        <SongList />
      </section>
    </>
  );
};

export default HomeContent;
