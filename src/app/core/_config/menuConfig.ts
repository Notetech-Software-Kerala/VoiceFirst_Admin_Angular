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
  { id: 4, label: 'Issue Type', icon: 'problem', route: '/issue-type' },
  { id: 5, label: 'Program', icon: 'dvr', route: '/program' },
  { id: 6, label: 'Roles', route: '/role', icon: 'security' },
  { id: 7, label: 'Plan', route: '/plan', icon: 'price_change' },
  {
    id: 8,
    label: 'User',
    icon: 'group',
    children: [
      { id: 81, label: 'Employees', route: '/employees', icon: 'group' },
      // { id: 62, label: 'Roles', route: '/role', icon: 'security' },
    ],
  },
  {
    id: 9,
    label: 'Master Data',
    icon: 'settings',
    children: [
      { id: 91, label: 'Country', route: '/country', icon: 'globe' },
      { id: 92, label: 'Post Office', route: '/post-office', icon: 'post' },
      { id: 93, label: 'Program Action', route: '/program-action', icon: 'directions' },
    ],
  },
];
