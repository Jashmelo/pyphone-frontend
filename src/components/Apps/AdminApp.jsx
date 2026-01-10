import React, { useState, useEffect } from 'react';
import {
    ShieldAlert, Users, MessageCircle, Activity,
    Inbox, Trash2, ShieldCheck, ShieldX,
    ChevronRight, BarChart3, AppWindow, UserCheck, ChevronLeft, Clock, AlertCircle, Search
} from 'lucide-react';
import { endpoints, API_BASE_URL } from '../../config';
import { useOS } from '../../context/OSContext';

// Sub-component: Stats Dashboard
const StatsDashboard = ({ stats }) => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="grid grid-cols-2 gap-6">
            <div className="bg-indigo-500/5 border border-indigo-500/20 p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-2 text-indigo-300">
                    <Users size={20} />
                    <span>Total Registered Users</span>
                </div>
                <p className="text-4xl font-bold text-white">{stats?.total_users || 0}</p>
            </div>
            <div className="bg-indigo-500/5 border border-indigo-500/20 p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-2 text-indigo-300">
                    <MessageCircle size={20} />
                    <span>Global Message Count</span>
                </div>
                <p className="text-4xl font-bold text-white">{stats?.total_messages || 0}</p>
            </div>
        </div>

        <div className="bg-indigo-500/5 border border-indigo-500/20 p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4 text-indigo-300">
                <Activity size={20} />
                <span>Recent Registrations</span>
            </div>
            <div className="flex flex-wrap gap-2">
                {stats?.users_list?.slice(-15).map(user => (
                    <div key={user} className="bg-white/5 px-3 py-1 rounded text-sm text-gray-400 border border-white/5 lowercase">
                        {user === 'admin' ? '[CORE] admin' : `@${user}`}
                    </div>
                ))}
            </div>
        </div>
    </div>
);

// Sub-component: User Manager with Suspension Controls
const UserManager = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [suspendModal, setSuspendModal] = useState(null); // { username, hours, reason }
    const [suspensions, setSuspensions] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const { impersonate } = useOS();

    const fetchUsers = async () => {
        try {
            const res = await fetch(endpoints.adminUsers);
            const data = await res.json();
            setUsers(data);
            setLoading(false);
            // Fetch suspension data for all users
            data.forEach(user => fetchSuspensionStatus(user.username));
        } catch (err) { console.error(err); setLoading(false); }
    };

    const fetchSuspensionStatus = async (username) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/users/${username}/suspension`);
            if (res.ok) {
                const data = await res.json();
                setSuspensions(prev => ({ ...prev, [username]: data }));
            }
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchUsers(); }, []);

    const deleteUser = async (username) => {
        if (!window.confirm(`Are you sure you want to PERMANENTLY delete @${username}?`)) return;
        try {
            await fetch(`${endpoints.adminUsers}/${username}`, { method: 'DELETE' });
            fetchUsers();
        } catch (err) { console.error(err); }
    };

    const suspendUser = async () => {
        if (!suspendModal.username || suspendModal.hours <= 0) return;
        try {
            const suspendUntil = new Date(Date.now() + suspendModal.hours * 60 * 60 * 1000);
            await fetch(`${API_BASE_URL}/api/users/${suspendModal.username}/suspend`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    hours: suspendModal.hours,
                    reason: suspendModal.reason || 'No reason provided',
                    suspend_until: suspendUntil.toISOString()
                })
            });
            setSuspendModal(null);
            fetchSuspensionStatus(suspendModal.username);
        } catch (err) { console.error(err); }
    };

    const unsuspendUser = async (username) => {
        if (!window.confirm(`Remove suspension for @${username}?`)) return;
        try {
            await fetch(`${API_BASE_URL}/api/users/${username}/suspend`, {
                method: 'DELETE'
            });
            fetchSuspensionStatus(username);
            setSuspendModal(null);
        } catch (err) { console.error(err); }
    };

    const filteredUsers = users.filter(u => 
        u.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <div className="text-indigo-400">Loading directory...</div>;

    return (
        <div className="space-y-4 animate-in fade-in duration-300">
            <h3 className="text-xl font-bold text-white mb-6">User Registry</h3>
            
            {/* Search Bar */}
            <div className="relative mb-6">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400" />
                <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 pl-10 text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder-gray-500"
                />
            </div>

            <div className="overflow-hidden border border-white/10 rounded-xl">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 text-indigo-300 text-xs">
                        <tr>
                            <th className="p-3 md:p-4">Username</th>
                            <th className="p-3 md:p-4">Role</th>
                            <th className="p-3 md:p-4">Status</th>
                            <th className="p-3 md:p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-gray-300 text-xs">
                        {filteredUsers.map(u => {
                            const susp = suspensions[u.username];
                            const isSuspended = susp?.is_suspended;
                            return (
                                <tr key={u.username} className={`hover:bg-white/5 transition-colors ${isSuspended ? 'bg-red-900/10' : ''}`}>
                                    <td className="p-3 md:p-4 font-mono">@{u.username}</td>
                                    <td className="p-3 md:p-4">
                                        <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold whitespace-nowrap ${u.is_admin ? 'bg-indigo-600 text-white' : 'bg-gray-600/50 text-gray-400'}`}>
                                            {u.is_admin ? 'Admin' : 'User'}
                                        </span>
                                    </td>
                                    <td className="p-3 md:p-4">
                                        {isSuspended ? (
                                            <span className="flex items-center gap-1 text-red-400 text-[9px] uppercase font-bold">
                                                <Clock size={12} /> Suspended
                                            </span>
                                        ) : (
                                            <span className="text-green-400 text-[9px] uppercase font-bold">Active</span>
                                        )}
                                    </td>
                                    <td className="p-3 md:p-4 text-right">
                                        {u.username !== 'admin' && (
                                            <div className="flex items-center justify-end gap-1 md:gap-2 flex-wrap">
                                                <button
                                                    onClick={() => impersonate(u.username)}
                                                    className="text-indigo-400 hover:text-indigo-300 text-[8px] md:text-[10px] font-bold bg-indigo-500/10 px-2 md:px-3 py-1 md:py-1.5 rounded flex items-center gap-1 md:gap-2 border border-indigo-500/20 whitespace-nowrap"
                                                >
                                                    <UserCheck size={12} /> CONTROL
                                                </button>
                                                {isSuspended ? (
                                                    <button
                                                        onClick={() => unsuspendUser(u.username)}
                                                        className="text-green-400 hover:text-green-300 text-[8px] md:text-[10px] font-bold bg-green-500/10 px-2 md:px-3 py-1 md:py-1.5 rounded flex items-center gap-1 md:gap-2 border border-green-500/20 whitespace-nowrap"
                                                    >
                                                        <ShieldCheck size={12} /> UNSUSPEND
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => setSuspendModal({ username: u.username, hours: 1, reason: '' })}
                                                        className="text-yellow-400 hover:text-yellow-300 text-[8px] md:text-[10px] font-bold bg-yellow-600/10 px-2 md:px-3 py-1 md:py-1.5 rounded flex items-center gap-1 md:gap-2 border border-yellow-500/20 whitespace-nowrap"
                                                    >
                                                        <Clock size={12} /> SUSPEND
                                                    </button>
                                                )}
                                                <button onClick={() => deleteUser(u.username)} className="text-red-400 hover:text-red-300 p-1 md:p-2">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {filteredUsers.length === 0 && (
                <div className="text-center py-12 text-gray-600 italic">No users found matching "{searchQuery}"</div>
            )}

            {/* Suspension Modal */}
            {suspendModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-[#1c1c1e] border border-yellow-500/20 rounded-2xl p-6 max-w-md w-full">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertCircle size={24} className="text-yellow-500" />
                            <h3 className="text-xl font-bold text-white">Suspend Account</h3>
                        </div>

                        <p className="text-sm text-gray-300 mb-4">Suspend <span className="font-bold text-yellow-400">@{suspendModal.username}</span></p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-2">Duration (Hours)</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={suspendModal.hours}
                                    onChange={e => setSuspendModal({ ...suspendModal, hours: parseInt(e.target.value) })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-yellow-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-2">Reason</label>
                                <textarea
                                    value={suspendModal.reason}
                                    onChange={e => setSuspendModal({ ...suspendModal, reason: e.target.value })}
                                    placeholder="Why is this account being suspended?"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-yellow-500 text-xs resize-none h-20"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={suspendUser}
                                    className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 rounded-lg transition-colors"
                                >
                                    Suspend User
                                </button>
                                <button
                                    onClick={() => setSuspendModal(null)}
                                    className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-2 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Sub-component: Feedback Inbox
const FeedbackInbox = () => {
    const [feedback, setFeedback] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchFeedback = async () => {
        try {
            const res = await fetch(endpoints.adminFeedback);
            const data = await res.json();
            setFeedback(data);
            setLoading(false);
        } catch (err) { console.error(err); setLoading(false); }
    };

    useEffect(() => { fetchFeedback(); }, []);

    const deleteFb = async (id) => {
        try {
            await fetch(`${endpoints.adminFeedback}/${id}`, { method: 'DELETE' });
            fetchFeedback();
        } catch (err) { console.error(err); }
    };

    if (loading) return <div className="text-indigo-400">Syncing inbox...</div>;

    return (
        <div className="space-y-4 animate-in fade-in duration-300">
            <h3 className="text-xl font-bold text-white mb-6">Feedback Inbox</h3>
            <div className="space-y-3">
                {feedback.map(f => (
                    <div key={f.id} className="bg-indigo-500/5 border border-indigo-500/20 p-4 rounded-xl flex justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <span className="text-indigo-300 font-bold font-mono text-sm">@{f.user}</span>
                                <span className="text-[9px] text-gray-500 italic">{f.timestamp}</span>
                            </div>
                            <p className="text-gray-200 text-sm leading-relaxed break-words">{f.content}</p>
                        </div>
                        <button onClick={() => deleteFb(f.id)} className="text-gray-600 hover:text-red-400 p-1 flex-shrink-0">
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
                {feedback.length === 0 && <div className="text-center py-12 text-gray-600 italic">No feedback received.</div>}
            </div>
        </div>
    );
};

// Sub-component: Custom App Oversight
const AppOversight = () => {
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchApps = async () => {
        try {
            const res = await fetch(endpoints.adminApps);
            const data = await res.json();
            setApps(data);
            setLoading(false);
        } catch (err) { console.error(err); setLoading(false); }
    };

    useEffect(() => { fetchApps(); }, []);

    const togglePublic = async (owner, app_name, currentStatus) => {
        try {
            await fetch(endpoints.adminAppVisibility, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ owner, app_name, is_public: !currentStatus })
            });
            fetchApps();
        } catch (err) { console.error(err); }
    };

    if (loading) return <div className="text-indigo-400">Scanning app registry...</div>;

    return (
        <div className="space-y-4 animate-in fade-in duration-300">
            <h3 className="text-xl font-bold text-white mb-6">App Moderation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {apps.map((app, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/10 p-4 rounded-xl flex justify-between items-center">
                        <div className="min-w-0">
                            <h4 className="font-bold text-indigo-300 truncate">{app.name}</h4>
                            <p className="text-xs text-gray-500">by @{app.owner}</p>
                        </div>
                        <button
                            onClick={() => togglePublic(app.owner, app.name, app.is_public)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex-shrink-0 ml-2 whitespace-nowrap ${app.is_public ? 'bg-green-600 text-white' : 'bg-white/10 text-gray-400'}`}
                        >
                            {app.is_public ? <ShieldCheck size={14} /> : <ShieldX size={14} />}
                            {app.is_public ? 'PUBLIC' : 'PRIVATE'}
                        </button>
                    </div>
                ))}
                {apps.length === 0 && <div className="col-span-full text-center py-12 text-gray-600 italic">No custom apps found.</div>}
            </div>
        </div>
    );
};

// Main Admin Controller
const AdminApp = () => {
    const [view, setView] = useState('stats');
    const [stats, setStats] = useState(null);
    const [showMenu, setShowMenu] = useState(true);
    const { user, deviceType, trueAdmin, stopImpersonation } = useOS();

    const isImpersonating = trueAdmin === 'admin' && user?.username !== 'admin';
    const isMobile = deviceType === 'mobile' || deviceType === 'tablet';

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch(endpoints.adminStats);
                const data = await res.json();
                setStats(data);
            } catch (err) { console.error(err); }
        };
        fetchStats();
        const interval = setInterval(fetchStats, 10000);
        return () => clearInterval(interval);
    }, []);

    const menuItems = [
        { id: 'stats', label: 'Monitor', icon: BarChart3 },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'feedback', label: 'Feedback', icon: Inbox },
        { id: 'apps', label: 'Apps', icon: AppWindow },
    ];

    // Mobile Menu View
    if (isMobile && showMenu) {
        return (
            <div className="flex flex-col h-full bg-[#09090b] text-indigo-400 font-mono">
                {/* Header */}
                <div className="p-4 border-b border-indigo-500/20 flex items-center gap-3 bg-black/40">
                    <ShieldAlert size={20} />
                    <span className="font-bold text-white tracking-widest text-sm">ADMIN CORE</span>
                </div>

                {isImpersonating && (
                    <div className="p-3 bg-rose-500/10 border-b border-rose-500/20 animate-pulse">
                        <button
                            onClick={stopImpersonation}
                            className="w-full bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-black py-2 rounded shadow-lg transition-all"
                        >
                            RESTORE ADMIN SESSION
                        </button>
                    </div>
                )}

                {/* Menu Items */}
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setView(item.id);
                                setShowMenu(false);
                            }}
                            className="w-full flex items-center justify-between p-3 rounded-xl transition-all hover:bg-white/5 text-indigo-300 active:bg-indigo-600/20"
                        >
                            <div className="flex items-center gap-3 text-sm">
                                <item.icon size={18} />
                                <span>{item.label}</span>
                            </div>
                            <ChevronRight size={14} />
                        </button>
                    ))}
                </nav>

                {/* Footer */}
                <div className="p-3 border-t border-indigo-500/20 text-[8px] md:text-[9px] opacity-40 leading-tight bg-black/40 text-center">
                    SESSION: ENCRYPTED-RSA<br />
                    @{user?.username}
                </div>
            </div>
        );
    }

    // Mobile Detail View
    if (isMobile && !showMenu) {
        return (
            <div className="flex flex-col h-full bg-[#09090b] text-indigo-400 font-mono">
                {/* Header with Back Button */}
                <div className="p-4 border-b border-indigo-500/20 flex items-center gap-3 bg-black/40">
                    <button
                        onClick={() => setShowMenu(true)}
                        className="p-1.5 -m-1.5 hover:bg-white/10 rounded-lg transition-all"
                    >
                        <ChevronLeft size={18} className="text-indigo-400" />
                    </button>
                    <span className="font-bold text-white tracking-widest text-sm uppercase">
                        {menuItems.find(m => m.id === view)?.label}
                    </span>
                </div>

                {/* Content */}
                <div className="flex-1 p-4 overflow-y-auto text-white text-sm">
                    {view === 'stats' && <StatsDashboard stats={stats} />}
                    {view === 'users' && <UserManager />}
                    {view === 'feedback' && <FeedbackInbox />}
                    {view === 'apps' && <AppOversight />}
                </div>
            </div>
        );
    }

    // Desktop View - Original layout
    return (
        <div className="h-full flex bg-[#09090b] text-indigo-400 font-mono">
            {/* Admin Sidebar */}
            <div className="w-64 border-r border-indigo-500/20 bg-black/40 flex flex-col">
                <div className="p-6 border-b border-indigo-500/20 flex items-center gap-3">
                    <ShieldAlert className="text-indigo-500" size={24} />
                    <span className="font-bold text-white tracking-widest text-sm">ADMIN CORE</span>
                </div>

                {isImpersonating && (
                    <div className="p-4 bg-rose-500/10 border-b border-rose-500/20 animate-pulse">
                        <button
                            onClick={stopImpersonation}
                            className="w-full bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-black py-2 rounded shadow-lg transition-all"
                        >
                            RESTORE ADMIN SESSION
                        </button>
                    </div>
                )}

                <nav className="flex-1 p-4 space-y-1">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setView(item.id)}
                            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${view === item.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'hover:bg-white/5 text-indigo-300'}`}
                        >
                            <div className="flex items-center gap-3 text-sm">
                                <item.icon size={18} />
                                <span>{item.label}</span>
                            </div>
                            <ChevronRight size={14} className={view === item.id ? 'opacity-100' : 'opacity-0'} />
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-indigo-500/20 text-[10px] opacity-40 leading-tight">
                    PYPHONE KERNEL ACCESS<br />
                    CONTROLLING: @{user?.username}<br />
                    SESSION: ENCRYPTED-RSA
                </div>
            </div>

            {/* Main Content View */}
            <div className="flex-1 p-8 overflow-y-auto text-white">
                {view === 'stats' && <StatsDashboard stats={stats} />}
                {view === 'users' && <UserManager />}
                {view === 'feedback' && <FeedbackInbox />}
                {view === 'apps' && <AppOversight />}
            </div>
        </div>
    );
};

export default AdminApp;