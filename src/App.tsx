import { Routes, Route } from "react-router-dom";
import { StoryList } from "./components/StoryList";
import { StoryViewer } from "./components/StoryViewer";
import SignIn from "./components/auth/SignIn";
import SignUp from "./components/auth/SignUp";
import { ProtectedLayout } from "./components/ProtectedRoute";
import StudyFlashcards from "./components/flashcards/StudyFlashcards";
import ManageDecks from "./components/flashcards/ManageDecks";
import FlashcardsDeck from "./components/flashcards/FlashcardsDeck";
import Spanish from "./components/dictionaries/Spanish";
import English from "./components/dictionaries/English";
import Translation from "./components/dictionaries/Translation";
import ListPlans from "./components/plans/ListPlans";

function App() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={<SignIn />} />
      <Route path="/register" element={<SignUp />} />
      <Route path="/plans" element={<ListPlans />} />

      {/* Rutas privadas */}
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<StoryList />} />
        <Route path="/stories/:id" element={<StoryViewer />} />
        <Route path="/flashcards" element={<ManageDecks />} />
        <Route path="/flashcards/deck/:deckId" element={<FlashcardsDeck />} />
        <Route path="/flashcards/try/:deckId" element={<StudyFlashcards />} />

        <Route path="/dictionary/spanish" element={<Spanish />} />
        <Route path="/dictionary/english" element={<English />} />
        <Route path="/dictionary/translation" element={<Translation />} />
      </Route>
    </Routes>
  );
}

export default App;
