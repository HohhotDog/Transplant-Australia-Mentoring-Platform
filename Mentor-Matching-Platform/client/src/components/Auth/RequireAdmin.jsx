import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function RequireAdmin({ accountType, children }) {
    const navigate = useNavigate();

    useEffect(() => {
        console.log("🔒 Checking accountType in RequireAdmin:", accountType);

        if (accountType !== 1) {
            alert("Access denied.");
            navigate("/");
        }
    }, [accountType, navigate]);

    return accountType === 1 ? children : null;
}

export default RequireAdmin;
