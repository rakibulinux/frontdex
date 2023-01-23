import { isBrowser } from "helpers";

const protocolSSL = () => isBrowser(window) && window.location.protocol === 'http:' ? 'ws://' : 'wss://';
const finexHostUrl = (window: { location: { hostname: string; }; }) => isBrowser(window) && window.location.hostname === 'localhost' ? 'ws://localhost:9003' : `${protocolSSL()}${window.location.hostname}`;
const goTrueUrl = (window: { location: { hostname: string; protocol: string; }; }) => isBrowser(window) && window.location.hostname === 'localhost' ? 'http://localhost:9002/auth/v1' : `${window.location.protocol}//${window.location.hostname}/auth/v1`;

export default {
  appName: 'Opendax',
  appVersion: '4.0',
  blockchain: {
    supportedChainIds: [
      1, // Ethereum Mainnet
      3, // Ethereum Testnet Ropsten
      4, // Ethereum Testnet Rinkeby
      5, // Ethereum Testnet Goerli
      42, // Ethereum Testnet Kovan
      56, // Binance Smart Chain Mainnet
      97, // Binance Smart Chain Testnet
      137, // Matic(Polygon) Mainnet
      80001, // Matic Testnet Mumbai
      31337, // Hardhat Local
    ],
  },
  languages: ['en'],
  orderBookSideLimit: 10,
  incrementalOrderBook: true,
  finexUrl: (window: { location: { hostname: string; }; }) => finexHostUrl(window),
  defaultStorageLimit: 50,
  platformChainId: 4, // Ethereum Testnet Rinkeby
  platformCurrency: 'usdt',
  platformCurrencySymbol: '$',
  goTrueURL: (window: { location: { hostname: string; protocol: string; }; }) => goTrueUrl(window),
  goTrueAnon: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTYyNzIwODU0MCwiZXhwIjoxOTc0MzYzNzQwLCJhdWQiOiIiLCJzdWIiOiIiLCJyb2xlIjoiYW5vbiJ9.sUHErUOiKZ3nHQIxy-7jND6B80Uzf9G4NtMLmL6HXPQ',
}
