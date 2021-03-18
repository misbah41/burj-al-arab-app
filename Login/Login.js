
import firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from './firebase.config';

import { useContext, useState } from 'react';
import { UserContext } from "../../App";
import { useHistory, useLocation } from "react-router";

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
};


function Login() {
  const provider = new firebase.auth.GoogleAuthProvider();
  const [newUser, setNewUser] = useState(false);
  const [loggedUser, setLoggedUser] = useContext(UserContext);
  const history = useHistory();
  const location = useLocation();
  const { from } = location.state || { from: { pathname: "/" } };

  const [user, setUser] = useState({
    isLogedIn: false,
    email: '',
    password: '',
    photo: '',
    error: '',
    success: '',
    UserName: ''
  });


  const handleSignin = () => {
    firebase.auth().signInWithPopup(provider)
      .then(res => {
        const { email, photoURL, displayName } = res.user;
        const signedUser = {
          isLogedIn: true,
          UserName: displayName,
          email: email,
          photo: photoURL
        };
        setUser(signedUser);
      })
      .catch(err => {
        alert('Try Again Please!!')
      })
  };

  const handleSignedOut = () => {
    firebase.auth().signOut()
      .then(() => {
        const signedOutUser = {
          isLogedIn: false,
          UserName: '',
          email: '',
          photo: ''
        };
        setUser(signedOutUser);
      }).catch((error) => {
        alert('Try Again Please !!')
      })
  };


  //form validation function
  const handleBlur = (e) => {
    let isFormValid;
    if (e.target.name === 'email') {
      isFormValid = /\S+@\S+\.\S+/.test(e.target.value);
    }
    if (e.target.name === 'password') {
      const isHasPassLength = e.target.value.length > 6;
      const isValidPassword = /\d{1}/.test(e.target.value)
      isFormValid = isHasPassLength && isValidPassword;
    }
    if (isFormValid) {
      const newUserInfo = { ...user };
      newUserInfo[e.target.name] = e.target.value;
      setUser(newUserInfo)
    }

  };


  const handleSubmit = (e) => {
    if (newUser && user.email && user.password) {
      firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
        .then((res) => {
          const newUserInfo = { ...user };
          newUserInfo.error = '';
          newUserInfo.success = true;
          setUser(newUserInfo)
          updateUserName(user.UserName);
        })
        .catch((error) => {
          const newUserInfo = { ...user }
          newUserInfo.error = error.message;
          newUserInfo.success = false;
          setUser(newUserInfo)
        })
    };

    if (!newUser && user.email && user.password) {
      firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then((res) => {
          const newUserInfo = { ...user };
          console.log(newUserInfo);
          newUserInfo.error = '';
          newUserInfo.success = true;
          setUser(newUserInfo);
          setLoggedUser(newUserInfo);
          history.replace(from);
        })
        .catch((error) => {
          const newUserInfo = { ...user }
          newUserInfo.error = error.message;
          newUserInfo.success = false;
          setUser(newUserInfo)
          setLoggedUser(newUserInfo);
        });
    }
    e.preventDefault();
  }

  const updateUserName = (name) => {
    var user = firebase.auth().currentUser;
    user.updateProfile({
      displayName: name,
    })
      .then(function () {
        console.log('user updated succesfully');

      }).catch(function (error) {
        console.log(error);
      });
  }


  return (
    <div className="container ">
      <h3>This Is App Component</h3>
      {
        user.isLogedIn ? <button onClick={handleSignedOut} className='btn btn-primary'>Sign Out</button> : <button onClick={handleSignin} className='btn btn-primary'>Sign in</button>
      }
      <h3>Our Own Authentication</h3>
      <div className="row">
        <div className="col-sm-8">
          <form onSubmit={handleSubmit} action="" className='form-group'>
            {
              newUser && <input onBlur={handleBlur} className='form-control my-3' name='UserName' type="text" placeholder='Enter Your Name' />
            }
            <input onBlur={handleBlur} className='form-control my-3' type="email" name="email" placeholder='Enter Your Email' />
            <input onBlur={handleBlur} className='form-control my-3' type="password" name="password" placeholder='Enter Your Password' />
            <input className='btn btn-primary' type="submit" value={newUser ? 'SignUp' : 'Signin'} />
          </form>
          <p className='text-danger'>{user.error}</p>
          {
            user.success && <p className='text-success'>User {newUser ? 'Created' : 'Loggedin'} Successfully</p>
          }
          <input type="checkbox" onChange={() => setNewUser(!newUser)} name="newUser" /> <label htmlFor='newUser'>New User Sign Up</label>
        </div>
      </div>
    </div>
  );
};

export default Login;
