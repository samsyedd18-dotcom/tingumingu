function Login(){

  return(

   <section 
  className="login-page"
  id="login"
>

      <div className="login-box">

        <h2>
          Welcome Back
        </h2>

        <p>
          Login to your Tingu Mingu account
        </p>


        <input
          type="email"
          placeholder="Email"
        />


        <input
          type="password"
          placeholder="Password"
        />


        <button>
          Login
        </button>


        <span>
          Don't have an account? Register
        </span>


      </div>


    </section>

  );

}


export default Login;