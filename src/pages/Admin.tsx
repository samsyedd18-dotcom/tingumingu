import { useState } from "react";

import AdminLogin from "../components/AdminLogin";
import AdminPanel from "../components/AdminPanel";
import Sidebar from "../components/dashboard/Sidebar";
import Topbar from "../components/dashboard/Topbar";

function Admin() {

  const [logged, setLogged] = useState(false);

  const [activePage, setActivePage] = useState("dashboard");

  if (!logged) {
    return <AdminLogin setLogged={setLogged} />;
  }

  return (

    <div className="admin-layout">

      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
      />

      <div className="admin-main">

        <Topbar />

        <AdminPanel
          activePage={activePage}
        />

      </div>

    </div>

  );

}

export default Admin;