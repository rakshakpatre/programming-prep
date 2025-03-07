import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const AuthContext = () => {
  const { isLoaded, user } = useUser(); // Ensure Clerk is fully loaded
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoaded) return; // Wait until Clerk is fully loaded

    if (user) {
      const role = user?.publicMetadata?.role || "user"; // Default to "user" if role is undefined
      if (role === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/user-dashboard");
      }
    }
  }, [isLoaded, user, navigate]);

  return null;
};

export default AuthContext;
