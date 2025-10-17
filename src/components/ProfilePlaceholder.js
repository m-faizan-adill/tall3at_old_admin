import React from 'react';

const getInitials = (name) => {
    if (!name) return 'U';
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

const getColorFromName = (name) => {
    const colors = [
        { bg: 'bg-purple-100', text: 'text-purple-600' },
        { bg: 'bg-blue-100', text: 'text-blue-600' },
        { bg: 'bg-green-100', text: 'text-green-600' },
        { bg: 'bg-red-100', text: 'text-red-600' },
        { bg: 'bg-yellow-100', text: 'text-yellow-600' },
        { bg: 'bg-indigo-100', text: 'text-indigo-600' },
    ];
    
    if (!name) return colors[0];
    
    // Generate a consistent index based on the name
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
};

const ProfilePlaceholder = ({ name, size = 'md', className = '' }) => {
    const initials = getInitials(name);
    const { bg, text } = getColorFromName(name);
    
    const sizeClasses = {
        sm: 'w-8 h-8 text-sm',
        md: 'w-10 h-10 text-base',
        lg: 'w-12 h-12 text-lg',
        xl: 'w-16 h-16 text-xl'
    };

    return (
        <div 
            className={`${sizeClasses[size]} ${bg} ${text} rounded-full flex items-center justify-center font-medium ${className}`}
            title={name || 'User'}
        >
            {initials}
        </div>
    );
};

export default ProfilePlaceholder;
