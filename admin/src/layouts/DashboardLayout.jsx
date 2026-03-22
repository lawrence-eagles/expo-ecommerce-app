import { Outlet } from "react-router";

const DashboardLayout = () => {
  return (
    <div>
      <h1>sidebar</h1>
      <h1>Navbar</h1>
      <Outlet />
    </div>
  );
};

export default DashboardLayout;
