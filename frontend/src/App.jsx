import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { LandingPage } from './pages/LandingPage';
import { CoursesPage } from './pages/CoursesPage';
import { AboutPage } from './pages/AboutPage';
import { CourseDetailsPage } from './pages/CourseDetailsPage';
import { DashboardPage } from './pages/DashboardPage';
import { MyCoursesPage } from './pages/MyCoursesPage';
import { SettingsPage } from './pages/SettingsPage';
import { CreateCoursePage } from './pages/CreateCoursePage';
import { EditCoursePage } from './pages/EditCoursePage';
import { CertificatePage } from './pages/CertificatePage';

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: "courses", element: <CoursesPage /> },
      { path: "about", element: <AboutPage /> },
      { path: "course/:id", element: <CourseDetailsPage /> },
      { path: "certificate/:id", element: <CertificatePage /> },
    ],
  },
  {
    path: "/dashboard",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "courses", element: <MyCoursesPage /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "create-course", element: <CreateCoursePage /> },
      { path: "courses/:id/edit", element: <EditCoursePage /> },
    ],
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
