export interface CountryModel {
  countryId: number;
  countryName: string;

  divisionOne: string;
  divisionTwo: string;
  divisionThree: string;

  dialCode: string;      // e.g. "+1"
  isoAlphaTwo: string;   // e.g. "CA"

  active: boolean;
  deleted: boolean;
}

export interface DivisionOneModel {
  divOneId: number;
  divOneName: string;
  divTwoId: number;
  divTwoName: string;
  active: boolean;
  deleted: boolean;
}

export interface DivisionTwoModel {
  divTwoId: number;
  divTwoName: string;
  divOneId: number;
  divOneName: string;
  active: boolean;
  deleted: boolean;
}

export interface DivisionThreeModel {
  divThreeId: number;
  divThreeName: string;
  divTwoId: number;
  divTwoName: string;
  active: boolean;
  deleted: boolean;
}
