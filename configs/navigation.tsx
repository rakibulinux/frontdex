import { SidebarIcons } from 'assets/images/SidebarIcons';
import { BookOpenIcon } from '@heroicons/react/outline'

export const navigationLoggedin = [
    {
        name: 'Trade',
        path: '/trading',
        icon: <SidebarIcons name="trading" className="text-gray-500 flex-shrink-0 h-6 w-6" />,
    },
    {
        name: 'Orders',
        path: '/orders/all',
        icon: <SidebarIcons name="orders" className="text-gray-500 flex-shrink-0 h-6 w-6" />,
        submenus: [
            {
                name: 'All',
                path: '/orders/all'
            },
            {
                name: 'Open',
                path: '/orders/open'
            }
        ]
    },
    {
        name: 'History',
        path: '/history/deposit',
        icon: BookOpenIcon({}),
    },
];

export const navigation = [
    {
        name: 'Trade',
        path: '/trading',
        icon: <SidebarIcons name="trading" className="text-gray-500 flex-shrink-0 h-6 w-6" />,
        submenus: [],
    },
];
