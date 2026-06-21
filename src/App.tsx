import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import FeedHome from './pages/FeedHome';
import FeedPost from './pages/FeedPost';
import FeedDetail from './pages/FeedDetail';
import Wishlist from './pages/Wishlist';
import Profile from './pages/Profile';
import ProfileEdit from './pages/ProfileEdit';
import Discover from './pages/Discover';
import ShopDetail from './pages/ShopDetail';
import Search from './pages/Search';
import Notifications from './pages/Notifications';
import ChatList from './pages/ChatList';
import Chat from './pages/Chat';
import Login from './pages/Login';
import Register from './pages/Register';
import NavBar from './components/NavBar';
import { isLoggedIn, initTestUsers } from './services/authService';

initTestUsers();

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (isLoggedIn()) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const location = useLocation();
  const showNav = ['/', '/discover', '/wishlist', '/profile'].includes(location.pathname) && isLoggedIn();

  return (
    <div className="w-full min-h-screen bg-cream relative">
      <Routes>
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />
        <Route path="/" element={
          <ProtectedRoute>
            <FeedHome />
          </ProtectedRoute>
        } />
        <Route path="/discover" element={
          <ProtectedRoute>
            <Discover />
          </ProtectedRoute>
        } />
        <Route path="/post" element={
          <ProtectedRoute>
            <FeedPost />
          </ProtectedRoute>
        } />
        <Route path="/detail/:id" element={
          <ProtectedRoute>
            <FeedDetail />
          </ProtectedRoute>
        } />
        <Route path="/wishlist" element={
          <ProtectedRoute>
            <Wishlist />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/profile/edit" element={
          <ProtectedRoute>
            <ProfileEdit />
          </ProtectedRoute>
        } />
        <Route path="/shop/:id" element={
          <ProtectedRoute>
            <ShopDetail />
          </ProtectedRoute>
        } />
        <Route path="/search" element={
          <ProtectedRoute>
            <Search />
          </ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        } />
        <Route path="/chats" element={
          <ProtectedRoute>
            <ChatList />
          </ProtectedRoute>
        } />
        <Route path="/chat/:userId" element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        } />
      </Routes>
      {showNav && <NavBar />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;