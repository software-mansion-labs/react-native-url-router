/**
 * Creates a route config from a React "children" object, which is usually
 * either a `<Route>` element or an array of them. Used internally by
 * `<Routes>` to create a route config from its children.
 *
 * @see https://reactrouter.com/docs/en/v6/utils/create-routes-from-children
 */

import React from "react";
import { Route, RouteObject } from "react-router";
import { RouteConfig } from "../components/Route";

export type RouteObjectWithConfig = RouteObject & { additional: RouteConfig };

// Borrowed from React Router – we need to change a few lines to allow for inline config
function createRoutesFromChildren(
  children: React.ReactNode
): RouteObjectWithConfig[] {
  const routes: RouteObjectWithConfig[] = [];

  React.Children.forEach(children, (element) => {
    if (!React.isValidElement(element)) {
      // Ignore non-elements. This allows people to more easily inline
      // conditionals in their route config.
      return;
    }

    if (element.type === React.Fragment) {
      // Transparently support React.Fragment and its children.
      // eslint-disable-next-line prefer-spread
      routes.push.apply(
        routes,
        createRoutesFromChildren(element.props.children)
      );
      return;
    }

    const route: RouteObjectWithConfig = {
      caseSensitive: element.props.caseSensitive,
      element: element.props.element,
      index: element.props.index,
      path: element.props.path,
      additional: element.props,
    };

    if (element.props.children) {
      route.children = createRoutesFromChildren(element.props.children);
    }

    routes.push(route);
  });

  return routes;
}
export default createRoutesFromChildren;
