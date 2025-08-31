import { Navigate } from 'react-router-dom';

const AdminRoute = ({ user, isAdmin, children }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AdminRoute;