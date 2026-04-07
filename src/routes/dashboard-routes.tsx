import { lazy } from "react";
import { Route, Navigate } from "react-router-dom";
import PageTransition from "@/components/PageTransition";
import RouteErrorBoundary from "@/components/RouteErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";

const Settings = lazy(() => import("@/pages/Settings"));
const SubscriptionManagement = lazy(() => import("@/pages/SubscriptionManagement"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const ModulesDashboard = lazy(() => import("@/pages/ModulesDashboard"));
const Chat = lazy(() => import("@/pages/Chat"));
const Intake = lazy(() => import("@/pages/Intake"));
const Sourcing = lazy(() => import("@/pages/Sourcing"));
const VendorOutreach = lazy(() => import("@/pages/VendorOutreach"));
const Negotiation = lazy(() => import("@/pages/Negotiation"));
const Workflow = lazy(() => import("@/pages/Workflow"));
const DocumentsBilling = lazy(() => import("@/pages/DocumentsBilling"));
const DealCompletion = lazy(() => import("@/pages/DealCompletion"));
const DealEngine = lazy(() => import("@/pages/DealEngine"));
const Shortlisting = lazy(() => import("@/pages/Shortlisting"));
const PartnerPortal = lazy(() => import("@/pages/PartnerPortal"));
const PartnerOnboarding = lazy(() => import("@/pages/PartnerOnboarding"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const MarketingHub = lazy(() => import("@/pages/MarketingHub"));
const NLPTools = lazy(() => import("@/pages/NLPTools"));
const QuantumComputing = lazy(() => import("@/pages/QuantumComputing"));
const RecommendationEngine = lazy(() => import("@/pages/RecommendationEngine"));
const DealAutopilot = lazy(() => import("@/pages/DealAutopilot"));
const MarketIntelligence = lazy(() => import("@/pages/MarketIntelligence"));
const DocumentVault = lazy(() => import("@/pages/DocumentVault"));
const WealthDashboard = lazy(() => import("@/pages/WealthDashboard"));
const ConciergeCalendar = lazy(() => import("@/pages/ConciergeCalendar"));
const RiskCompliance = lazy(() => import("@/pages/RiskCompliance"));
const PrivateNetwork = lazy(() => import("@/pages/PrivateNetwork"));
const ConnectOnboarding = lazy(() => import("@/pages/ConnectOnboarding"));
const ConnectProducts = lazy(() => import("@/pages/ConnectProducts"));
const ConnectStorefront = lazy(() => import("@/pages/ConnectStorefront"));
const CommissionPayouts = lazy(() => import("@/pages/CommissionPayouts"));
const SovereignDashboard = lazy(() => import("@/pages/SovereignDashboard"));
const SovereignVault = lazy(() => import("@/pages/SovereignVault"));
const ProvingGround = lazy(() => import("@/pages/ProvingGround"));
const QuantusCore = lazy(() => import("@/pages/QuantusCore"));
const QuantusHelix = lazy(() => import("@/pages/QuantusHelix"));
const QuantusForge = lazy(() => import("@/pages/QuantusForge"));
const Automation = lazy(() => import("@/pages/Automation"));

const R = ({ name, children }: { name: string; children: React.ReactNode }) => (
  <RouteErrorBoundary routeName={name}>{children}</RouteErrorBoundary>
);

/**
 * Route path prefixes that use the dashboard shell (no global navbar/footer).
 * Derived from the route definitions below — keep in sync.
 */
export const dashboardRoutePrefixes = [
  "/dashboard", "/sovereign", "/core", "/helix", "/forge",
  "/deals", "/chat", "/intake", "/sourcing", "/outreach",
  "/shortlist", "/negotiation", "/workflow", "/documents",
  "/deal-completion", "/settings", "/account/subscription",
  "/partner", "/admin", "/marketing", "/nlp", "/quantum",
  "/recommendations", "/autopilot", "/intelligence", "/vault",
  "/wealth", "/calendar", "/compliance", "/network",
  "/connect", "/commission-payouts", "/automation",
];

export const dashboardRoutes = (
  <>
    {/* Sovereign OS */}
    <Route path="/core" element={<ProtectedRoute><R name="Core"><QuantusCore /></R></ProtectedRoute>} />
    <Route path="/helix" element={<ProtectedRoute><R name="Helix"><QuantusHelix /></R></ProtectedRoute>} />
    <Route path="/forge" element={<ProtectedRoute><R name="Forge"><QuantusForge /></R></ProtectedRoute>} />

    {/* Main Dashboard */}
    <Route path="/dashboard" element={<ProtectedRoute><R name="Dashboard"><Dashboard /></R></ProtectedRoute>} />
    <Route path="/dashboard/modules" element={<ProtectedRoute><R name="Modules"><ModulesDashboard /></R></ProtectedRoute>} />

    {/* Dashboard redirects */}
    <Route path="/dashboard/intake" element={<Navigate to="/intake" replace />} />
    <Route path="/dashboard/deals" element={<Navigate to="/deals" replace />} />
    <Route path="/dashboard/chat" element={<Navigate to="/chat" replace />} />
    <Route path="/dashboard/sourcing" element={<Navigate to="/sourcing" replace />} />
    <Route path="/dashboard/outreach" element={<Navigate to="/outreach" replace />} />
    <Route path="/dashboard/settings" element={<Navigate to="/settings" replace />} />

    {/* Deal Pipeline */}
    <Route path="/deals" element={<ProtectedRoute><R name="Deal Engine"><DealEngine /></R></ProtectedRoute>} />
    <Route path="/deals/:id" element={<Navigate to="/deals" replace />} />
    <Route path="/chat" element={<ProtectedRoute><R name="Chat"><Chat /></R></ProtectedRoute>} />
    <Route path="/intake" element={<ProtectedRoute><R name="Intake"><PageTransition><Intake /></PageTransition></R></ProtectedRoute>} />
    <Route path="/sourcing" element={<ProtectedRoute><R name="Sourcing"><PageTransition><Sourcing /></PageTransition></R></ProtectedRoute>} />
    <Route path="/outreach" element={<ProtectedRoute><R name="Outreach"><PageTransition><VendorOutreach /></PageTransition></R></ProtectedRoute>} />
    <Route path="/shortlist" element={<ProtectedRoute><R name="Shortlist"><PageTransition><Shortlisting /></PageTransition></R></ProtectedRoute>} />
    <Route path="/negotiation" element={<ProtectedRoute><R name="Negotiation"><PageTransition><Negotiation /></PageTransition></R></ProtectedRoute>} />
    <Route path="/workflow" element={<ProtectedRoute><R name="Workflow"><PageTransition><Workflow /></PageTransition></R></ProtectedRoute>} />
    <Route path="/documents" element={<ProtectedRoute><R name="Documents"><PageTransition><DocumentsBilling /></PageTransition></R></ProtectedRoute>} />
    <Route path="/deal-completion" element={<ProtectedRoute><R name="Deal Completion"><PageTransition><DealCompletion /></PageTransition></R></ProtectedRoute>} />
    <Route path="/deal-engine" element={<Navigate to="/deals" replace />} />

    {/* Settings */}
    <Route path="/settings" element={<ProtectedRoute><R name="Settings"><PageTransition><Settings /></PageTransition></R></ProtectedRoute>} />
    <Route path="/account/subscription" element={<ProtectedRoute><R name="Subscription"><PageTransition><SubscriptionManagement /></PageTransition></R></ProtectedRoute>} />

    {/* Partner */}
    <Route path="/partner" element={<ProtectedRoute><R name="Partner Portal"><PartnerPortal /></R></ProtectedRoute>} />
    <Route path="/partner/onboarding" element={<ProtectedRoute><R name="Partner Onboarding"><PageTransition><PartnerOnboarding /></PageTransition></R></ProtectedRoute>} />

    {/* Admin */}
    <Route path="/admin" element={<ProtectedRoute requiredRole="admin" skipOnboardingCheck><R name="Admin"><PageTransition><AdminDashboard /></PageTransition></R></ProtectedRoute>} />

    {/* Tools */}
    <Route path="/marketing" element={<ProtectedRoute><R name="Marketing"><PageTransition><MarketingHub /></PageTransition></R></ProtectedRoute>} />
    <Route path="/nlp" element={<ProtectedRoute><R name="NLP Tools"><PageTransition><NLPTools /></PageTransition></R></ProtectedRoute>} />
    <Route path="/quantum" element={<ProtectedRoute><R name="Quantum"><PageTransition><QuantumComputing /></PageTransition></R></ProtectedRoute>} />
    <Route path="/recommendations" element={<ProtectedRoute><R name="Recommendations"><RecommendationEngine /></R></ProtectedRoute>} />
    <Route path="/autopilot" element={<ProtectedRoute><R name="Autopilot"><DealAutopilot /></R></ProtectedRoute>} />
    <Route path="/intelligence" element={<ProtectedRoute><R name="Intelligence"><MarketIntelligence /></R></ProtectedRoute>} />
    <Route path="/vault" element={<ProtectedRoute><R name="Vault"><DocumentVault /></R></ProtectedRoute>} />
    <Route path="/wealth" element={<ProtectedRoute><R name="Wealth"><WealthDashboard /></R></ProtectedRoute>} />
    <Route path="/calendar" element={<ProtectedRoute><R name="Calendar"><ConciergeCalendar /></R></ProtectedRoute>} />
    <Route path="/compliance" element={<ProtectedRoute><R name="Compliance"><RiskCompliance /></R></ProtectedRoute>} />
    <Route path="/network" element={<ProtectedRoute><R name="Network"><PrivateNetwork /></R></ProtectedRoute>} />

    {/* Automation */}
    <Route path="/automation" element={<ProtectedRoute skipOnboardingCheck><R name="Automation"><Automation /></R></ProtectedRoute>} />

    {/* Connect & Payments */}
    <Route path="/connect/onboarding" element={<ProtectedRoute><R name="Connect Onboarding"><ConnectOnboarding /></R></ProtectedRoute>} />
    <Route path="/connect/products" element={<ProtectedRoute><R name="Connect Products"><ConnectProducts /></R></ProtectedRoute>} />
    <Route path="/connect/storefront" element={<ProtectedRoute><R name="Connect Storefront"><ConnectStorefront /></R></ProtectedRoute>} />
    <Route path="/commission-payouts" element={<ProtectedRoute><R name="Commission Payouts"><CommissionPayouts /></R></ProtectedRoute>} />

    {/* Sovereign */}
    <Route path="/sovereign" element={<ProtectedRoute><R name="Sovereign"><SovereignDashboard /></R></ProtectedRoute>} />
    <Route path="/sovereign/vault" element={<ProtectedRoute><R name="Sovereign Vault"><SovereignVault /></R></ProtectedRoute>} />
    <Route path="/sovereign/proving-ground" element={<ProtectedRoute><R name="Proving Ground"><ProvingGround /></R></ProtectedRoute>} />
  </>
);
