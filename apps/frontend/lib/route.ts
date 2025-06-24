type RouteCategory = {
  path: string;
  tags: (
    'hidden' |
    'auth' |
    'middleware' |
    'admin'
  )[];
};

const routeMap: RouteCategory[] = [
  {
    path: '/api/public',
    tags: ['auth', 'hidden', 'middleware'],
  },
  {
    path: '/admin',
    tags: ['auth', 'hidden', 'middleware', 'admin']
  },
  {
    path: '/profile',
    tags: ['auth', 'hidden', 'middleware'],
  },
  {
    path: '/organization',
    tags: ['auth', 'hidden', 'middleware'],
  },
  { path: '/register',
    tags: ['hidden']
  },
  { path: '/login',
    tags: ['hidden']
  },
  { path: '/forgot-password',
    tags: ['hidden']
  },
  { path: '/reset-password',
    tags: ['hidden']
  },
];

export const hasTag = (pathname: string, tag: 'auth' | 'hidden' | 'middleware' | 'admin'): boolean =>
  routeMap.some(route => pathname.startsWith(route.path) && route.tags.includes(tag));