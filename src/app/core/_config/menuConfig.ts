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

  {
    id: 2, label: 'Issue Type', route: '/issue-type', icon: 'question_mark'
  },

  { id: 3, label: 'Business Activity', icon: 'business_center', route: '/business-activity' },
  { id: 4, label: 'Program', icon: 'dvr', route: '/program' },
  { id: 5, label: 'Plan', route: '/plan', icon: 'price_change' },

  { id: 6, label: 'Employees', route: '/employees', icon: 'group' },
  { id: 7, label: 'Roles', route: '/role', icon: 'security' },

  {
    id: 8,
    label: 'Master Data',
    icon: 'settings',
    children: [
      { id: 81, label: 'Issue Status', route: '/issue-status', icon: 'check_circle' },
      { id: 82, label: 'Issue Character Type', route: '/issue-character-type', icon: 'group' },
      { id: 83, label: 'Issue Media Type', route: '/issue-media-type', icon: 'perm_media' },
      { id: 84, label: 'Issue Media Format', route: '/issue-media-format', icon: 'books_movies_and_music' },
      { id: 85, label: 'Program Action', route: '/program-action', icon: 'directions' },
      { id: 86, label: 'Country', route: '/country', icon: 'globe' },
      { id: 87, label: 'Post Office', route: '/post-office', icon: 'post' },
      { id: 88, label: 'Place', route: '/place', icon: 'place' },

    ],
  },

  { id: 9, label: 'Menu', icon: 'menu_book', route: '/menu' },
];
