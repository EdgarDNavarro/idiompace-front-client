import { Routes, Route } from "react-router-dom";
import { StoryList } from "./components/StoryList";
import { StoryViewer } from "./components/StoryViewer";
import SignIn from "./components/auth/SignIn";
import SignUp from "./components/auth/SignUp";
import { ProtectedLayout } from "./components/ProtectedRoute";
import StudyFlashcards from "./components/flashcards/StudyFlashcards";
import ManageDecks from "./components/flashcards/ManageDecks";
import FlashcardsDeck from "./components/flashcards/FlashcardsDeck";

function App() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={<SignIn />} />
      <Route path="/register" element={<SignUp />} />

      {/* Rutas privadas */}
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<StoryList />} />
        <Route path="/stories/:id" element={<StoryViewer />} />
        <Route path="/flashcards" element={<ManageDecks />} />
        <Route path="/flashcards/deck/:deckId" element={<FlashcardsDeck />} />
        <Route path="/flashcards/try/:deckId" element={<StudyFlashcards />} />
      </Route>
    </Routes>
  );
}

export default App;
