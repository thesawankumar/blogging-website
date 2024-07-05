import React, { useContext, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import InputBox from "../components/input.component";
import googleIcon from "../imgs/google.png";
import { Link, Navigate } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import axios from "axios";
import { storeInSession } from "../common/session";
import { UserContext } from "../App";

const UserAuthForm = ({ type }) => {
  const authForm = useRef();

  let {
    userAuth: { access_token },
    setUserAuth,
  } = useContext(UserContext);

  // console.log(access_token);

  const userAuthThroughServer = (serverRoute, formData) => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + serverRoute, formData)
      .then(({ data }) => {
        storeInSession("user", JSON.stringify(data));
        setUserAuth(data);
      })
      .catch(({ response }) => {
        toast.error(response.data.error);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let serverRoute = type == "sign-in" ? "/signin" : "/signup";
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password
    //formdata
    let form = new FormData(authForm.current);
    let formData = {};
    for (let [key, value] of form.entries()) {
      formData[key] = value;
    }
    let { fullname, email, password } = formData;

    if (fullname && fullname.length < 3) {
      toast.error("Full name must be at least 3 letters long");
      return;
    }

    if (!email.length) {
      toast.error("Enter Email");
      return;
    }

    if (!emailRegex.test(email)) {
      toast.error("Enter valid email");
      return;
    }

    if (!passwordRegex.test(password)) {
      toast.error(
        "Password must be at least 6 characters and contain at least one number, one uppercase letter, and one lowercase letter."
      );
      return;
    }
    userAuthThroughServer(serverRoute, formData);
  };

  return access_token ? (
    <Navigate to="/" />
  ) : (
    <AnimationWrapper keyValue={type}>
      <section className="h-cover flex items-center justify-center ">
        <Toaster />
        <form ref={authForm} className="w-[80%] max-w-[400px]">
          <h1 className="text-4xl font-gelasio capitalize text-center mb-12">
            {type == "sign-in" ? "Welcome Back" : "Join us today"}
          </h1>
          {type != "sign-in" ? (
            <InputBox
              name="fullname"
              type="text"
              placeholder="Full Name"
              icon=" fi-rr-user "
            />
          ) : (
            ""
          )}
          <InputBox
            name="email"
            type="email"
            placeholder="Email Address"
            icon=" fi-rr-envelope "
          />
          <InputBox
            name="password"
            type="password"
            placeholder="Password"
            icon=" fi-rr-key "
          />
          <button
            className="btn-dark center mt-14"
            type="submit"
            onClick={handleSubmit}
          >
            {type.replace("-", " ")}
          </button>
          <div className="relative w-full flex items-center gap-2 my-10 opacity-13 uppercase text-black font-bold">
            <hr className="w-1/2 border-black" />
            <p>or</p>
            <hr className="w-1/2 border-black" />
          </div>
          <button className=" btn-dark flex items-center justify-center gap-4 w-[90%] center">
            <img src={googleIcon} alt="google" className="w-5" />
            continue with google
          </button>

          {type == "sign-in" ? (
            <p className=" mt-6 text-dark-grey text-xl text-center">
              Don't have an account ?
              <Link to="/signup" className=" underline text-black text-xl ml-1">
                Join us today
              </Link>
            </p>
          ) : (
            <p className=" mt-6 text-dark-grey text-xl text-center">
              Already a member ?
              <Link to="/signin" className=" underline text-black text-xl ml-1">
                Sign in here
              </Link>
            </p>
          )}
        </form>
      </section>
    </AnimationWrapper>
  );
};

export default UserAuthForm;
