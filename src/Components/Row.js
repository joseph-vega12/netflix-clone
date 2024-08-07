import React, { useRef, useState, useEffect } from "react";
import axios from "../helpers/axios";
import "./Row.css";
import YouTube from "react-youtube";

const base_url = "https://image.tmdb.org/t/p/original/";
const base_url_movie = "https://api.themoviedb.org/3/movie/";
const API_KEY = process.env.REACT_APP_API_KEY;

function Row({ title, fetchUrl, isLargeRow }) {
  const [movies, setMovies] = useState([]);
  const [trailerUrl, setTrailerUrl] = useState("");
  const rowRef = useRef(null);

  useEffect(() => {
    async function fetchData() {
      const request = await axios.get(fetchUrl);
      setMovies(request.data.results);
      return request;
    }
    fetchData();
  }, [fetchUrl]);

  const opts = {
    height: "390",
    width: "100%",
    playerVars: {
      autoplay: 1,
    },
  };

  const handleClick = (movie) => {
    if (trailerUrl) {
      setTrailerUrl("");
    } else {
      axios
        .get(
          `${base_url_movie}${movie.id}?api_key=${API_KEY}&append_to_response=videos`
        )
        .then((movie) => {
          movie.data.videos.results
            .filter((trailers) => trailers.name === "Official Trailer")
            .map((result) => {
              setTrailerUrl(result.key);
            });
        })
        .catch((error) => {
          throw error;
        });
    }
  };

  const handleMouseDown = (e) => {
    rowRef.current.isDragging = true;
    rowRef.current.startX = e.pageX - rowRef.current.offsetLeft;
    rowRef.current.currentX = e.pageX;
  };

  const handleMouseLeave = () => {
    rowRef.current.isDragging = false;
  };

  const handleMouseUp = () => {
    rowRef.current.isDragging = false;
  };

  const handleMouseMove = (e) => {
    if (!rowRef.current.isDragging) return;

    e.preventDefault();
    const x = e.pageX;
    const walk = (x - rowRef.current.startX) * 1.5;
    rowRef.current.scrollLeft = rowRef.current.scrollLeft - walk;

    rowRef.current.startX = x;
  };

  return (
    <div className="row">
      <h2>{title}</h2>
      <div
        className="row__posters"
        ref={rowRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        {movies.map((movie) => (
          <img
            key={movie.id}
            onClick={() => handleClick(movie)}
            className={`row__poster ${isLargeRow && "row__posterLarge"}`}
            src={`${base_url}${
              isLargeRow ? movie.poster_path : movie.backdrop_path
            }`}
            alt={movie.name}
            draggable={false}
          />
        ))}
      </div>
      {trailerUrl && <YouTube videoId={trailerUrl} opts={opts} />}
    </div>
  );
}

export default Row;
