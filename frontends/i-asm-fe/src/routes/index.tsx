import { Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { routes } from "@/routes/routes";
import ProtectedRoute from "@/routes/ProtectedRoute";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          {routes.map((route) => {
            const Element = route.element;

            return (
              <Route
                key={route.path}
                path={route.path}
                element={
                  route.auth ? (
                    <ProtectedRoute roles={route.roles}>
                      <Element />
                    </ProtectedRoute>
                  ) : (
                    <Element />
                  )
                }
              />
            );
          })}
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRoutes;