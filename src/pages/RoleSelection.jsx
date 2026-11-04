import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChevronRight, LogOut } from 'lucide-react';
import RestaurantBG from '../assets/restaurant_bg.png';
import MaitreDLogoDark from '../assets/maitred_logo_dark.png';
import MaitreDChef from '../assets/maitred_chef.png';

const RoleSelection = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [selectedRole, setSelectedRole] = useState(null);

  const roles = [
    {
      id: 'super_admin',
      label: 'Super Admin',
      abbreviation: 'SA',
      description: 'Manage hotels, venues & managers',
      color: 'gold',
      path: '/admin-dashboard',
    },
    {
      id: 'hotel_manager',
      label: 'Hotel Manager',
      abbreviation: 'HM',
      description: 'Manage daily restaurant operations',
      color: 'gold',
      path: '/manager-dashboard',
    },
    {
      id: 'cashier',
      label: 'Cashier',
      abbreviation: 'CA',
      description: 'Manage cash payments and bill generation',
      color: 'gold',
      path: '/cashier-dashboard',
    },
  ];

  const handleRoleSelect = (role) => {
    setSelectedRole(role.id);
    setTimeout(() => {
      navigate(role.path, { state: { role: role.label, user } });
    }, 250);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

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
        <div className="hero-title-block" style={{ paddingBottom: '16px' }}>
          <img
            src={MaitreDLogoDark}
            alt="MaitreD"
            className="hero-title-image"
            style={{
              maxWidth: '260px',
              width: '100%',
              height: 'auto',
              filter: 'drop-shadow(0 8px 24px rgba(223, 155, 52, 0.3))',
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
          {user && (
            <div style={{ marginTop: '12px', color: '#DF9B34', fontSize: '14px', fontWeight: '500' }}>
              Welcome back, <strong>{user.name}</strong>
            </div>
          )}
        </div>

        {/* Role Options */}
        <div className="role-options" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {roles.map((role) => (
            <button
              key={role.id}
              className={`btn-role ${selectedRole === role.id ? 'active' : ''}`}
              onClick={() => handleRoleSelect(role)}
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

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          style={{
            marginTop: '36px',
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: 'var(--text-secondary)',
            padding: '10px 24px',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            margin: '36px auto 0',
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
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="page-footer-banner" style={{ marginTop: '24px' }}>
        <img
          src={MaitreDChef}
          alt="MaitreD Mascot"
          className="mascot-image"
          style={{ width: '130px', height: 'auto', opacity: 0.9, filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.5))' }}
        />
      </div>
    </div>
  );
};

export default RoleSelection;
