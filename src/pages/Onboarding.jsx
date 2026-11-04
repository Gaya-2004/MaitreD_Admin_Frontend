import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { restaurantService } from '../services/api';
import { ChevronRight, AlertCircle, Loader, Eye, EyeOff } from 'lucide-react';
import RestaurantBG from '../assets/restaurant_bg.png';
import MaitreDLogo from '../assets/maitred_logo.png';
import MaitreDChef from '../assets/maitred_chef.png';

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, login, signup } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'SUPER_ADMIN') {
        navigate('/admin-dashboard');
      } else if (user.role === 'CASHIER') {
        navigate('/cashier-dashboard');
      } else {
        navigate('/manager-dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  // States
  const [step, setStep] = useState('role'); // 'role', 'auth'
  const [selectedRole, setSelectedRole] = useState(null);
  const [authMode, setAuthMode] = useState('login'); // 'login', 'signup'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    restaurant_id: '',
  });
  const [restaurants, setRestaurants] = useState([]);
  const [restaurantLoading, setRestaurantLoading] = useState(false);

  const roles = [
    {
      id: 'super_admin',
      label: 'Super Admin',
      abbreviation: 'SA',
      description: 'Manage hotels, venues & managers',
      color: 'gold',
    },
    {
      id: 'hotel_manager',
      label: 'Hotel Manager',
      abbreviation: 'HM',
      description: 'Manage daily restaurant operations',
      color: 'gold',
    },
    {
      id: 'cashier',
      label: 'Cashier',
      abbreviation: 'CA',
      description: 'Manage cash payments and bill generation',
      color: 'gold',
    },
  ];

  // Handle role selection
  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    setError('');
    setSuccessMessage('');
    setFormData({ name: '', email: '', password: '', confirmPassword: '', restaurant_id: '' });
    setAuthMode('login');
    setStep('auth');
  };

  useEffect(() => {
    const fetchRestaurants = async () => {
      if ((selectedRole !== 'hotel_manager' && selectedRole !== 'cashier') || step !== 'auth') {
        return;
      }

      setRestaurantLoading(true);
      try {
        const data = await restaurantService.getPublicRestaurants();
        setRestaurants(data);
      } catch (err) {
        console.error('Failed to load restaurants', err);
        setError('Unable to load restaurant list. Please try again later.');
      } finally {
        setRestaurantLoading(false);
      }
    };

    fetchRestaurants();
  }, [selectedRole, step]);

  // Handle form changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    const parsedValue = name === 'restaurant_id' ? (value ? parseInt(value, 10) : '') : value;
    setFormData((prev) => ({ ...prev, [name]: parsedValue }));
    setError('');
  };

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    if (!selectedRole) {
      setError('Please select a role before logging in.');
      setLoading(false);
      return;
    }

    let roleParam = 'HOTEL_ADMIN';
    if (selectedRole === 'super_admin') roleParam = 'SUPER_ADMIN';
    else if (selectedRole === 'cashier') roleParam = 'CASHIER';
    setLoading(true);
    try {
      await login(formData.email, formData.password, roleParam);
      if (selectedRole === 'super_admin') {
        navigate('/admin-dashboard');
      } else if (selectedRole === 'cashier') {
        navigate('/cashier-dashboard');
      } else {
        navigate('/manager-dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle signup
  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!selectedRole) {
      setError('Please select a role before signing up.');
      return;
    }

    let roleParam = 'HOTEL_ADMIN';
    if (selectedRole === 'super_admin') roleParam = 'SUPER_ADMIN';
    else if (selectedRole === 'cashier') roleParam = 'CASHIER';

    if ((roleParam === 'HOTEL_ADMIN' || roleParam === 'CASHIER') && !formData.restaurant_id) {
      setError(`Please select a restaurant for the ${selectedRole.replace('_', ' ')} account.`);
      return;
    }

    setLoading(true);
    try {
      await signup(
        formData.name,
        formData.email,
        formData.password,
        roleParam,
        (roleParam === 'HOTEL_ADMIN' || roleParam === 'CASHIER') ? formData.restaurant_id : null
      );
      setSuccessMessage('Signup done successfully. Please sign in to login.');
      setError('');
      setAuthMode('login');
      setFormData((prev) => ({
        ...prev,
        password: '',
        confirmPassword: '',
      }));
    } catch (err) {
      setSuccessMessage('');
      setError(err.response?.data?.detail || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle back to role selection
  const handleBack = () => {
    setStep('role');
    setSelectedRole(null);
    setError('');
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
  };

  // ========== ROLE SELECTION STEP ==========
  if (step === 'role') {
    return (
      <div
        className="role-selection-container"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(10, 10, 14, 0.52) 0%, rgba(6, 6, 8, 0.78) 100%), url(${RestaurantBG})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
        }}
      >
        <div className="role-selection-content" style={{ maxWidth: '480px', width: '100%' }}>
          <div className="hero-title-block" style={{ paddingBottom: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img
              src={MaitreDChef}
              alt="MaitreD Chef Mascot"
              style={{
                width: '110px',
                height: 'auto',
                marginBottom: '8px',
                filter: 'drop-shadow(0 6px 16px rgba(0, 0, 0, 0.45))'
              }}
            />
            <div
              style={{
                color: '#ffffff',
                fontSize: '24px',
                fontWeight: '700',
                letterSpacing: '-0.3px',
                marginBottom: '8px',
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)'
              }}
            >
              Welcome To
            </div>
            <img
              src={MaitreDLogo}
              alt="maitreD"
              className="hero-title-image"
              style={{
                maxWidth: '240px',
                width: '100%',
                height: 'auto',
                filter: 'drop-shadow(0 4px 20px rgba(223, 155, 52, 0.35))',
                marginBottom: '10px'
              }}
            />
            <div
              className="hero-subtitle"
              style={{
                fontSize: '13px',
                letterSpacing: '2.5px',
                color: '#DF9B34',
                fontWeight: '600',
                textTransform: 'uppercase'
              }}
            >
              Restaurant Management System
            </div>
          </div>

          <div className="role-selection-header" style={{ marginBottom: '32px' }}>
            <div className="role-selection-title" style={{ fontSize: '26px', fontWeight: '400', letterSpacing: '0.5px' }}>
              Choose Your Role
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '6px' }}>
              Select your portal to access operational tools
            </p>
          </div>

          {/* Role Options */}
          <div className="role-options" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {roles.map((role) => (
              <button
                key={role.id}
                className={`btn-role ${selectedRole === role.id ? 'active' : ''}`}
                onClick={() => handleRoleSelect(role.id)}
                style={{
                  background: 'rgba(24, 24, 28, 0.75)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(223, 155, 52, 0.22)',
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#DF9B34';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(223, 155, 52, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(223, 155, 52, 0.22)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div
                  className="btn-role-icon"
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #DF9B34 0%, #C58326 100%)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    fontSize: '18px',
                    boxShadow: '0 4px 14px rgba(223, 155, 52, 0.35)',
                    flexShrink: 0
                  }}
                >
                  {role.abbreviation}
                </div>
                <div className="btn-role-content" style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 4px', fontSize: '17px', color: '#ffffff', fontWeight: '600' }}>{role.label}</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#9ea2b0' }}>{role.description}</p>
                </div>
                <ChevronRight className="btn-role-arrow" size={22} style={{ color: '#DF9B34' }} />
              </button>
            ))}
          </div>
        </div>


      </div>
    );
  }

  // ========== AUTHENTICATION STEP ==========
  return (
    <div
      className="login-container"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(10, 10, 14, 0.52) 0%, rgba(6, 6, 8, 0.78) 100%), url(${RestaurantBG})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
      }}
    >
      <div className="login-content" style={{ maxWidth: '440px', width: '100%' }}>
        <div className="hero-title-block" style={{ paddingBottom: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img
            src={MaitreDChef}
            alt="MaitreD Chef Mascot"
            style={{
              width: '100px',
              height: 'auto',
              marginBottom: '6px',
              filter: 'drop-shadow(0 6px 16px rgba(0, 0, 0, 0.45))'
            }}
          />
          <div
            style={{
              color: '#ffffff',
              fontSize: '22px',
              fontWeight: '700',
              letterSpacing: '-0.3px',
              marginBottom: '6px',
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)'
            }}
          >
            Welcome To
          </div>
          <img
            src={MaitreDLogo}
            alt="maitreD"
            className="hero-title-image"
            style={{
              maxWidth: '220px',
              width: '100%',
              height: 'auto',
              filter: 'drop-shadow(0 4px 20px rgba(223, 155, 52, 0.35))',
              marginBottom: '8px'
            }}
          />
          <div
            className="hero-subtitle"
            style={{
              fontSize: '12px',
              letterSpacing: '2.5px',
              color: '#DF9B34',
              fontWeight: '600',
              textTransform: 'uppercase'
            }}
          >
            Restaurant Management System
          </div>
        </div>

        {/* Role Info Badge */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '24px',
            padding: '12px 16px',
            background: 'rgba(223, 155, 52, 0.12)',
            border: '1px solid rgba(223, 155, 52, 0.35)',
            borderRadius: '10px',
            color: '#DF9B34',
            fontSize: '14px',
            fontWeight: '600',
            letterSpacing: '0.4px',
          }}
        >
          {selectedRole === 'super_admin' ? '👑 Super Admin Portal' : selectedRole === 'cashier' ? '💵 Cashier Portal' : '🍽️ Hotel Manager Portal'}
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="success-message" style={{ marginBottom: '18px' }}>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="error-message" style={{ marginBottom: '18px' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Tabs for Login/Signup */}
        {selectedRole !== 'hotel_manager' && (
          <div
            style={{
              display: 'flex',
              gap: '10px',
              marginBottom: '24px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              paddingBottom: '12px',
            }}
          >
            <button
              onClick={() => {
                setAuthMode('login');
                setError('');
                setSuccessMessage('');
              }}
              style={{
                flex: 1,
                padding: '12px',
                background: authMode === 'login' ? 'rgba(223, 155, 52, 0.15)' : 'transparent',
                border: 'none',
                borderBottom: authMode === 'login' ? '2px solid #DF9B34' : 'none',
                color: authMode === 'login' ? '#DF9B34' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                borderRadius: '8px 8px 0 0',
                transition: 'all 0.3s ease',
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setAuthMode('signup');
                setError('');
                setSuccessMessage('');
              }}
              style={{
                flex: 1,
                padding: '12px',
                background: authMode === 'signup' ? 'rgba(223, 155, 52, 0.15)' : 'transparent',
                border: 'none',
                borderBottom: authMode === 'signup' ? '2px solid #DF9B34' : 'none',
                color: authMode === 'signup' ? '#DF9B34' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                borderRadius: '8px 8px 0 0',
                transition: 'all 0.3s ease',
              }}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Auth Form */}
        <form
          className="auth-form"
          onSubmit={authMode === 'login' ? handleLogin : handleSignup}
          style={{
            background: 'rgba(22, 22, 26, 0.85)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(223, 155, 52, 0.25)',
            borderRadius: '16px',
            padding: '32px 28px',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.5)',
            marginBottom: '16px',
          }}
        >
          {/* Name Field - Only for Signup */}
          {authMode === 'signup' && (
            <div className="form-group" style={{ marginBottom: '18px' }}>
              <label className="form-label" style={{ color: '#d0d4e4', fontSize: '13px', fontWeight: '600' }}>Full Name</label>
              <input
                type="text"
                name="name"
                className="form-input"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleFormChange}
                disabled={loading}
                style={{
                  background: 'rgba(10, 10, 14, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '10px',
                  color: '#ffffff',
                }}
              />
            </div>
          )}

          {/* Email Field */}
          <div className="form-group" style={{ marginBottom: '18px' }}>
            <label className="form-label" style={{ color: '#d0d4e4', fontSize: '13px', fontWeight: '600' }}>Email Address</label>
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleFormChange}
              disabled={loading}
              style={{
                background: 'rgba(10, 10, 14, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '10px',
                color: '#ffffff',
              }}
            />
          </div>

          {/* Restaurant Selection */}
          {authMode === 'signup' && (selectedRole === 'hotel_manager' || selectedRole === 'cashier') && (
            <div className="form-group" style={{ marginBottom: '18px' }}>
              <label className="form-label" style={{ color: '#d0d4e4', fontSize: '13px', fontWeight: '600' }}>Restaurant</label>
              <select
                name="restaurant_id"
                className="form-input"
                value={formData.restaurant_id}
                onChange={handleFormChange}
                disabled={loading || restaurantLoading}
                style={{
                  background: 'rgba(10, 10, 14, 0.85)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '10px',
                  color: '#ffffff',
                }}
              >
                <option value="">Select a restaurant</option>
                {restaurants.map((restaurant) => (
                  <option key={restaurant.id} value={restaurant.id}>
                    {restaurant.name}
                  </option>
                ))}
              </select>
              {restaurantLoading && <div className="input-note" style={{ color: '#DF9B34', fontSize: '12px', marginTop: '4px' }}>Loading restaurants…</div>}
            </div>
          )}

          {/* Password Field */}
          <div className="form-group" style={{ marginBottom: '22px' }}>
            <label className="form-label" style={{ color: '#d0d4e4', fontSize: '13px', fontWeight: '600' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                className="form-input"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleFormChange}
                disabled={loading}
                style={{
                  background: 'rgba(10, 10, 14, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '10px',
                  color: '#ffffff',
                  paddingRight: '40px',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#9ea2b0',
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          {authMode === 'signup' && (
            <div className="form-group" style={{ marginBottom: '22px' }}>
              <label className="form-label" style={{ color: '#d0d4e4', fontSize: '13px', fontWeight: '600' }}>Confirm Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                className="form-input"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleFormChange}
                disabled={loading}
                style={{
                  background: 'rgba(10, 10, 14, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '10px',
                  color: '#ffffff',
                }}
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #E5A84B 0%, #DF9B34 50%, #C58326 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '14px',
              fontSize: '15px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 18px rgba(223, 155, 52, 0.35)',
              transition: 'all 0.3s ease',
            }}
          >
            {loading ? (
              <>
                <Loader size={18} className="spinner" />
                <span>{authMode === 'login' ? 'Signing in...' : 'Creating account...'}</span>
              </>
            ) : (
              <span>{authMode === 'login' ? 'Sign In' : 'Create Account'}</span>
            )}
          </button>
        </form>

        {/* Back Button */}
        <button
          onClick={handleBack}
          style={{
            width: '100%',
            padding: '12px',
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: 'var(--text-secondary)',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '13px',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#DF9B34';
            e.currentTarget.style.color = '#DF9B34';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          ← Back to Role Selection
        </button>
      </div>


    </div>
  );
};

export default Onboarding;
