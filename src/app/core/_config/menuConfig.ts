// src/app/config/menuConfig.ts

export interface MenuItem {
  id: number;
  label: string;
  icon?: string;
  route?: string;
  children?: MenuItem[];
}

export const MENU_CONFIG: MenuItem[] = [
  { id: 1, label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
  { id: 2, label: 'Menu', icon: 'menu_book', route: '/menu' },
  { id: 3, label: 'Business Activity', icon: 'business_center', route: '/business-activity' },
  { id: 4, label: 'Program', icon: 'dvr', route: '/program' },
  { id: 5, label: 'Roles', route: '/role', icon: 'security' },
  { id: 6, label: 'Plan', route: '/plan', icon: 'price_change' },
  {
    id: 7,
    label: 'User',
    icon: 'group',
    children: [
      { id: 71, label: 'Employees', route: '/employees', icon: 'group' },
      // { id: 62, label: 'Roles', route: '/role', icon: 'security' },
    ],
  },
  {
    id: 8,
    label: 'Master Data',
    icon: 'settings',
    children: [
      { id: 81, label: 'Program Action', route: '/program-action', icon: 'directions' },
      { id: 82, label: 'Country', route: '/country', icon: 'globe' },
      { id: 83, label: 'Post Office', route: '/post-office', icon: 'post' },
      { id: 84, label: 'Place', route: '/place', icon: 'place' },
    ],
  },
];
