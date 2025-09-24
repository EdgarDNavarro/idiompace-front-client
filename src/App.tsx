import { Routes, Route } from "react-router-dom";
import { StoryList } from "./components/StoryList";
import { StoryViewer } from "./components/StoryViewer";
import SignIn from "./components/auth/SignIn";
import SignUp from "./components/auth/SignUp";
import { ProtectedLayout } from "./components/ProtectedRoute";
import ManageFlashcards from "./components/flashcards/ManageFlashcards";
import StudyFlashcards from "./components/flashcards/StudyFlashcards";

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
        <Route path="/flashcards" element={<ManageFlashcards />} />
        <Route path="/flashcards/try" element={<StudyFlashcards />} />
      </Route>
    </Routes>
  );
}

export default App;
