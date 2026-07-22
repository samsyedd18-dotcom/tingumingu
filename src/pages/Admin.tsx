import AdminLogin from "../components/AdminLogin";
import AdminPanel from "../components/AdminPanel";
import { useState } from "react";


function Admin(){

  const [logged, setLogged] = useState(false);


  return (

    <>
      {
        logged ? (

          <AdminPanel />

        ) : (

          <AdminLogin setLogged={setLogged} />

        )
      }
    </>

  );

}


export default Admin;