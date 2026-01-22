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
