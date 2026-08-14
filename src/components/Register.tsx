import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

function Register() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {

    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    try {

      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      alert("Account Created Successfully ✅");

      setEmail("");
      setPassword("");

    } catch (error: any) {

      alert(error.message);

    }

  };

  return (

    <section className="login-page">

      <div className="login-box">

        <h2>Create Account</h2>

        <p>
          Register your Tingu Mingu account
        </p>

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

        <button onClick={handleRegister}>
          Register
        </button>

      </div>

    </section>

  );

}

export default Register;