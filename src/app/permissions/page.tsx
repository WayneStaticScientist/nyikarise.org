"use client";

import { useEffect, useState } from "react";
import { Search, ShieldAlert, Edit3, Shield, Key, Loader2, X } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { AssetDecoder } from "@/lib/utils";
import api from "@/lib/api";
import DashboardLayout from "@/components/layout/DashboardLayout";

interface IUser {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  admin: number;
  stringPermissions: string[];
  avatar?: any;
}

const AVAILABLE_PERMISSIONS = [
  { id: "feeds_add", label: "Add Feeds", description: "Can upload feeds and edit own feeds." },
  { id: "feeds_edit", label: "Edit All Feeds", description: "Can edit all feeds across the platform." },
];

export default function PermissionsPage() {
  const { user } = useAuthStore();
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [adminLevel, setAdminLevel] = useState<number>(0);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/users", {
        params: { search, page, limit: 10 }
      });
      if (res.data.success) {
        setUsers(res.data.data.users);
        setTotalPages(res.data.data.totalPages || 1);
      }
    } catch (error) {
      console.error("Failed to load users", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.admin > 1) {
      fetchUsers();
    }
  }, [user, search, page]);

  const handleEditClick = (targetUser: IUser) => {
    setSelectedUser(targetUser);
    setAdminLevel(targetUser.admin || 0);
    setUserPermissions(targetUser.stringPermissions || []);
    setIsOpen(true);
  };

  const handleTogglePermission = (permId: string) => {
    setUserPermissions((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    );
  };

  const handleSave = async () => {
    if (!selectedUser) return;
    try {
      setSaving(true);
      const res = await api.put(
        `/admin/users/${selectedUser._id}/permissions`,
        {
          admin: adminLevel,
          stringPermissions: userPermissions,
        }
      );
      if (res.data.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u._id === selectedUser._id
              ? { ...u, admin: adminLevel, stringPermissions: userPermissions }
              : u
          )
        );
        setIsOpen(false);
      }
    } catch (error: any) {
      console.error(error.response?.data?.message || "Failed to save permissions");
    } finally {
      setSaving(false);
    }
  };

  if (!user || user.admin <= 1) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[80vh] gap-4 text-foreground-500">
          <ShieldAlert className="w-16 h-16 text-danger/50" />
          <h2 className="text-xl font-bold">Access Denied</h2>
          <p>You must be a Super Admin to view this page.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto p-4 animate-in fade-in duration-500">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            Access Control
          </h1>
          <p className="text-foreground-500 font-medium">
            Manage roles, responsibilities, and granular system permissions.
          </p>
        </div>

        <div className="flex items-center justify-between gap-4 flex-wrap bg-content1 p-4 rounded-2xl shadow-sm border border-divider">
          <div className="relative w-full sm:max-w-[44%]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-divider bg-content2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-primary/10 text-primary rounded-xl font-bold text-sm hover:bg-primary/20 transition-colors">
            <Key className="w-4 h-4" />
            Roles Overview
          </button>
        </div>

        <div className="bg-content1 rounded-2xl shadow-sm border border-divider overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-content2/50 text-foreground font-bold text-sm border-b border-divider">
                  <th className="px-6 py-4">USER</th>
                  <th className="px-6 py-4">CONTACT</th>
                  <th className="px-6 py-4">ROLE</th>
                  <th className="px-6 py-4">PERMISSIONS</th>
                  <th className="px-6 py-4 text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                      <span className="block text-sm text-foreground-500 mt-2">Loading users...</span>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-foreground-500">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((item) => (
                    <tr key={item._id} className="hover:bg-content2/40 transition-colors text-foreground">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-content2 flex-shrink-0 border border-divider">
                          {item.avatar && (
                            <img src={AssetDecoder.decoder(item.avatar)} alt={item.fullName} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">{item.fullName}</span>
                          <span className="text-xs text-foreground-400 font-mono">{item._id.substring(0, 8)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col text-sm">
                          <span>{item.email}</span>
                          <span className="text-xs text-foreground-400">{item.phoneNumber}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${item.admin > 1
                          ? "bg-secondary/10 text-secondary border-secondary/20"
                          : item.admin === 1
                            ? "bg-primary/10 text-primary border-primary/20"
                            : "bg-default/10 text-default-foreground border-default/20"
                          }`}>
                          {item.admin > 1 ? "Super Admin" : item.admin === 1 ? "Admin" : "User"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {item.stringPermissions?.length ? (
                            item.stringPermissions.map((p) => (
                              <span key={p} className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-success/10 text-success border border-success/20">
                                {p.replace("_", " ")}
                              </span>
                            ))
                          ) : (
                            <span className="text-foreground-400 text-xs italic">None</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleEditClick(item)}
                          className="p-2 hover:bg-content2 rounded-xl text-foreground-400 hover:text-primary transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 p-4 border-t border-divider bg-content2/30">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 text-sm bg-content1 border border-divider rounded-lg hover:bg-content2 disabled:opacity-50 disabled:cursor-not-allowed text-foreground transition-colors"
              >
                Prev
              </button>
              <div className="flex items-center px-4 text-sm font-medium text-foreground">
                Page {page} of {totalPages}
              </div>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 text-sm bg-content1 border border-divider rounded-lg hover:bg-content2 disabled:opacity-50 disabled:cursor-not-allowed text-foreground transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-content1 border border-divider rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95">
              <div className="px-6 py-4 border-b border-divider flex items-center justify-between">
                <div className="flex flex-col">
                  <h2 className="text-xl font-black text-foreground">Edit Permissions</h2>
                  <span className="text-sm text-foreground-500">
                    Modifying access for {selectedUser?.fullName}
                  </span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-content2 rounded-xl text-foreground-400 hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex flex-col gap-8">
                <div className="flex flex-col gap-3 bg-content2/50 p-4 rounded-2xl border border-divider">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                    <Shield className="w-4 h-4" /> Administrative Level
                  </h3>
                  <select
                    value={adminLevel}
                    onChange={(e) => setAdminLevel(Number(e.target.value))}
                    className="max-w-xs w-full p-2.5 rounded-xl border border-divider bg-content1 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value={0}>Standard User</option>
                    <option value={1}>Admin (Support/Moderation)</option>
                    <option value={2}>Super Admin (Full Access)</option>
                  </select>
                  <p className="text-xs text-foreground-400 mt-1">
                    Super Admins can access this page and modify other users' permissions.
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                    <Key className="w-4 h-4" /> Granular Capabilities
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {AVAILABLE_PERMISSIONS.map((perm) => {
                      const isChecked = userPermissions.includes(perm.id);
                      return (
                        <div
                          key={perm.id}
                          className={`flex gap-4 items-start p-4 rounded-2xl border transition-all cursor-pointer ${isChecked
                            ? "bg-primary/5 border-primary/30"
                            : "bg-content1 border-divider hover:bg-content2/50"
                            }`}
                          onClick={() => handleTogglePermission(perm.id)}
                        >
                          <div className="flex items-center h-5">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleTogglePermission(perm.id)}
                              className="w-4 h-4 text-primary border-divider rounded focus:ring-primary focus:ring-opacity-25 bg-content1"
                            />
                          </div>
                          <div className="flex flex-col -mt-0.5">
                            <span className="font-bold text-sm text-foreground">{perm.label}</span>
                            <span className="text-xs text-foreground-500 leading-tight mt-1">{perm.description}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-divider flex justify-end gap-3 bg-content2/20">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 border border-divider text-foreground-700 rounded-xl font-bold text-sm hover:bg-content2 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Configuration
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>);
}
