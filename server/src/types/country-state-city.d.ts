declare module 'country-state-city' {
  export interface ICountry {
    id: string;
    name: string;
    phonecode: string;
    sortname: string;
  }

  export interface IState {
    id: string;
    name: string;
    country_id: string;
  }

  export interface ICity {
    id: string;
    name: string;
    state_id: string;
  }

  export function getAllCountries(): ICountry[];
  export function getStatesOfCountry(countryId: string): IState[];
  export function getCitiesOfState(stateId: string): ICity[];
} 