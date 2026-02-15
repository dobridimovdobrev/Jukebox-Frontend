import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "@/components/FrontHome/Center/Artist/Artist.scss";
import artistService from "@/services/artistService";
import songService from "@/services/songService";
import { setSongs, setActiveArtist, setArtists as setArtistsAction, playSong } from "@/redux/playerSlice";

const Artist = () => {
  const dispatch = useDispatch();
  const activeArtistId = useSelector((s) => s.player.activeArtistId);
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);

  // fetch artist first is default
  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const data = await artistService.search({ PageSize: 17 });
        const items = data.items || [];
        setArtists(items);
        dispatch(setArtistsAction(items));

        //load first artist default on page reload
        if (items.length > 0) {
          const first = items[0];
          dispatch(setActiveArtist(first.artistId));
          const firstPage = await songService.getByArtist(first.artistId, {
            PageSize: 100,
            PageNumber: 1,
          });
          let allSongs = firstPage.items || [];
          const total = firstPage.totalItems || allSongs.length;
          const totalPages = Math.ceil(total / 100);
          for (let page = 2; page <= totalPages; page++) {
            const nextPage = await songService.getByArtist(first.artistId, {
              PageSize: 100,
              PageNumber: page,
            });
            allSongs = [...allSongs, ...(nextPage.items || [])];
          }
          dispatch(setSongs(allSongs));
        }
      } catch (err) {
        console.error("Failed to fetch artists:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchArtists();
  }, [dispatch]);

  // on artist click fetch their song dispatch redux
  const handleArtistClick = async (artist) => {
    if (artist.artistId === activeArtistId) return;

    try {
      dispatch(setActiveArtist(artist.artistId));

      // fettch all songs artist if page > 100
      const firstPage = await songService.getByArtist(artist.artistId, {
        PageSize: 100,
        PageNumber: 1,
      });
      let allSongs = firstPage.items || [];
      const total = firstPage.totalItems || allSongs.length;
      const totalPages = Math.ceil(total / 100);

      for (let page = 2; page <= totalPages; page++) {
        const nextPage = await songService.getByArtist(artist.artistId, {
          PageSize: 100,
          PageNumber: page,
        });
        allSongs = [...allSongs, ...(nextPage.items || [])];
      }

      dispatch(setSongs(allSongs));

      // auto play first song if user have coins
      if (allSongs.length > 0) {
        dispatch(playSong({ song: allSongs[0], index: 0 }));
      }
    } catch (err) {
      console.error("Failed to fetch songs for artist:", err);
    }
  };

  if (loading) {
    return (
      <div className="artist">
        <div className="artist__loading">Loading artists...</div>
      </div>
    );
  }

  if (artists.length === 0) {
    return (
      <div className="artist">
        <div className="artist__empty">No artists available</div>
      </div>
    );
  }

  return (
    <div className="artist">
      <div className="artist__nav-prev"></div>
      <div className="artist__nav-next"></div>

      <Swiper
        modules={[Navigation]}
        slidesPerView={11}
        spaceBetween={5}
        navigation={{
          prevEl: ".artist__nav-prev",
          nextEl: ".artist__nav-next",
        }}
        className="artist__swiper"
      >
        {artists.map((artist, index) => (
          <SwiperSlide key={artist.artistId ?? `artist-${index}`}>
            <div
              className={`artist__box ${
                artist.artistId === activeArtistId ? "artist__box--active" : ""
              }`}
              onClick={() => handleArtistClick(artist)}
            >
              <img
                className="artist__image"
                src={artist.photo}
                alt={artist.name}
                width={80}
                height={80}
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  e.target.src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect fill='%23333' width='80' height='80'/%3E%3Ctext fill='%23C5A676' x='50%25' y='55%25' text-anchor='middle' font-size='12'%3E%3F%3C/text%3E%3C/svg%3E";
                }}
              />
              <span className="artist__name">{artist.name}</span>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Artist;
