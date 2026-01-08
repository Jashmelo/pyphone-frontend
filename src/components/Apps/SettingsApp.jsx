import { useOS } from '../../context/OSContext';
import { endpoints } from '../../config';

const SettingsApp = () => {
    const { user, setUser } = useOS();
    const [clock24, setClock24] = useState(user?.settings?.clock_24h ?? true);

    const toggleClock = async () => {
        const newValue = !clock24;
        setClock24(newValue);

        // Update local state and optionally sync to backend
        if (user?.username) {
            const updatedUser = { ...user, settings: { ...user.settings, clock_24h: newValue } };
            setUser(updatedUser);
            localStorage.setItem('pyphone_user', JSON.stringify(updatedUser));

            // In a full implementation, we'd have a /api/settings endpoint
            // For now, we'll keep it in local storage + sync during login
        }
    };

    return (
        <div className="h-full bg-[#1c1c1e] text-white p-6">
            <h2 className="text-3xl font-bold mb-8">Settings</h2>

            <div className="space-y-6">
                <div className="bg-[#2c2c2e] rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-white/5 flex justify-between items-center">
                        <span>24-Hour Clock</span>
                        <div
                            onClick={toggleClock}
                            className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-colors ${clock24 ? 'bg-green-500' : 'bg-gray-600'}`}
                        >
                            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${clock24 ? 'translate-x-5' : 'translate-x-0'}`} />
                        </div>
                    </div>
                    <div className="p-4 flex justify-between items-center cursor-pointer hover:bg-white/5">
                        <span>Wallpaper</span>
                        <span className="text-gray-400">Neural &gt;</span>
                    </div>
                </div>

                <div className="text-center text-gray-500 text-sm mt-8">
                    PyPhone Web OS v1.0.0<br />
                    Connected to: {user?.username || 'Guest'}
                </div>
            </div>
        </div>
    );
};

export default SettingsApp;
