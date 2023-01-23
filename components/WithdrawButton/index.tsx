import { useAppDispatch } from 'app/hooks';
import { SidebarIcons } from 'assets/images/SidebarIcons';
import classnames from 'classnames';
import { toggleWithdrawModal } from 'features/globalSettings/globalSettings';
import * as React from 'react';
import { useIntl } from 'react-intl';

type WithdrawButtonProps = {
    collapseLeftBar: boolean;
}

export const WithdrawButton: React.FC<WithdrawButtonProps> = ({
    collapseLeftBar,
}: WithdrawButtonProps) => {
    const dispatch = useAppDispatch();
    const intl = useIntl();

    const translate = React.useCallback((id: string) => intl.formatMessage({ id }), []);

    const withdrawButton = React.useMemo(() => {
      return collapseLeftBar ? (
        <div
            className="hover:bg-gray-50 hover:text-gray-900 cursor-pointer"
            onClick={() => dispatch(toggleWithdrawModal({ isOpen: true }))}
        >
            <SidebarIcons
                name="withdraw"
                className="text-gray-500 flex-shrink-0 h-6 w-6"
            />
        </div>
      ) : (
        <div
            className={classnames([
                'flex items-center justify-center bg-primary-cta-color-main hover:bg-primary-cta-color-hover text-sm text-color-contrast py-2 px-4 rounded cursor-pointer',
                collapseLeftBar ? '' : 'w-1/2 ml-1',
            ])}
            onClick={() => dispatch(toggleWithdrawModal({ isOpen: true }))}
        >
          {translate('page.body.withdraw.button.withdraw')}
        </div>
      )
    }, [collapseLeftBar])

    return (
      <React.Fragment>
        {withdrawButton}
      </React.Fragment>
    )
};
