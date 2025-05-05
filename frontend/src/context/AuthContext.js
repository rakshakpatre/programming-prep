import { useUser } from "@clerk/clerk-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

const AuthContext = () => {
  const { isLoaded, user } = useUser();
  const navigate = useNavigate();
  const location = useLocation(); // Get current URL location

  useEffect(() => {
    if (!isLoaded || !user) return; 

    const role = user?.publicMetadata?.role || "user"; 
    const path = location.pathname;

    // Avoid unnecessary redirects
    if (role === "admin" && !["/admin-dashboard", "/admin-quiz", "/admin-files", "/admin-quiz-list", "/admin-explore", "/admin-report"].includes(path)) {
      navigate("/admin-dashboard");
    } else if (role !== "admin" && !["/user-dashboard", "/user-quiz", "/user-quiz-exam", "/user-explore", "/user-solved-quiz"].includes(path)) {
      navigate("/user-dashboard");
    }
  }, [isLoaded, user, location.pathname, navigate]); // Add location.pathname to dependencies

  return null;
};

export default AuthContext;
