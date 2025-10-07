// src/components/Body/Body.jsx
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Dashboard from "./Dashboard/Dashboard";
import Summary from "./Summary/Summary";
import Trends from "./Trends/Trends";
import OtherInfo from "./OtherInfo/OtherInfo";

const Body = () => {
  const menuItems = ["Dashboard", "Summary", "Trends", "Other Info"];
  const [selectedItem, setSelectedItem] = useState(menuItems[0]);
  const [username, setUsername] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    category: "",
    amount: "",
    description: "",
    date: "",
  });

  useEffect(() => {
    const storedUsername = localStorage.getItem("username") || "User";
    setUsername(storedUsername);
  }, []);

  const renderContent = () => {
    switch (selectedItem) {
      case "Dashboard":
        return (
          <Dashboard
            showForm={showForm}
            setShowForm={setShowForm}
            expenseForm={expenseForm}
            setExpenseForm={setExpenseForm}
          />
        );
      case "Summary":
        return <Summary />;
      case "Trends":
        return <Trends />;
      case "Other Info":
        return <OtherInfo />;
      default:
        return null;
    }
  };

  return (
    <main className="flex flex-col min-h-screen bg-slate-50 pt-12">
      <div className="flex flex-col md:flex-row flex-1">
        {/* Sidebar */}
        <Sidebar
          username={username}
          menuItems={menuItems}
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
          setShowForm={setShowForm}
        />

        {/* Main Content */}
        <div className="flex-1 p-6">{renderContent()}</div>
      </div>
    </main>
  );
};

export default Body;
