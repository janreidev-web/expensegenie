import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Dashboard from "./Dashboard/Dashboard";
import Summary from "./Summary/Summary";
import Trends from "./Trends/Trends";
import Budgeting from "./Budgeting/Budgeting"; 

// NEW: Import the icon for Budgeting
import {
  ChartPieIcon,
  DocumentChartBarIcon,
  PresentationChartLineIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';

// MODIFIED: The menuItems array is updated
const menuItems = [
  { name: "Dashboard", icon: ChartPieIcon, component: <Dashboard /> },
  { name: "Summary", icon: DocumentChartBarIcon, component: <Summary /> },
  { name: "Trends", icon: PresentationChartLineIcon, component: <Trends /> },
  { name: "Budgeting", icon: BanknotesIcon, component: <Budgeting /> },
];

const CONTENT_MAP = menuItems.reduce((map, item) => {
  map[item.name] = item.component;
  return map;
}, {});

const Body = () => {
  const [selectedItem, setSelectedItem] = useState(menuItems[0].name);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const storedUsername = localStorage.getItem("username") || "User";
    setUsername(storedUsername);
  }, []);

  return (
    <div className="flex flex-col md:flex-row bg-slate-50 h-full">
      <Sidebar
        username={username}
        menuItems={menuItems}
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
      />
      <div className="flex-1 p-6 overflow-y-auto">
        {CONTENT_MAP[selectedItem]}
      </div>
    </div>
  );
};

export default Body;