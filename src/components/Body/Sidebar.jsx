// src/components/Body/Sidebar.jsx
const Sidebar = ({ username, menuItems, selectedItem, setSelectedItem }) => {
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
                  className={`flex items-center gap-3 rounded-md px-3 py-2 transition-colors ${
                    isSelected
                      ? "bg-blue-50 text-blue-600 font-bold border-l-4 border-blue-600"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="h-6 w-6" />
                  <span>{name}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;