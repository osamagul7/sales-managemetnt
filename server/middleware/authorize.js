// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. User not authenticated.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. ${req.user.role} role is not authorized to access this resource.`
      });
    }

    next();
  };
};

// Check if user can access resource (owner or admin/manager)
const checkResourceAccess = (resourceField = 'createdBy') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. User not authenticated.'
      });
    }

    // Admin and Manager can access all resources
    if (req.user.role === 'admin' || req.user.role === 'manager') {
      return next();
    }

    // For salesperson, check if they own the resource
    // This will be handled in the controller after fetching the resource
    req.isOwnerCheck = true;
    req.resourceField = resourceField;
    next();
  };
};

// Middleware to check if user can modify resource
const checkModifyAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. User not authenticated.'
    });
  }

  // Admin can modify everything
  if (req.user.role === 'admin') {
    return next();
  }

  // Manager can modify most things except user management
  if (req.user.role === 'manager') {
    // Allow modification for most routes except user management
    if (req.originalUrl.includes('/api/users/')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only admin can manage users.'
      });
    }
    return next();
  }

  // Salesperson can only modify their own resources
  // This will be checked in individual controllers
  req.isModifyCheck = true;
  next();
};

module.exports = {
  authorize,
  checkResourceAccess,
  checkModifyAccess
};
