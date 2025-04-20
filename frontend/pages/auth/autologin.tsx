import React, { ChangeEvent, useEffect, useState } from 'react';
import { signIn, signOut, useSession, getCsrfToken, getSession } from 'next-auth/react';
import { InferGetServerSidePropsType } from 'next';
import Brand from './brand';
// import HomeQuestions from './home-questions'; // Ensure the correct import path
import ForgotPassword from './forgotPassword';
import { useRouter } from 'next/router';
import Link from 'next/link';


export default function SignIn({
  csrfToken,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { data: session } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const router = useRouter();
  const [errors, setErrors] = useState({
    passwordLength: false,
    passwordSpecialChar: false,
    passwordNumber: false,
    passwordAlpha: false,
    passwordMatch: false,
  });

  useEffect(() => {
    if (router.query.error) {
      setError(router.query.error as string);
    }
  }, [router.query]);



  if (session) {
    return (
      <div className="flex flex-col items-center p-8 rounded-lg shadow-lg max-w-md mx-auto">
        <Brand size="large"/>

        <h1 className="text-3xl font-bold text-gray-100 mt-6">RAGVerse</h1>

        <p className="text-lg text-gray-300 mt-4 text-center">
          Signed in as {session?.user?.email}. Your session has expired. Please sign in again.
        </p>

        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="mt-6 px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          Sign out
        </button>
      </div>
    );
  }

  // Validation handler for password
  const validatePassword = (pwd: string) => {
    const lengthValid = pwd.length >= 8 && pwd.length <= 64;
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    const hasNumber = /\d/.test(pwd);
    const hasAlpha = /[A-Za-z]/.test(pwd);

    setErrors((prevErrors) => ({
      ...prevErrors,
      passwordLength: !lengthValid,
      passwordSpecialChar: !hasSpecialChar,
      passwordNumber: !hasNumber,
      passwordAlpha: !hasAlpha,
    }));
  };

  // Handler for password change
  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    validatePassword(newPassword);
    setErrors((prevErrors) => ({
      ...prevErrors,
      passwordMatch: newPassword !== repeatPassword,
    }));
  };

  // Handler for repeat password change
  const handleRepeatPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newRepeatPassword = e.target.value;
    setRepeatPassword(newRepeatPassword);
    setErrors((prevErrors) => ({
      ...prevErrors,
      passwordMatch: newRepeatPassword !== password,
    }));
  };

  
  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setError(''); // Clear any existing errors

  //   const result = await signIn('credentials', {
  //     redirect: true, // Prevent redirect
  //     email,
  //     password,
  //     callbackUrl: '/', // You can specify where to redirect after success
  //   });
  //   if (result?.error) {
  //     setError(result.error); // Display error message
  //     alert(result.error);
  //   } else if (result?.url) {
  //     router.replace(result.url); // Redirect on successful sign-in
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.values(errors).some((error) => error)) {
      setError('Please resolve the errors before submitting.');
      return;
    }
    setError(''); // Clear any existing errors

    const result = await signIn('credentials', {
      redirect: true, // Prevent redirect
      email,
      password,
      callbackUrl: '/', // Redirect URL after sign-in
    });
    if (result?.error) {
      setError(result.error); // Display error message
      alert(result.error);
    } else if (result?.url) {
      router.replace(result.url); // Redirect on successful sign-in
    }
  };
  
  const handleGoogleSignIn = async () => {
    await signIn('google', {
      callbackUrl: '/', // Redirect after Google sign-in
    });
  };

  

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 text-black-800">
      <div className="flex md:flex-[3] flex-col justify-top items-center bg-black p-8">
        <Brand size="large"/>
        {/* <HomeQuestions /> */}
      </div>
      <div className="md:flex-[2] flex flex-col justify-center p-4 md:p-8">
        <div className="w-full max-w-md mx-auto">
          <Link
            className="flex cursor-pointer flex-col items-center hover:opacity-50"
            href="https://ourvedas.in/landing/index.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            {/* <img
              src="/images/our-vedas-logo.png"
              width="100"
              height="125"
              className="w-48 h-auto md:w-56"
            /> */}
          </Link>
          {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error message */}
          {isForgotPassword ? (
            <ForgotPassword />
          ) : isSignUp ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <input name="csrfToken" type="hidden" defaultValue={csrfToken!} />
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                {errors.passwordLength && <p className="text-red-500 text-sm">Password must be 8-64 characters long.</p>}
                {errors.passwordSpecialChar && (
                  <p className="text-red-500 text-sm">Password must contain at least one special character.</p>
                )}
                {errors.passwordNumber && <p className="text-red-500 text-sm">Password must contain at least one number.</p>}
                {errors.passwordAlpha && <p className="text-red-500 text-sm">Password must contain at least one letter.</p>}
              </div>
              <div>
                <label htmlFor="repeatPassword" className="block text-sm font-medium text-gray-700">
                  Repeat Password
                </label>
                <input
                  id="repeatPassword"
                  name="repeatPassword"
                  type="password"
                  value={repeatPassword}
                  onChange={handleRepeatPasswordChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                {errors.passwordMatch && <p className="text-red-500 text-sm">Passwords do not match.</p>}
              </div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-700 hover:bg-gray-800"
              >
                Sign Up
              </button>
              <p className="text-sm text-right text-indigo-600 hover:text-indigo-700 cursor-pointer mt-2" onClick={() => setIsSignUp(false)}>
                Already have an account? Sign in
              </p>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <input name="csrfToken" type="hidden" defaultValue={csrfToken!} />
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                <p className="text-sm text-right text-indigo-600 hover:text-indigo-700 cursor-pointer mt-2" onClick={() => setIsForgotPassword(true)}>
                  Forgot Password?
                </p>
              </div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-700 hover:bg-gray-800 mt-4"
              >
                Sign in with Email
              </button>
              <p className="text-sm text-right text-indigo-600 hover:text-indigo-700 cursor-pointer mt-2" onClick={() => setIsSignUp(true)}>
                Don't have an account? Sign up
              </p>
            </form>
          )}
          {/* {!isSignUp && !isForgotPassword && (
            <div className="mt-6">
              <div className="flex justify-center items-center py-2">
                <div className="border-t border-gray-300 flex-grow mr-3"></div>
                <p className="text-center flex-shrink">OR</p>
                <div className="border-t border-gray-300 flex-grow ml-3"></div>
              </div>
              <button
                onClick={handleGoogleSignIn}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 mt-4"
              >
                Sign in with Google
              </button>
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
}


export async function getServerSideProps(context: any) {
  try {
    // Fetch the CSRF token from the session context
    const csrfToken = await getCsrfToken(context);

    // Optionally fetch the session, if needed
    const session = await getSession(context);

    return {
      props: {
        csrfToken: csrfToken ?? null, // Provide null if no CSRF token is available
        session, // Include session if necessary
      },
    };
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    return {
      props: {
        csrfToken: null,
        session: null,
      },
    };
  }
}