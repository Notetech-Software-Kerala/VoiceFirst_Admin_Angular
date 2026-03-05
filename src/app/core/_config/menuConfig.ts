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
  { id: 7, label: 'Employees', route: '/employees', icon: 'group' },
  {
    id: 8,
    label: 'Issue',
    icon: 'question_mark',
    children: [
      { id: 81, label: 'Issue Character Type', route: '/issue-character-type', icon: 'group' },
      { id: 82, label: 'Issue Media Type', route: '/issue-media-type', icon: 'perm_media' },
      { id: 83, label: 'Issue Status', route: '/issue-status', icon: 'check_circle' },
      { id: 84, label: 'Issue Media Format', route: '/issue-media-format', icon: 'perm_media' },
    ],
  },
  {
    id: 9,
    label: 'Master Data',
    icon: 'settings',
    children: [
      { id: 91, label: 'Program Action', route: '/program-action', icon: 'directions' },
      { id: 92, label: 'Country', route: '/country', icon: 'globe' },
      { id: 93, label: 'Post Office', route: '/post-office', icon: 'post' },
      { id: 94, label: 'Place', route: '/place', icon: 'place' },
    ],
  },
];
