import { createSlice } from "@reduxjs/toolkit";
import { logout } from "./authSlice";

const initialState = {
  //playback
  currentSong: null,
  currentIndex: 0,
  isPlaying: false,
  showVideo: false,

  //song list 
  songs: [],
  activePlaylistId: null,
  activeArtistId: null,

  //shared data
  artists: [],
  playlists: [],

  //playlist generation
  isGenerating: false,

  //coins
  coins: (() => {
    const saved = localStorage.getItem("jukebox_coins");
    return saved !== null ? Number(saved) : 5;
  })(),
  noCoinAttempt: 0,

  //songs played counter
  totalSongsPlayed: (() => {
    const saved = localStorage.getItem("jukebox_songs_played");
    return saved !== null ? Number(saved) : 0;
  })(),
};

const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    //set songs in the song list 
    setSongs: (state, action) => {
      state.songs = action.payload;
      state.currentIndex = 0;
      state.currentSong = null;
      state.isPlaying = false;
    },

    //play a specific song 1 coin cost
    playSong: (state, action) => {
      const { song, index } = action.payload;
      if (state.coins <= 0) {
        state.noCoinAttempt += 1;
        return;
      }
      state.currentSong = song;
      state.currentIndex = index;
      state.isPlaying = true;
      state.coins -= 1;
      state.totalSongsPlayed += 1;
      localStorage.setItem("jukebox_coins", state.coins);
      localStorage.setItem("jukebox_songs_played", state.totalSongsPlayed);
    },

    //play/pause
    togglePlay: (state) => {
      state.isPlaying = !state.isPlaying;
    },

    pause: (state) => {
      state.isPlaying = false;
    },

    //next/prev track cost 1 coin
    nextSong: (state) => {
      if (state.songs.length === 0) return;
      if (state.coins <= 0) {
        state.noCoinAttempt += 1;
        return;
      }
      const next = (state.currentIndex + 1) % state.songs.length;
      state.currentIndex = next;
      state.currentSong = state.songs[next];
      state.isPlaying = true;
      state.coins -= 1;
      state.totalSongsPlayed += 1;
      localStorage.setItem("jukebox_coins", state.coins);
      localStorage.setItem("jukebox_songs_played", state.totalSongsPlayed);
    },

    prevSong: (state) => {
      if (state.songs.length === 0) return;
      if (state.coins <= 0) {
        state.noCoinAttempt += 1;
        return;
      }
      const prev = state.currentIndex === 0
        ? state.songs.length - 1
        : state.currentIndex - 1;
      state.currentIndex = prev;
      state.currentSong = state.songs[prev];
      state.isPlaying = true;
      state.coins -= 1;
      state.totalSongsPlayed += 1;
      localStorage.setItem("jukebox_coins", state.coins);
      localStorage.setItem("jukebox_songs_played", state.totalSongsPlayed);
    },

    //toggle video/vinyl view
    toggleVideo: (state) => {
      state.showVideo = !state.showVideo;
    },

    setShowVideo: (state, action) => {
      state.showVideo = action.payload;
    },

    //sync coins and played from backend profile
    syncProfile: (state, action) => {
      state.coins = action.payload.coins;
      state.totalSongsPlayed = action.payload.totalSongsPlayed;
      localStorage.setItem("jukebox_coins", state.coins);
      localStorage.setItem("jukebox_songs_played", state.totalSongsPlayed);
    },

    //coins
    addCoins: (state, action) => {
      state.coins += action.payload;
      localStorage.setItem("jukebox_coins", state.coins);
    },

    spendCoin: (state) => {
      if (state.coins > 0) state.coins -= 1;
      localStorage.setItem("jukebox_coins", state.coins);
    },

    //track which playlist/artist is active in the song list
    setActivePlaylist: (state, action) => {
      state.activePlaylistId = action.payload;
      state.activeArtistId = null;
    },

    setActiveArtist: (state, action) => {
      state.activeArtistId = action.payload;
      state.activePlaylistId = null;
    },

    //shared data
    setArtists: (state, action) => {
      state.artists = action.payload;
    },

    setPlaylists: (state, action) => {
      state.playlists = action.payload;
    },

    addPlaylist: (state, action) => {
      state.playlists.unshift(action.payload);
    },

    //playlist generation
    setGenerating: (state, action) => {
      state.isGenerating = action.payload;
    },

    //apendsongs
    appendSongs: (state, action) => {
      state.songs.push(...action.payload);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logout, () => {
      localStorage.removeItem("jukebox_coins");
      localStorage.removeItem("jukebox_songs_played");
      return initialState;
    });
  },
});

export const {
  setSongs,
  playSong,
  togglePlay,
  pause,
  nextSong,
  prevSong,
  toggleVideo,
  setShowVideo,
  syncProfile,
  addCoins,
  spendCoin,
  setActivePlaylist,
  setActiveArtist,
  setArtists,
  setPlaylists,
  addPlaylist,
  setGenerating,
  appendSongs,
} = playerSlice.actions;

export default playerSlice.reducer;
