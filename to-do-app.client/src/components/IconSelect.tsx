import React from "react";
import * as Icons from "lucide-react";

// Definiowanie opcji ikon 
const iconOptions = Object.keys(Icons).map((iconName) => ({
    label: iconName,
    value: iconName,
    icon: Icons[iconName as keyof typeof Icons],
}));

// Komponent do wyboru ikony (z listy rozwijanej)
function IconSelect({
    value,
    onChange,
}: {
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <div className="relative">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="border-[#2775EE] border-2 pl-5 h-12 md:text-sm lg:text-base rounded-full bg-[#4a4a4a] text-[#e8e8e8] w-full appearance-none"
            >
                {iconOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {React.createElement(
                    Icons[value as keyof typeof Icons] || Icons.Notebook,
                    { className: "w-5 h-5 text-[#E8E8E8]" }
                )}
            </div>
        </div>
    );
}

export default IconSelect;