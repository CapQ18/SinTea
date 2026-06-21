import React, { Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import NavBar from './components/NavBar';
import { isLoggedIn, initTestUsers } from './services/authService';

initTestUsers();

// 代码分割：按页面懒加载
const FeedHome = lazy(() => import('./pages/FeedHome'));
const FeedPost = lazy(() => import('./pages/FeedPost'));
const FeedDetail = lazy(() => import('./pages/FeedDetail'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Profile = lazy(() => import('./pages/Profile'));
const ProfileEdit = lazy(() => import('./pages/ProfileEdit'));
const Discover = lazy(() => import('./pages/Discover'));
const ShopDetail = lazy(() => import('./pages/ShopDetail'));
const Search = lazy(() => import('./pages/Search'));
const Notifications = lazy(() => import('./pages/Notifications'));
const ChatList = lazy(() => import('./pages/ChatList'));
const Chat = lazy(() => import('./pages/Chat'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-cream">
    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const LazyLoad: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense fallback={<PageLoader />}>{children}</Suspense>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  return <LazyLoad>{children}</LazyLoad>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (isLoggedIn()) {
    return <Navigate to="/" replace />;
  }
  return <LazyLoad>{children}</LazyLoad>;
};

const AppContent: React.FC = () => {
  const location = useLocation();
  const showNav = ['/', '/discover', '/wishlist', '/profile'].includes(location.pathname) && isLoggedIn();

  return (
    <div className="w-full min-h-screen bg-cream relative">
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/" element={<ProtectedRoute><FeedHome /></ProtectedRoute>} />
        <Route path="/discover" element={<ProtectedRoute><Discover /></ProtectedRoute>} />
        <Route path="/post" element={<ProtectedRoute><FeedPost /></ProtectedRoute>} />
        <Route path="/detail/:id" element={<ProtectedRoute><FeedDetail /></ProtectedRoute>} />
        <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/profile/edit" element={<ProtectedRoute><ProfileEdit /></ProtectedRoute>} />
        <Route path="/shop/:id" element={<ProtectedRoute><ShopDetail /></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/chats" element={<ProtectedRoute><ChatList /></ProtectedRoute>} />
        <Route path="/chat/:userId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/user/:id" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
      </Routes>
      {showNav && <NavBar />}
    </div>
  );
};

const App: React.FC = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;
