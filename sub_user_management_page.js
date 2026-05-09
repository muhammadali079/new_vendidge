'use client';

import { useEffect, useState } from 'react';
import { Edit2, Save, X, CheckCircle, XCircle } from 'lucide-react';

export default function SubUsersPage() {
    const [subUsers, setSubUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState(null);

    const fetchSubUsers = async () => {
        const adminId = sessionStorage.getItem("userId");
        try {
            const response = await fetch(`/api/sub-users?parentId=${adminId}`);
            const data = await response.json();
            if (response.ok) setSubUsers(data);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchSubUsers(); }, []);

    // Enter Edit Mode
    const startEdit = (user) => {
        setEditingId(user.id);
        setEditForm({
            id: user.id,
            is_active: user.is_active === 1,
            permissions: {
                can_view_invoice: user.can_view_invoice || 0,
                can_create_invoice: user.can_create_invoice || 0,
                can_edit_invoice: user.can_edit_invoice || 0,
                can_post_invoice: user.can_post_invoice || 0,
                can_delete_invoice: user.can_delete_invoice || 0,
            }
        });
    };

    const handleSave = async () => {
        try {
            const res = await fetch('/api/sub-users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm),
            });
            if (res.ok) {
                setEditingId(null);
                fetchSubUsers();
            }
        } catch (error) { alert("Save failed"); }
    };

    if (loading) return <div className="p-10 text-center animate-pulse">Loading Sub Users...</div>;

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
                    <span className="text-sm text-gray-500">{subUsers.length} total sub-users</span>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">User Identity</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase text-center">Permissions</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {subUsers.map(user => {
                                const isEditing = editingId === user.id;
                                return (
                                    <tr key={user.id} className={`transition-colors ${isEditing ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-gray-900">{user.username}</div>
                                            <div className="text-xs text-gray-500">{user.domain_name}</div>
                                        </td>

                                        <td className="px-6 py-4">
                                            {isEditing ? (
                                                <button
                                                    onClick={() => setEditForm({ ...editForm, is_active: !editForm.is_active })}
                                                    className={`px-3 py-1 rounded-full text-xs font-medium transition ${editForm.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                                                >
                                                    {editForm.is_active ? 'Active' : 'Inactive'}
                                                </button>
                                            ) : (
                                                <span className={`inline-flex items-center gap-1 text-sm ${user.is_active ? 'text-green-600' : 'text-red-500'}`}>
                                                    {user.is_active ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                                    {user.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            )}
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex justify-center gap-4">
                                                {['can_view_invoice', 'can_create_invoice', 'can_edit_invoice', 'can_delete_invoice', 'can_post_invoice'].map(perm => (
                                                    <div key={perm} className="flex flex-col items-center gap-1">
                                                        <span className={`text-[10px] uppercase font-bold tracking-tighter ${isEditing ? 'text-blue-600' : 'text-gray-400'}`}>
                                                            {perm.split('_')[1]}
                                                        </span>
                                                        <input
                                                            type="checkbox"
                                                            // Use pointer-events-none instead of disabled to keep colors bright
                                                            className={`
                w-5 h-5 rounded border-2 transition-all cursor-pointer
                ${isEditing
                                                                    ? 'border-blue-500 text-blue-600 focus:ring-blue-500'
                                                                    : 'border-gray-400 text-gray-700 pointer-events-none opacity-100' // High visibility when locked
                                                                }
            `}
                                                            checked={isEditing ? editForm.permissions[perm] === 1 : user[perm] === 1}
                                                            onChange={(e) => isEditing && setEditForm({
                                                                ...editForm,
                                                                permissions: { ...editForm.permissions, [perm]: e.target.checked ? 1 : 0 }
                                                            })}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            {isEditing ? (
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={handleSave} className="p-2 bg-green-600 text-white rounded-md hover:bg-green-700 shadow-sm transition">
                                                        <Save size={18} />
                                                    </button>
                                                    <button onClick={() => setEditingId(null)} className="p-2 bg-gray-200 text-gray-600 rounded-md hover:bg-gray-300 transition">
                                                        <X size={18} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button onClick={() => startEdit(user)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition">
                                                    <Edit2 size={18} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}