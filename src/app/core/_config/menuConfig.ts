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
  { id: 8, label: 'Menu', icon: 'menu_book', route: '/menu' },
  { id: 9, label: 'Business Activity', icon: 'business_center', route: '/business-activity' },
  { id: 10, label: 'Program Action', icon: 'business_center', route: '/program-action' },
  { id: 11, label: 'Issue Type', icon: 'problem', route: '/issue-type' },
  {
    id: 6,
    label: 'User',
    icon: 'group',
    children: [
      { id: 61, label: 'Employees', route: '/employees' },
      { id: 62, label: 'Roles', route: '/roles' },
    ],
  },
];
