import React from 'react';
import { ExternalLink } from 'lucide-react';

const STYLES = {
    primary: 'text-white bg-uece-green shadow-md hover:bg-green-800 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0',
    secondary: 'text-uece-green bg-white border-2 border-uece-green hover:bg-green-50 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0',
    disabled: 'text-gray-400 bg-gray-50 border-2 border-gray-300 cursor-not-allowed'
};

// Link of the header that opens outside the site. Without an address it is shown, but cannot be clicked.
const ActionButton = ({ action }) => {
    const className = `w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all ${STYLES[action.kind]}`;

    return (
        <div className="flex flex-col gap-1">
            {action.href ? (
                <a href={action.href} target="_blank" rel="noopener noreferrer" className={`group/button ${className}`}>
                    {action.label}
                    <ExternalLink className="w-4 h-4 shrink-0 transition-transform group-hover/button:translate-x-0.5 group-hover/button:-translate-y-0.5" />
                </a>
            ) : (
                <button type="button" disabled className={className}>
                    {action.label}
                    <ExternalLink className="w-4 h-4 shrink-0" />
                </button>
            )}
            {action.caption && <span className="text-xs text-center font-medium text-gray-500">{action.caption}</span>}
        </div>
    );
};

export default ActionButton;
