export interface RouteFilterAutoDisableContext {
  canUseAuthorTools: boolean;
  isRouteFilterEnabled: boolean;
  routeNodeCount: number;
}

export const shouldAutoDisableRouteFilter = ({
  canUseAuthorTools,
  isRouteFilterEnabled,
  routeNodeCount,
}: RouteFilterAutoDisableContext) =>
  canUseAuthorTools && isRouteFilterEnabled && routeNodeCount === 0;
