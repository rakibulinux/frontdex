import { useAppDispatch } from 'app/hooks';
import { SidebarIcons } from 'assets/images/SidebarIcons';
import classnames from 'classnames';
import { toggleDepositModal } from 'features/globalSettings/globalSettings';
import * as React from 'react';
import { useIntl } from 'react-intl';

type DepositButtonProps = {
    collapseLeftBar: boolean;
}

export const DepositButton: React.FC<DepositButtonProps> = ({
    collapseLeftBar,
}: DepositButtonProps) => {
    const dispatch = useAppDispatch();
    const intl = useIntl();

    const translate = React.useCallback((id: string) => intl.formatMessage({ id }), []);

    const depositButton = React.useMemo(() => {
      return collapseLeftBar ? (
        <div
            className="hover:bg-gray-50 hover:text-gray-900 cursor-pointer"
            onClick={() => dispatch(toggleDepositModal({ isOpen: true }))}
        >
            <SidebarIcons
                name="deposit"
                className="text-gray-500 flex-shrink-0 h-6 w-6"
            />
        </div>
      ) : (
        <div
            className={classnames([
                'flex items-center justify-center border border-gray-300 hover:bg-gray-50 text-sm text-cta-contrast py-2 px-4 rounded cursor-pointer',
                collapseLeftBar ? '' : 'w-1/2',
            ])}
            onClick={() => dispatch(toggleDepositModal({ isOpen: true }))}
        >
          {translate('page.body.deposit.button.deposit')}
        </div>
      )
    }, [collapseLeftBar])

    return (
      <React.Fragment>
        {depositButton}
      </React.Fragment>
    )
};
