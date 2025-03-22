import { useUser } from "@clerk/clerk-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

const AuthContext = () => {
  const { isLoaded, user } = useUser();
  const navigate = useNavigate();
  const location = useLocation(); // Get current URL location

  useEffect(() => {
    if (!isLoaded || !user) return; // Wait until Clerk is fully loaded

    const role = user?.publicMetadata?.role || "user"; // Default role is "user"
    const path = location.pathname;

    // Avoid unnecessary redirects
    if (role === "admin" && !["/admin-dashboard", "/admin-quiz", "/admin-files", "/admin-quiz-list"].includes(path)) {
      navigate("/admin-dashboard");
    } else if (role !== "admin" && !["/user-dashboard", "/user-quiz", "/user-explore"].includes(path)) {
      navigate("/user-dashboard");
    }
  }, [isLoaded, user, location.pathname, navigate]); // Add location.pathname to dependencies

  return null;
};

export default AuthContext;
