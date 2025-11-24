import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { getAllActivityTypeGroupAsync } from "../../apis/robotGroup.staff.api";

interface RobotGroupContentProps {
  onSchedule: (groupId: number) => void;
}

const RobotGroupContent: React.FC<RobotGroupContentProps> = ({ onSchedule }) => {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("");

  useEffect(() => {
    const loadGroups = async () => {
      try {
        const res = await getAllActivityTypeGroupAsync();
        if (res.success) {
          setGroups(res.data);

          if (res.data.length > 0) {
            setActiveTab(res.data[0].eventActivityName);
          }
        }
      } catch (err) {
        console.error("Error loading activity groups:", err);
      } finally {
        setLoading(false);
      }
    };

    loadGroups();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Loading Robot Groups...</p>
      </div>
    );
  }

  // GROUP BY EVENT ACTIVITY NAME
  const grouped = groups.reduce((acc: any, item: any) => {
    if (!acc[item.eventActivityName]) {
      acc[item.eventActivityName] = [];
    }
    acc[item.eventActivityName].push(item);
    return acc;
  }, {});

  const eventNames = Object.keys(grouped);

  return (
    <div className="p-6 space-y-8">
      {/* HEADER */}
      <h1 className="text-3xl font-bold text-gray-800">Bot Activity Groups</h1>

      {/* SEARCH BAR */}
      <div className="relative w-full sm:w-64">
        <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
        <input
          type="text"
          placeholder="Search..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* TABS */}
      <div className="flex flex-wrap gap-3 border-b pb-3">
        {eventNames.map((name) => (
          <button
            key={name}
            onClick={() => setActiveTab(name)}
            className={`px-4 py-2 rounded-lg border transition 
              ${
                activeTab === name
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
          >
            {name}
          </button>
        ))}
      </div>

      {/* ACTIVE TAB CONTENT */}
      <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">{activeTab}</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b text-gray-600 text-sm">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Activity Type Name</th>
                <th className="py-3 px-4">Activity Type ID</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {grouped[activeTab].map((item: any) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">
                    R-{item.id.toString().padStart(4, "0")}
                  </td>
                  <td className="py-3 px-4">{item.activityTypeName}</td>
                  <td className="py-3 px-4">
                    AT-{item.activityTypeId.toString().padStart(3, "0")}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onSchedule(item.id)} // <= SEND GROUP ID
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      Schedule
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RobotGroupContent;
