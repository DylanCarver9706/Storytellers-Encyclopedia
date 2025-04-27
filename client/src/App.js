import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./config/firebaseConfig";
import { usePageTracking } from "./services/firebaseService";
import {
  getMongoUserDataByFirebaseId
} from "./services/userService";
import {
  getLatestPrivacyPolicy,
  getLatestTermsOfService,
} from "./services/agreementService";
import { useUser } from "./contexts/UserContext";
import { Routes, Route, useNavigate } from "react-router-dom";
import Profile from "./components/features/core/Profile";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import EmailVerification from "./components/features/userVerification/EmailVerification";
import Credits from "./components/features/about/Credits";
import BugForm from "./components/features/feedback/BugForm";
import FeatureForm from "./components/features/feedback/FeatureForm";
import FeedbackForm from "./components/features/feedback/FeedbackForm";
import Hero from "./components/features/about/Hero";
import SomethingWentWrong from "./components/features/errorHandling/SomethingWentWrong";
import AppOutage from "./components/features/errorHandling/AppOutage";
import PrivacyPolicy from "./components/features/legal/PrivacyPolicy";
import TermsOfService from "./components/features/legal/TermsOfService";
import Agreements from "./components/features/legal/Agreements";
import PageNotFound from "./components/features/errorHandling/PageNotFound";
import SuspendedUser from "./components/features/permissionFailure/SuspendedUser";
import PrivateRoute from "./components/features/routes/PrivateRoute";
import Signup from "./components/features/auth/Signup";
import Login from "./components/features/auth/Login";
import ForgotPassword from "./components/features/auth/ForgotPassword";
import About from "./components/features/about/About";
import Contact from "./components/features/about/Contact";
import Spinner from "./components/common/Spinner";

// Deprecated components
// import PlaidIdentityVerification from "./components/PlaidIdentityVerification"; Deprecated
// import OpenAiIdentityVerification from "./components/OpenAiIdentityVerification";

function App() {
  usePageTracking();
  const { user, setUser } = useUser();
  // eslint-disable-next-line
  const [unprotectedRoutes, setUnprotectedRoutes] = useState(
    process.env.REACT_APP_UNPROTECTED_ROUTES.split(",")
  );
  const [loading, setLoading] = useState(true);
  const [privacyPolicyVersion, setPrivacyPolicyVersion] = useState(null);
  const [termsOfServiceVersion, setTermsOfServiceVersion] = useState(null);
  const navigate = useNavigate();

  // Handle auth state changes from Firebase
  useEffect(() => {
    if (auth.currentUser && user && user.mongoUserId !== null) {
      return;
    }
    setLoading(true);
    const handleAuthChange = async (firebaseUser) => {
      if (firebaseUser?.uid) {
        try {
          const idToken = await firebaseUser.getIdToken();
          if (process.env.REACT_APP_ENV === "development")
            if (process.env.REACT_APP_ENV === "development")
              console.log("Firebase ID token:", idToken);
          if (!idToken) {
            if (process.env.REACT_APP_ENV === "development")
              console.warn("ID token not available");
            return;
          }

          // Fetch MongoDB user data
          const mongoUser = await getMongoUserDataByFirebaseId(
            firebaseUser.uid
          );

          if (process.env.REACT_APP_ENV === "development")
            console.log("Mongo User:", mongoUser);
          if (process.env.REACT_APP_ENV === "development")
            console.log("firebaseUser", firebaseUser);

          // Destructure the user object to remove the _id field
          const { _id, ...userWithoutId } = mongoUser;

          let userObj = {
            firebaseUserId: firebaseUser.uid,
            mongoUserId: _id,
            ...userWithoutId,
          };

          // Set the user state with the updated user object
          setUser(userObj);
        } catch {}
      } else {
        setUser(null); // User is logged out
      }
      setLoading(false);
    };

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      handleAuthChange(firebaseUser);
    });

    return () => unsubscribe();
    // eslint-disable-next-line
  }, [setUser, navigate]);

  // Get a potential referral code from the URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const referralCode = params.get("ref");

    if (referralCode) {
      // Save the referral code in localStorage or state
      localStorage.setItem("referralCode", referralCode);

      // Optionally navigate to a specific route or process the referral code
      navigate("/signup");
    }
  }, [navigate]);

  // Reroute users to the appropriate page based on their permission states
  useEffect(() => {
    const routeUser = async () => {
      // If still loading, do nothing
      if (loading || auth?.currentUser === null || user?.mongoUserId === null) {
        return;
      }

      if (process.env.REACT_APP_ENV === "development")
        console.log("User:", user);

      // Check current path
      const currentPath = window.location.pathname;

      // Allow all users to access unprotected routes
      if (unprotectedRoutes.includes(currentPath)) {
        return;
      }

      // If user has not verified email or IDV, redirect to respective pages
      if (auth.currentUser && user?.locationPermissionGranted === false) {
        navigate("/location-permission-required");
      } else if (
        auth.currentUser &&
        user?.emailVerificationStatus &&
        user?.emailVerificationStatus !== "verified"
      ) {
        navigate("/email-verification");
      } else if (
        auth.currentUser &&
        !user?.phoneNumber &&
        user?.smsVerificationStatus &&
        user?.smsVerificationStatus !== "verified"
      ) {
        navigate("/sms-verification");
      } else if (
        auth.currentUser &&
        user?.idvStatus &&
        ["review", "unverified"].includes(user?.idvStatus)
      ) {
        navigate("/identity-verification");
      } else if (
        auth.currentUser &&
        (user?.pp.version !== privacyPolicyVersion ||
          user.tos.version !== termsOfServiceVersion)
      ) {
        navigate("/agreements");
      } else if (auth.currentUser && user?.locationValid === false) {
        navigate("/illegal-state");
      } else if (auth.currentUser && user?.ageValid === false) {
        navigate("/illegal-age");
      } else if (
        auth.currentUser &&
        user?.accountStatus &&
        user?.accountStatus === "suspended"
      ) {
        navigate("/account-suspended");
      } else if (auth.currentUser && user?.viewedInstructions === false) {
        navigate("/instructions");
      }
    };
    routeUser();
  }, [
    loading,
    user,
    navigate,
    unprotectedRoutes,
    privacyPolicyVersion,
    termsOfServiceVersion,
  ]);

  // Check terms of service and privacy policy versions
  useEffect(() => {
    const fetchAgreementsOncePerDay = async () => {
      // Attempt to load from localStorage
      let storedPrivacyPolicy = localStorage.getItem("privacyPolicy");
      let storedTermsOfService = localStorage.getItem("termsOfService");
      if (storedPrivacyPolicy) {
        storedPrivacyPolicy = JSON.parse(storedPrivacyPolicy);
      }
      if (storedTermsOfService) {
        storedTermsOfService = JSON.parse(storedTermsOfService);
      }

      // Calculate today's date in "YYYY-MM-DD" format
      const today = new Date().toISOString().split("T")[0];

      // If both objects are stored, check their `date_created` fields
      if (
        storedPrivacyPolicy &&
        storedTermsOfService &&
        storedPrivacyPolicy?.lastAccessedByUser === today &&
        storedTermsOfService?.lastAccessedByUser === today
      ) {
        // Use cached versions
        setPrivacyPolicyVersion(parseInt(storedPrivacyPolicy.version, 10));
        setTermsOfServiceVersion(parseInt(storedTermsOfService.version, 10));
      } else {
        // Fetch new versions from server
        let privacyPolicy = await getLatestPrivacyPolicy();
        let termsOfService = await getLatestTermsOfService();

        // Save to localStorage
        localStorage.setItem(
          "privacyPolicy",
          JSON.stringify({ lastAccessedByUser: today, ...privacyPolicy })
        );
        localStorage.setItem(
          "termsOfService",
          JSON.stringify({ lastAccessedByUser: today, ...termsOfService })
        );

        // Update state
        setPrivacyPolicyVersion(parseInt(privacyPolicy.version, 10));
        setTermsOfServiceVersion(parseInt(termsOfService.version, 10));
      }
    };

    fetchAgreementsOncePerDay();
  }, [navigate]);

  if (loading) {
    return <Spinner />;
  }

  const emailVerified = user?.emailVerificationStatus === "verified";
  const loggedIn =
    !loading && auth?.currentUser !== null && user?.mongoUserId !== null;
  const accountSuspended = user?.accountStatus === "suspended";
  const requirePp =
    loggedIn && user?.pp && user?.pp.version !== privacyPolicyVersion;
  const requireTos =
    loggedIn && user?.tos && user.tos.version !== termsOfServiceVersion;

  return (
    <div className="App">
      <Navbar />
      <div className="main-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Hero />} />
          <Route path="/whoopsie-daisy" element={<SomethingWentWrong />} />
          <Route path="/bug-form" element={<BugForm />} />
          <Route path="/feature-form" element={<FeatureForm />} />
          <Route path="/feedback-form" element={<FeedbackForm />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/app-outage" element={<AppOutage />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          {/* Catch-all route for undefined paths */}
          <Route path="*" element={<PageNotFound />} />

          {/* Protected Routes */}
          <Route
            path="/profile"
            element={
              <PrivateRoute authorized={loggedIn}>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/email-verification"
            element={
              <PrivateRoute
                authorized={loggedIn && !emailVerified}
                redirectTo="/wagers"
              >
                <EmailVerification />
              </PrivateRoute>
            }
          />
          <Route
            path="/agreements"
            element={
              <PrivateRoute
                authorized={loggedIn && (requireTos || requirePp)}
                redirectTo="/wagers"
              >
                <Agreements />
              </PrivateRoute>
            }
          />
          <Route
            path="/credits"
            element={
              <PrivateRoute authorized={loggedIn}>
                <Credits />
              </PrivateRoute>
            }
          />
          <Route
            path="/account-suspended"
            element={
              <PrivateRoute
                authorized={loggedIn && accountSuspended}
                redirectTo="/wagers"
              >
                <SuspendedUser />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
      <Footer />
      <div id="recaptcha-container" style={{ display: "none" }}></div>
    </div>
  );
}

export default App;
