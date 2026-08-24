// Frostbite Toybox: the game canvas is the complete experience; no landing-page chrome competes with the arena.
import ErrorBoundary from "./components/ErrorBoundary";
import GameCanvas from "./components/GameCanvas";

function App() {
  return (
    <ErrorBoundary>
      <GameCanvas />
    </ErrorBoundary>
  );
}

export default App;
