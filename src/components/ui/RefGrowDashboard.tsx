import React, { useEffect } from 'react';

interface RefGrowDashboardProps {
    email: string;
}

const RefGrowDashboard: React.FC<RefGrowDashboardProps> = ({ email }) => {
    useEffect(() => {
        // Check if script is already loaded
        const existingScript = document.querySelector('script[src="https://scripts.refgrowcdn.com/page.js"]');

        if (!existingScript) {
            const script = document.createElement('script');
            script.src = "https://scripts.refgrowcdn.com/page.js";
            script.async = true;
            script.defer = true;
            document.body.appendChild(script);
        }

        return () => {
            // Optional: Cleanup if needed, though typically not for these kinds of scripts
        };
    }, []);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6">
                <div
                    id="refgrow"
                    data-project-id="628"
                    data-project-email={email}
                    data-lang="de"
                    className="w-full min-h-[600px]"
                >
                    {/* RefGrow content stays here */}
                </div>
            </div>
        </div>
    );
};

export default RefGrowDashboard;
