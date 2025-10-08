// src/components/Body/Sidebar.jsx
import { ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';

const Sidebar = ({ username, menuItems, selectedItem, setSelectedItem }) => {
  // A simple placeholder for a logout function
  const handleLogout = () => {
    console.log("Logging out...");
    // Here you would typically clear localStorage/session and redirect
  };
  
  return (
    <aside className="w-full md:w-64 bg-white shadow-md flex flex-col">
      {/* Profile Section */}
      <div className="p-6 border-b border-slate-200 text-center">
        <h2 className="text-xl font-semibold text-slate-800">
          Welcome, <span className="font-bold text-blue-600">{username}</span>!
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Your expense dashboard
        </p>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            // NEW: Destructure name and Icon component from the item object
            const { name, icon: Icon } = item;
            const isSelected = selectedItem === name;

            return (
              <li key={name}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedItem(name);
                  }}
                  // MODIFIED: Cleaner styling with a left border for the active item
                  className={`flex items-center gap-3 rounded-md px-3 py-2 transition-colors ${
                    isSelected
                      ? "bg-blue-50 text-blue-600 font-bold border-l-4 border-blue-600"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {/* NEW: Render the icon */}
                  <Icon className="h-6 w-6" />
                  <span>{name}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout Section */}
      <div className="p-4 mt-auto border-t border-slate-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 rounded-md px-3 py-2 transition-colors text-slate-600 hover:bg-red-50 hover:text-red-600"
        >
          <ArrowLeftOnRectangleIcon className="h-6 w-6" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;