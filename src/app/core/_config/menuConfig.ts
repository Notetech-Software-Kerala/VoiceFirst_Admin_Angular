// src/app/config/menuConfig.ts

export interface MenuItem {
  id: number;
  label: string;
  icon?: string;
  route?: string;
  children?: MenuItem[];
}

export const MENU_CONFIG: MenuItem[] = [
  { id: 1, label: 'Dashboard', icon: 'dashboard', route: '/pages/dashboard' },
  { id: 8, label: 'Menu', icon: 'menu_book', route: '/pages/menu' },
  { id: 9, label: 'Business Activity', icon: 'business_center', route: '/pages/business-activity' },
  { id: 10, label: 'Issue Type', icon: 'problem', route: '/pages/issue-type' },
  {
    id: 6,
    label: 'Employees',
    icon: 'group',
    children: [
      { id: 61, label: 'All Employees', route: '/employees' },
      { id: 62, label: 'Roles', route: '/roles' },
    ],
  },
];
