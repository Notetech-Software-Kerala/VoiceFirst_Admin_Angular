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
  { id: 5, label: 'Program', icon: 'problem', route: '/program' },
  {
    id: 6,
    label: 'User',
    icon: 'group',
    children: [
      { id: 61, label: 'Employees', route: '/employees' },
      { id: 62, label: 'Roles', route: '/roles' },
    ],
  },
  {
    id: 7,
    label: 'Master Data',
    icon: 'settings',
    children: [
      { id: 71, label: 'Country', route: '/country', icon: 'globe' },
      { id: 72, label: 'Post Office', route: '/post-office', icon: 'post' },
      { id: 73, label: 'Program Action', route: '/program-action', icon: 'directions' },
    ],
  },
];
