import React, { useEffect } from 'react';
import { useAuth } from '@context/AuthContext';
import { injectLogout } from '@config/apiService';

/**
 * AuthInjector Component
 * This component bridge the Gap between React Context (AuthContext) 
 * and non-React files like ApiService.ts.
 */
const AuthInjector: React.FC = () => {
  const { signOut } = useAuth();

  useEffect(() => {
    // Inject the signOut method into ApiService
    injectLogout(signOut);
  }, [signOut]);

  return null; // This component doesn't render anything
};

export default AuthInjector;
