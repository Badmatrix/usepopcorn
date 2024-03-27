import { useEffect, useState } from "react";
import { NavBar, Search, NumResult } from "./component/NavBar";
import MovieDetails from "./component/MovieDetails";
import MoviesList from "./component/MoviesList";
import WatchedMoviesList from "./component/WatchedMoviesList";
import WatchedSummary from "./component/WatchedSummary";

export const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);
export const API_KEY = "48fcc99c";

export default function App() {
  const [watched, setWatched] = useState(function () {
    const storedData = localStorage.getItem("watched");
    return JSON.parse(storedData);
  });
  const [movies, setMovies] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  function handleSelectMovie(id) {
    setSelectedId(id === selectedId ? null : id);
  }
  function handleCloseMovie() {
    setSelectedId(null);
  }
  function handleAddWatched(newWatched) {
    setWatched((watched) => [...watched, newWatched]);
  }
  function handleDeleteWatched(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }

  useEffect(
    function () {
      localStorage.setItem("watched", JSON.stringify(watched));
    },
    [watched]
  );
  useEffect(
    function () {
      const controller = new AbortController();
      async function fetchMovies() {
        try {
          setError("");
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${API_KEY}&s=${query}`,
            { signal: controller.signal }
          );
          if (!res.ok)
            throw new Error("something went wrong cannot fetch movies");
          const data = await res.json();
          if (data.Response === "False") throw new Error(data.Error);
          // console.log(data);
          setMovies(data.Search);
          setError("");
        } catch (error) {
          if (error.name !== "AbortError") setError(error.message);
        } finally {
          setIsLoading(false);
        }
      }
      if (query.length < 3) {
        setIsLoading(false);
        setMovies([]);
        setError("");
      } else {
        handleCloseMovie();
        fetchMovies();
      }
      return function () {
        controller.abort();
      };
    },
    [query]
  );

  return (
    <div>
      <NavBar>
        <Search query={query} setQuery={setQuery} />
        <NumResult movies={movies} />
      </NavBar>
      <Main>
        <Box>
          {isLoading && <Loader />}
          {!isLoading && error && <ErrorMessage message={error} />}
          {!isLoading && !error && (
            <MoviesList movies={movies} onMovieClick={handleSelectMovie} />
          )}
        </Box>
        <Box>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              onCloseMovie={handleCloseMovie}
              onAddWatched={handleAddWatched}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMoviesList
                watched={watched}
                onDeleteWatched={handleDeleteWatched}
              />
            </>
          )}
        </Box>
      </Main>
    </div>
  );
}
export function Loader() {
  return <p className="loader">loading...</p>;
}
export function ErrorMessage({ message }) {
  return <p className="error">⛔ {message}</p>;
}
function Main({ children }) {
  return <main className="main">{children}</main>;
}
function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}
