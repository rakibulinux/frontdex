import reducer, {
    changeTheme,
    toggleChartRebuild,
    toggleMarketSelector,
    toggleMobileDevice,
    toggleSidebar,
    triggerApplyWindowEnvs,
    changeLanguage,
    toggleDepositModal,
    toggleWithdrawModal,
    initialGlobalSettingsState,
} from './globalSettings';


// test('should not change state in case of some random action with default balances state', () => {
//     expect(reducer(initialGlobalSettingsState, { type: 'Random action', payload: 10 })).toEqual(initialGlobalSettingsState);
// });

test('should change color value when changeTheme action is dispatched', () => {
    const newColorTheme = 'light';

    expect(reducer(initialGlobalSettingsState, changeTheme(newColorTheme))).toEqual({
        ...initialGlobalSettingsState,
        color: 'light',
    });
});

test('should change chartRebuild value when toggleChartRebuild action is dispatched', () => {
    expect(reducer(initialGlobalSettingsState, toggleChartRebuild())).toEqual({
        ...initialGlobalSettingsState,
        chartRebuild: !initialGlobalSettingsState.chartRebuild,
    });
});

test('should toggle MarketSelector', () => {
    const marketSelectorPayload = true;

    expect(reducer(initialGlobalSettingsState, toggleMarketSelector(marketSelectorPayload))).toEqual({
        ...initialGlobalSettingsState,
        marketSelectorActive: marketSelectorPayload,
        sideBarActive: false,
    });
});

test('should toggle MobileDevice', () => {
    const isMobileDevicePayload = true;

    expect(reducer(initialGlobalSettingsState, toggleMobileDevice(isMobileDevicePayload))).toEqual({
        ...initialGlobalSettingsState,
        isMobileDevice: isMobileDevicePayload,
    });
});

test('should toggle Sidebar', () => {
    const sideBarPayload = true;

    expect(reducer(initialGlobalSettingsState, toggleSidebar(sideBarPayload))).toEqual({
        ...initialGlobalSettingsState,
        sideBarActive: sideBarPayload,
        marketSelectorActive: false,
    });
});

test('should change applyWindowEnvsTrigger value when triggerApplyWindowEnvs action is dispatched', () => {
    expect(reducer(initialGlobalSettingsState, triggerApplyWindowEnvs())).toEqual({
        ...initialGlobalSettingsState,
        applyWindowEnvsTrigger: !initialGlobalSettingsState.applyWindowEnvsTrigger,
    });
});

test('should change Language', () => {
    const langPayload = 'ru';

    expect(reducer(initialGlobalSettingsState, changeLanguage(langPayload))).toEqual({
        ...initialGlobalSettingsState,
        lang: langPayload,
    });
});

test('should toggle DepositModal', () => {
    const payload = {
        isOpen: true,
        asset: 'eth',
    };
    expect(reducer(initialGlobalSettingsState, toggleDepositModal(payload))).toEqual({
        ...initialGlobalSettingsState,
        depositModalActive: payload.isOpen,
        depositAsset: payload.asset,
    });
    expect(reducer(initialGlobalSettingsState, toggleDepositModal({isOpen: false}))).toEqual({
        ...initialGlobalSettingsState,
        depositModalActive: false,
    });
});

test('should toggle toggleWithdrawModal', () => {
    const payload = {
        isOpen: true,
        asset: 'eth',
    };
    expect(reducer(initialGlobalSettingsState, toggleWithdrawModal(payload))).toEqual({
        ...initialGlobalSettingsState,
        withdrawModalActive: payload.isOpen,
        withdrawAsset: payload.asset,
    });
    expect(reducer(initialGlobalSettingsState, toggleDepositModal({isOpen: false}))).toEqual({
        ...initialGlobalSettingsState,
        withdrawModalActive: false,
    });
});

test('should not change globalSettings state in case of some random action', () => {
    const fakePayload = {
        applyWindowEnvsTrigger: true,
        chartRebuild: true,
        isMobileDevice: true,
        sideBarActive: true,
    };
    expect(reducer(initialGlobalSettingsState, { type: 'Random action', payload: fakePayload })).toEqual(initialGlobalSettingsState);
});
