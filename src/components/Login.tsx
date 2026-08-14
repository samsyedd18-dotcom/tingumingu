import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";

import { auth } from "../firebase";
import { useAuth } from "../context/AuthContext";

function Login() {

  const navigate = useNavigate();
  const { user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {

    if (user) {
      navigate("/");
    }

  }, [user, navigate]);

  const handleLogin = async () => {

    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    try {

      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      alert("Login Successful ✅");

      navigate("/");

    } catch (error: any) {

      alert(error.message);

    }

  };

  return (

    <section className="login-page">

      <div className="login-box">

        <h2>Welcome Back</h2>

        <p>Login to your Tingu Mingu account</p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />

        <button onClick={handleLogin}>
          Login
        </button>

        <p style={{marginTop:"20px"}}>

          Don't have an account?

          <Link
            to="/register"
            style={{
              marginLeft:"8px",
              color:"#0d6efd",
              fontWeight:"600"
            }}
          >
            Register
          </Link>

        </p>

      </div>

    </section>

  );

}

export default Login;