// Icons of the approved prototype (stroke icons, 24px grid). All are decorative: the text next to them names the action.
import React from 'react';

const Svg = ({ size = 16, width = 2, children, className }) => (
    <svg
        className={className}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
    >
        {children}
    </svg>
);

export const ArrowRight = (props) => <Svg {...props}><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></Svg>;
export const ArrowLeft = (props) => <Svg {...props}><path d="M19 12H5" /><path d="m11 18-6-6 6-6" /></Svg>;
export const ArrowUpRight = (props) => <Svg width={2.2} {...props}><path d="M7 17 17 7" /><path d="M8 7h9v9" /></Svg>;
export const ArrowUp = (props) => <Svg size={20} width={2.2} {...props}><path d="M12 19V5" /><path d="m6 11 6-6 6 6" /></Svg>;
export const Download = (props) => <Svg {...props}><path d="M12 4v11" /><path d="m7 10 5 5 5-5" /><path d="M5 20h14" /></Svg>;
export const ChevronLeft = (props) => <Svg size={18} {...props}><path d="m15 18-6-6 6-6" /></Svg>;
export const ChevronRight = (props) => <Svg size={18} {...props}><path d="m9 18 6-6-6-6" /></Svg>;
export const ChevronDown = (props) => <Svg {...props}><path d="m6 9 6 6 6-6" /></Svg>;
export const Search = (props) => <Svg size={18} {...props}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Svg>;
export const Person = (props) => <Svg size={14} {...props}><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></Svg>;
export const Calendar = (props) => <Svg size={14} {...props}><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M3 10h18M8 3v4M16 3v4" /></Svg>;
export const Archive = (props) => <Svg size={20} {...props}><rect x="3" y="4" width="18" height="5" rx="1.5" /><path d="M5 9v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9" /><path d="M10 13h4" /></Svg>;
export const Warning = (props) => <Svg size={18} {...props}><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4M12 17h.01" /></Svg>;
export const Check = (props) => <Svg size={10} width={3.5} {...props}><path d="m5 12 5 5 9-10" /></Svg>;
export const Close = (props) => <Svg size={18} width={2.2} {...props}><path d="M6 6l12 12M18 6 6 18" /></Svg>;
