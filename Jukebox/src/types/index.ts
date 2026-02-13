// artist
export interface Artist {
  artistId: number;
  name: string;
  photo: string;
  biography?: string;
  genre?: string;
  countryCode?: string;
  careerStart?: number;
  careerEnd?: number;
  isActive: boolean;
  songsCount: number;
  musicBrainzId?: string;
}

// song
export interface Song {
  songId: number;
  title: string;
  artistId: number;
  artistName?: string;
  albumId?: number;
  albumTitle?: string;
  duration: number;
  genre?: string;
  countryCode?: string;
  releaseYear?: number;
  youtubeId?: string;
  isrcCode?: string;
  musicBrainzId?: string;
}

// playlist
export interface Playlist {
  playlistId: number;
  name: string;
  description?: string;
  category?: string;
  songsCount: number;
  isGenerated: boolean;
  songs?: Song[];
}

// quiz
export interface Quiz {
  quizId: number;
  question: string;
  correctAnswer: string;
  incorrectAnswers: string[];
  difficulty: "easy" | "medium" | "hard";
  category: string;
  source: string;
  active: boolean;
}

// user
export interface User {
  token: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

// paginated response
export interface PaginatedResponse<T> {
  items: T[];
  totalItems: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// generate playlist request
export interface GeneratePlaylistRequest {
  playlistName: string;
  description?: string;
  category?: string;
  artists: { artistId: number }[];
}