export interface UserAvatarInfo {
  text: string;
  bg: string;
  badge: string;
  border: string;
  colorName: string;
}

/**
 * Returns distinct colors and white bold labels (A, 1, 2, 3...)
 * for fast recognition during user testing and demos.
 */
export function getUserAvatarInfo(username: string = '', role?: string): UserAvatarInfo {
  const u = username.toLowerCase().trim();

  if (role === 'Admin' || u === 'admin') {
    return {
      text: 'A',
      bg: 'bg-black text-white',
      badge: 'bg-black text-white',
      border: 'border-slate-800',
      colorName: 'Black',
    };
  }

  if (u === 'user1') {
    return {
      text: '1',
      bg: 'bg-blue-600 text-white',
      badge: 'bg-blue-100 text-blue-800 border border-blue-200',
      border: 'border-blue-400',
      colorName: 'Blue',
    };
  }

  if (u === 'user2') {
    return {
      text: '2',
      bg: 'bg-emerald-600 text-white',
      badge: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
      border: 'border-emerald-400',
      colorName: 'Emerald',
    };
  }

  if (u === 'user3') {
    return {
      text: '3',
      bg: 'bg-purple-600 text-white',
      badge: 'bg-purple-100 text-purple-800 border border-purple-200',
      border: 'border-purple-400',
      colorName: 'Purple',
    };
  }

  if (u === 'user4') {
    return {
      text: '4',
      bg: 'bg-amber-600 text-white',
      badge: 'bg-amber-100 text-amber-800 border border-amber-200',
      border: 'border-amber-400',
      colorName: 'Amber',
    };
  }

  // Extract trailing digits if present (e.g. user5 -> "5", eng12 -> "12")
  const digitMatch = u.match(/\d+$/);
  const text = digitMatch ? digitMatch[0] : u ? u.charAt(0).toUpperCase() : 'U';

  return {
    text,
    bg: 'bg-indigo-600 text-white',
    badge: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
    border: 'border-indigo-400',
    colorName: 'Indigo',
  };
}
