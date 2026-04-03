import { FaExchangeAlt, FaHistory, FaWallet } from 'react-icons/fa';

import { dashboardText } from '../text';

export const dashboardSections = [
    {
        to: '/dashboard/wallet',
        ...dashboardText.sections.wallet,
        icon: FaWallet
    },
    {
        to: '/dashboard/transfer',
        ...dashboardText.sections.transfer,
        icon: FaExchangeAlt
    },
    {
        to: '/dashboard/history',
        ...dashboardText.sections.history,
        icon: FaHistory
    }
] as const;
