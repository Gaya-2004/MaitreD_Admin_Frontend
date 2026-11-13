/**
 * Utility functions for dynamic time-based greetings and user role determination
 */

export const cleanCategoryName = (name) => {
  if (!name) return '';
  return name
    .replace(/\s*\((Mugalivakkam|MGR\s*Nagar|MaitreD|Branch|Outlet|Chennai|Porur|Tambaram)[^)]*\)/gi, '')
    .replace(/^(mugalivakkam|mgrnagar)_/gi, '')
    .trim();
};

export const getTimeBasedGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 12) {
    return 'Good Morning';
  } else if (hour >= 12 && hour < 17) {
    return 'Good Afternoon';
  } else {
    return 'Good Evening';
  }
};

export const getUserRoleTitle = (user) => {
  let currentUser = user;
  if (!currentUser) {
    try {
      const stored = localStorage.getItem('user');
      if (stored) currentUser = JSON.parse(stored);
    } catch (e) {
      // ignore JSON parse error
    }
  }

  const role = (currentUser?.role || '').toUpperCase();
  const name = (currentUser?.name || '').toLowerCase();

  // Admin Check
  if (
    role.includes('SUPER_ADMIN') ||
    role === 'ADMIN' ||
    name.includes('admin') ||
    name.includes('super admin')
  ) {
    return 'Admin';
  }

  // Cashier Check
  if (
    role.includes('CASHIER') ||
    name.includes('cashier')
  ) {
    return 'Cashier';
  }

  // Manager Check
  if (
    role.includes('HOTEL_ADMIN') ||
    role.includes('MANAGER') ||
    name.includes('manager')
  ) {
    return 'Manager';
  }

  // If user name is present and not matching standard roles
  if (currentUser?.name) {
    return currentUser.name.split(' ')[0];
  }

  return 'Manager';
};

export const getGreetingMessage = (user) => {
  const greeting = getTimeBasedGreeting();
  const roleTitle = getUserRoleTitle(user);
  return `${greeting}! ${roleTitle}`;
};

