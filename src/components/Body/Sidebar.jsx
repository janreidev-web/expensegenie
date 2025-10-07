// src/components/Body/Sidebar.jsx
const Sidebar = ({ username, menuItems, selectedItem, setSelectedItem, setShowForm }) => {
  return (
    <aside className="w-full md:w-64 bg-white shadow flex flex-col overflow-y-auto">
      <div className="text-center px-6 py-6 border-b border-slate-200">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
          Welcome back, <span className="text-blue-600">{username}</span>!
        </h2>
        <p className="mt-2 text-base sm:text-lg text-slate-700">
          Your personal assistant for managing expenses effortlessly.
        </p>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-4 py-6">
        <h3 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-4 text-center">
          Menu
        </h3>
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li
              key={item}
              onClick={() => {
                setSelectedItem(item);
                setShowForm(false); // Close form on menu change
              }}
              className={`cursor-pointer border border-slate-200 rounded-md px-4 py-2 transition-all ${
                selectedItem === item
                  ? "bg-blue-100 border-blue-400 text-blue-700 font-semibold"
                  : "hover:bg-slate-100 text-slate-700"
              }`}
            >
              {item}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
