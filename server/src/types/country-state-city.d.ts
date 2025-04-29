declare module 'country-state-city' {
  export interface ICountry {
    name: string;
    isoCode: string;
    phonecode: string;
    flag: string;
    currency: string;
    latitude: string;
    longitude: string;
    timezones: any[];
  }

  export interface IState {
    name: string;
    isoCode: string;
    countryCode: string;
    latitude: string;
    longitude: string;
  }

  export interface ICity {
    name: string;
    countryCode: string;
    stateCode: string;
    latitude: string;
    longitude: string;
  }

  export const Country: {
    getAllCountries(): ICountry[];
    getCountryByCode(code: string): ICountry;
  };

  export const State: {
    getAllStates(): IState[];
    getStatesOfCountry(countryCode: string): IState[];
    getStateByCodeAndCountry(stateCode: string, countryCode: string): IState;
  };

  export const City: {
    getAllCities(): ICity[];
    getCitiesOfState(countryCode: string, stateCode: string): ICity[];
    getCitiesOfCountry(countryCode: string): ICity[];
  };
} 