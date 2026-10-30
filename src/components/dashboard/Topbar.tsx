import {
  FaSearch,
  
 
} from "react-icons/fa";

function Topbar() {

  return (

    <div className="topbar">

      <div className="topbar-left">

        <div className="search-box">

          <FaSearch />

          <input
            type="text"
            placeholder="Search..."
          />

        </div>

      </div>

      <div className="topbar-right">

       

         
        <div className="admin-profile">



          

        </div>

      </div>

    </div>

  );

}

export default Topbar;