import { useState } from "react";


interface Props {
  setLogged: (value: boolean) => void;
}


function AdminLogin({ setLogged }: Props) {


  const [password, setPassword] = useState("");


  const login = () => {


    if(password === "admin123"){


      alert("Admin Login Successful");

      setLogged(true);


    }
    else{


      alert("Wrong Password");


    }


  };


  return(


    <section className="admin-login">


      <div className="admin-box">


        <h2>
          👑 Admin Login
        </h2>


        <input

          type="password"

          placeholder="Enter Admin Password"

          value={password}

          onChange={(e)=>setPassword(e.target.value)}

        />


        <button onClick={login}>

          Login

        </button>


      </div>


    </section>


  );


}


export default AdminLogin;