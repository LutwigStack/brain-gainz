export type MobileNavigationItemInput = {
  active: boolean;
  secondary?: boolean;
};

export const getMobileNavigationPriorityClass = ({ active, secondary = false }: MobileNavigationItemInput) => {
  if (active) {
    return 'app-nav-button--mobile-current';
  }

  return secondary ? 'app-nav-button--mobile-secondary' : 'app-nav-button--mobile-primary';
};
