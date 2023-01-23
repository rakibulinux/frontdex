import moment from 'moment-timezone';
import { getTimezone } from './getTimezone';

export const localeDate = (date: any, format: string, timezone = getTimezone()) => {
    const getFormat = (type: string) => {
        return {
            fullDate: 'DD-MM-YYYY HH:mm:ss',
            shortDate: 'DD-MM-YYYY HH:mm',
            time: 'HH:mm:ss',
            date: 'DD-MM-YYYY',
          }[type];
    };
    const formatDisplay = getFormat(format);
    const isUnix = typeof date === 'number';

    const momentObj = isUnix ? moment.unix(date) : moment(date);

    return momentObj.tz(timezone).format(formatDisplay);
};
