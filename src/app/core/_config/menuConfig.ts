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
    id: 2,
    label: 'UI Components',
    icon: 'insert_chart',
    children: [
      { id: 21, label: 'Forms', route: '/pages/forms' },
      { id: 22, label: 'Dialog', route: '/pages/dialog' },
      { id: 23, label: 'Table', route: '/pages/table' },
    ],
  },

  { id: 3, label: 'Notifications', icon: 'notifications', route: '/notifications' },
  { id: 4, label: 'Favourites', icon: 'star', route: '/favourites' },

  {
    id: 5,
    label: 'Products',
    icon: 'storefront',
    children: [
      { id: 51, label: 'All Products', route: '/products' },
      { id: 52, label: 'Inventory', route: '/products/inventory' },
      { id: 53, label: 'Collections', route: '/products/collections' },
    ],
  },

  {
    id: 6,
    label: 'Customers',
    icon: 'group',
    children: [
      { id: 61, label: 'All Customers', route: '/customers' },
      { id: 62, label: 'Segments', route: '/customers/segments' },
    ],
  },

  { id: 7, label: 'Settings', icon: 'settings', route: '/settings' },
];
