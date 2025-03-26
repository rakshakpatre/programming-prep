import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ClerkProvider, RedirectToSignIn, SignedIn } from "@clerk/clerk-react";
import Home from "./pages/Home";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import UserDashboard from "./pages/user/UserDashboard";
import UserExplore from "./pages/user/UserExplore";
import UserQuiz from "./pages/user/UserQuiz";
import UserQuizExam from "./pages/user/UserQuizExam";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminQuiz from "./pages/admin/AdminQuiz";
import AdminQuizList from "./pages/admin/AdminQuizList";
import AdminFile from "./pages/admin/AdminFile";
import AuthContext from "./context/AuthContext";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";


const PUBLISHABLE_KEY = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

function App() {
  return (
    <>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <Router>
          <AuthContext /> {/* Apply role-based redirection */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/sign-in/*" element={<SignInPage />} />
            <Route path="/sign-up/*" element={<SignUpPage />} />

            <Route path="/user-dashboard" element={
              <SignedIn>
                <UserDashboard />
              </SignedIn>
            } />
            <Route path="/user-quiz" element={
              <SignedIn>
                <UserQuiz />
              </SignedIn>
            } />
            <Route path="/user-quiz-exam" element={
              <SignedIn>
                <UserQuizExam />
              </SignedIn>
            } />
            <Route path="/user-explore" element={
              <SignedIn>
                <UserExplore />
              </SignedIn>
            } />
            <Route path="/admin-dashboard" element={
              <SignedIn>
                <AdminDashboard />
              </SignedIn>
            } />
            <Route path="/admin-quiz" element={
              <SignedIn>
                <AdminQuiz />
              </SignedIn>
            } />
            <Route path="/admin-quiz-list" element={
              <SignedIn>
                <AdminQuizList />
              </SignedIn>
            } />
            <Route path="/admin-files" element={
              <SignedIn>
                <AdminFile />
              </SignedIn>
            } />
            <Route path="*" element={<RedirectToSignIn />} />
          </Routes>
        </Router>
      </ClerkProvider>
    </>
  );
}

export default App;
