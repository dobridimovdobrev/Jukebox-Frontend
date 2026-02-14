import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import playerReducer from "./playerSlice";
import userService from "@/services/userService";
import songService from "@/services/songService";

// actions
const PLAY_ACTIONS = ["player/playSong", "player/nextSong", "player/prevSong"];

// adding this middleware to call backend spendcoins and incrplaycount on play
const playSyncMiddleware = (store) => (next) => (action) => {
  const prevCoins = store.getState().player.coins;
  const result = next(action);

  if (PLAY_ACTIONS.includes(action.type)) {
    const newCoins = store.getState().player.coins;
    if (newCoins < prevCoins) {
      userService.spendCoins(1).catch(() => {});

      const song = store.getState().player.currentSong;
      if (song?.songId) {
        songService.incrementPlayCount(song.songId).catch(() => {});
      }
    }
  }

  return result;
};

// store
const store = configureStore({
  reducer: {
    auth: authReducer,
    player: playerReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(playSyncMiddleware),
});

export default store;