export type MobileNavigationItemInput = {
  active: boolean;
  secondary?: boolean;
};

export type MobileNavigationLayoutItem = MobileNavigationItemInput & {
  key: string;
  disabled?: boolean;
  mobilePrimary?: boolean;
};

export const getMobileNavigationPriorityClass = ({ active, secondary = false }: MobileNavigationItemInput) => {
  if (active) {
    return 'app-nav-button--mobile-current';
  }

  return secondary ? 'app-nav-button--mobile-secondary' : 'app-nav-button--mobile-primary';
};

export const getMobileNavigationSections = <Item extends MobileNavigationLayoutItem>(
  items: Item[],
  maxPrimaryItems = 4,
) => {
  const enabledItems = items.filter((item) => !item.disabled || item.active);
  const primaryItems: Item[] = [];
  const addPrimaryItem = (item: Item) => {
    if (primaryItems.length >= maxPrimaryItems || primaryItems.some((candidate) => candidate.key === item.key)) {
      return;
    }

    primaryItems.push(item);
  };

  enabledItems.filter((item) => item.active).forEach(addPrimaryItem);
  enabledItems.filter((item) => item.mobilePrimary).forEach(addPrimaryItem);
  enabledItems.filter((item) => !item.secondary).forEach(addPrimaryItem);

  return {
    primaryItems,
    overflowItems: enabledItems.filter((item) => !primaryItems.some((primary) => primary.key === item.key)),
  };
};
