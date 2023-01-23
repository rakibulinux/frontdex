import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { isBrowser } from 'helpers';
import Config from 'configs/app';
import { LangType } from 'translations';

export interface GlobalSettingsState {
    applyWindowEnvsTrigger: boolean;
    chartRebuild: boolean;
    color: string;
    isMobileDevice: boolean;
    lang: LangType;
    marketSelectorActive: boolean;
    sideBarActive: boolean;
    depositModalActive: boolean;
    withdrawModalActive: boolean;
    depositAsset?: string;
    withdrawAsset?: string;
}

const currentColorTheme: string = isBrowser() && window.localStorage.getItem('colorTheme') || 'dark';

export const initialGlobalSettingsState: GlobalSettingsState = {
    applyWindowEnvsTrigger: false,
    chartRebuild: false,
    color: currentColorTheme,
    isMobileDevice: false,
    lang: Config.languages[0] as LangType,
    marketSelectorActive: false,
    sideBarActive: false,
    depositModalActive: false,
    withdrawModalActive: false,
    depositAsset: undefined,
    withdrawAsset: undefined,
};

const globalSettingsSlice = createSlice({
    name: 'globalSettings',
    initialState: initialGlobalSettingsState,
    reducers: {
        changeTheme(state, action: PayloadAction<string>) {
            state.color = action.payload;
        },
        toggleChartRebuild(state) {
            state.chartRebuild = !state.chartRebuild;
        },
        toggleMarketSelector(state, action: PayloadAction<boolean>) {
            state.marketSelectorActive = action.payload;
            state.sideBarActive = false;
        },
        toggleMobileDevice(state, action: PayloadAction<boolean>) {
            state.isMobileDevice = action.payload;
        },
        toggleSidebar(state, action: PayloadAction<boolean>) {
            state.sideBarActive = action.payload;
            state.marketSelectorActive = false;
        },
        triggerApplyWindowEnvs(state) {
            state.applyWindowEnvsTrigger = !state.applyWindowEnvsTrigger;
        },
        changeLanguage(state, action: PayloadAction<string>) {
            state.lang = action.payload as LangType;
        },
        toggleDepositModal(state, action: PayloadAction<{isOpen: boolean, asset?: string}>) {
            state.depositModalActive = action.payload.isOpen;
            state.depositAsset = action.payload.asset;
        },
        toggleWithdrawModal(state, action: PayloadAction<{isOpen: boolean, asset?: string}>) {
            state.withdrawModalActive = action.payload.isOpen;
            state.withdrawAsset = action.payload.asset;
        },
    },
});

export const { changeTheme, toggleChartRebuild, toggleMarketSelector, toggleMobileDevice, toggleSidebar, triggerApplyWindowEnvs, toggleDepositModal, toggleWithdrawModal, changeLanguage } = globalSettingsSlice.actions;
export default globalSettingsSlice.reducer;
