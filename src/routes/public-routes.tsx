import { lazy } from "react";
import { Route, Navigate } from "react-router-dom";
import PageTransition from "@/components/PageTransition";
import Footer from "@/components/Footer";
import RouteErrorBoundary from "@/components/RouteErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageLoader from "@/components/PageLoader";
import { useAuth } from "@/hooks/use-auth";

const Index = lazy(() => import("@/pages/Index"));
const About = lazy(() => import("@/pages/About"));
const Contact = lazy(() => import("@/pages/Contact"));
const Pricing = lazy(() => import("@/pages/Pricing"));
const Auth = lazy(() => import("@/pages/Auth"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const Services = lazy(() => import("@/pages/Services"));
const Blog = lazy(() => import("@/pages/Blog"));
const Benefits = lazy(() => import("@/pages/Benefits"));
const Enterprise = lazy(() => import("@/pages/Enterprise"));
const CaseStudies = lazy(() => import("@/pages/CaseStudies"));
const UserGuide = lazy(() => import("@/pages/UserGuide"));
const Documentation = lazy(() => import("@/pages/Documentation"));
const Unsubscribe = lazy(() => import("@/pages/Unsubscribe"));
const PayInvoice = lazy(() => import("@/pages/PayInvoice"));
const VendorRegister = lazy(() => import("@/pages/VendorRegister"));
const WaitingList = lazy(() => import("@/pages/WaitingList"));
const PartnerWithUs = lazy(() => import("@/pages/PartnerWithUs"));
const MarketplacePage = lazy(() => import("@/pages/Marketplace"));
const Onboarding = lazy(() => import("@/pages/Onboarding"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const Terms = lazy(() => import("@/pages/Terms"));
const TrackDeal = lazy(() => import("@/pages/TrackDeal"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const R = ({ name, children }: { name: string; children: React.ReactNode }) => (
  <RouteErrorBoundary routeName={name}>{children}</RouteErrorBoundary>
);

const ModulesRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader message="Checking session…" />;
  if (user) return <Navigate to="/dashboard/modules" replace />;
  return <PageTransition><Index /><Footer /></PageTransition>;
};

export const publicRoutes = (
  <>
    <Route path="/" element={<R name="Home"><PageTransition><Index /><Footer /></PageTransition></R>} />
    <Route path="/about" element={<R name="About"><PageTransition><About /><Footer /></PageTransition></R>} />
    <Route path="/modules" element={<ModulesRedirect />} />
    <Route path="/pricing" element={<R name="Pricing"><PageTransition><Pricing /><Footer /></PageTransition></R>} />
    <Route path="/contact" element={<R name="Contact"><PageTransition><Contact /><Footer /></PageTransition></R>} />
    <Route path="/services" element={<R name="Services"><PageTransition><Services /><Footer /></PageTransition></R>} />
    <Route path="/blog" element={<R name="Blog"><PageTransition><Blog /><Footer /></PageTransition></R>} />
    <Route path="/benefits" element={<R name="Benefits"><PageTransition><Benefits /><Footer /></PageTransition></R>} />
    <Route path="/enterprise" element={<R name="Enterprise"><PageTransition><Enterprise /><Footer /></PageTransition></R>} />
    <Route path="/case-studies" element={<R name="Case Studies"><PageTransition><CaseStudies /><Footer /></PageTransition></R>} />
    <Route path="/guide" element={<R name="User Guide"><PageTransition><UserGuide /><Footer /></PageTransition></R>} />
    <Route path="/docs" element={<R name="Documentation"><PageTransition><Documentation /><Footer /></PageTransition></R>} />
    <Route path="/auth" element={<R name="Auth"><PageTransition><Auth /></PageTransition></R>} />
    <Route path="/reset-password" element={<R name="Reset Password"><PageTransition><ResetPassword /></PageTransition></R>} />
    <Route path="/unsubscribe" element={<R name="Unsubscribe"><PageTransition><Unsubscribe /></PageTransition></R>} />
    <Route path="/pay" element={<R name="Pay Invoice"><PageTransition><PayInvoice /></PageTransition></R>} />
    <Route path="/vendor-register" element={<R name="Vendor Register"><PageTransition><VendorRegister /></PageTransition></R>} />
    <Route path="/waiting-list" element={<R name="Waiting List"><PageTransition><WaitingList /><Footer /></PageTransition></R>} />
    <Route path="/partner-with-us" element={<R name="Partner With Us"><PageTransition><PartnerWithUs /><Footer /></PageTransition></R>} />
    <Route path="/marketplace" element={<R name="Marketplace"><PageTransition><MarketplacePage /><Footer /></PageTransition></R>} />
    <Route path="/onboarding" element={<ProtectedRoute skipOnboardingCheck><R name="Onboarding"><PageTransition><Onboarding /></PageTransition></R></ProtectedRoute>} />
    <Route path="/privacy" element={<R name="Privacy"><PageTransition><Privacy /><Footer /></PageTransition></R>} />
    <Route path="/terms" element={<R name="Terms"><PageTransition><Terms /><Footer /></PageTransition></R>} />
    <Route path="/track" element={<R name="Track Deal"><PageTransition><TrackDeal /></PageTransition></R>} />
    <Route path="*" element={<R name="Not Found"><PageTransition><NotFound /></PageTransition></R>} />
    <Route path="*" element={<R name="Not Found"><PageTransition><NotFound /></PageTransition></R>} />
  </>
);
