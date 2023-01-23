import { DropdownItem } from "@openware/react-opendax/build";

export const translateOrderType = (orderType: DropdownItem) => {
    switch (orderType.name) {
        case 'Limit':
            return 'l';
        case 'Market':
            return 'm';
        // TODO: add advaced order types
        default:
            return '';
    }
}
