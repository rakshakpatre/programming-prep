import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ClerkProvider, RedirectToSignIn, SignedIn } from "@clerk/clerk-react";
import Home from "./pages/Home";
import SignInPage from "./components/SignInPage";
import SignUpPage from "./components/SignUpPage";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
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
            <Route path="/admin-dashboard" element={
              <SignedIn>
                <AdminDashboard />
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
