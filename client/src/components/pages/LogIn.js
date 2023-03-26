import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";

function Login(props) {
  return(
    <div>
      <h1>You are not logged in!</h1>
      <p>You can log in via: </p>
      <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
        {!props.userName && 
          <GoogleLogin 
            onSuccess={props.handleLogin}
            onError={()=>{
              console.log('Login Failed');
            }}
          />
        }
      </GoogleOAuthProvider>
    </div>
  );
}

export default Login;