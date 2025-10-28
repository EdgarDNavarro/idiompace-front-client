import { Routes, Route } from "react-router-dom";
import { StoryList } from "./components/StoryList";
import { StoryViewer } from "./components/StoryViewer";
import SignIn from "./components/auth/SignIn";
import SignUp from "./components/auth/SignUp";
import { ProtectedLayout } from "./components/ProtectedRoute";
import StudyFlashcards from "./components/flashcards/StudyFlashcards";
import ManageDecks from "./components/flashcards/ManageDecks";
import FlashcardsDeck from "./components/flashcards/FlashcardsDeck";
import ListPlans from "./components/plans/ListPlans";
import GenerateStory from "./components/stories/GenerateStory";

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
        <Route path="/generate-story" element={<GenerateStory />} />

      </Route>
    </Routes>
  );
}

export default App;
