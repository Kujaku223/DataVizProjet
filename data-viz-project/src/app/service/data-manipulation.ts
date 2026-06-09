import { Injectable } from '@angular/core';
import { HappinessRecord } from '../common/records';
import { HttpClient } from '@angular/common/http';
import {
  BOTTOM_10_COLOR,
  BOTTOM_10_COUNTRIES_2025,
  CANADA_COLOR,
  COUNTRIES_CONTINENT, OTHER_COLOR,
  TOP_10_COLOR,
  TOP_10_COUNTRIES_2025
} from '../common/constants';
import clm from 'country-locale-map';

@Injectable({
  providedIn: 'root',
})
export class DataManipulation {
  public happinessRecords: HappinessRecord[] = [];

  constructor(private http: HttpClient) {
    this.http.get('WHR26.csv', { responseType: 'text' }).subscribe((data) => {
      const csvRows: string[] = data.split('\n');
      for (let i = 1; i < csvRows.length; i++) {
        const elements = csvRows[i].split(',');
        const country = clm.getCountryByName(elements[2]);

        const happinessRecord: HappinessRecord = {
          year: parseInt(elements[0], 10),
          rank: parseInt(elements[1], 10),
          country: elements[2],
          continent:
            country && country.continent ? country.continent : COUNTRIES_CONTINENT[elements[2]],
          lifeEvaluation: parseFloat(elements[3]),
          lowerWhisker: parseFloat(elements[4]),
          upperWhisker: parseFloat(elements[5]),
          GDP: parseFloat(elements[6]),
          socialSupport: parseFloat(elements[7]),
          lifeExpectancy: parseFloat(elements[8]),
          freedom: parseFloat(elements[9]),
          generosity: parseFloat(elements[10]),
          corruptionPerception: parseFloat(elements[11]),
          dystopia: parseFloat(elements[12]),
        };
        this.happinessRecords.push(happinessRecord);
      }
    });
  }

  filterYear(year: number) {
    /**
     * Returns the happinessRecords filtered for a specific year
     *
     * @param year - Year to keep in the records
     * @returns Filtered copy of happinessRecords
     */
    return this.happinessRecords.filter((d) => d.year == year);
  }

  filterYears(start: number, end?: number) {
    /**
     * Returns the happinessRecords filtered between [start, end[ or [start, ]
     *
     * @param start - Included start year of the interval
     * @param end - Excluded end year of the interval, if specified
     * @returns Filtered copy of happinessRecords
     */
    return end
      ? this.happinessRecords.filter((d) => d.year >= start && d.year < end)
      : this.happinessRecords.filter((d) => d.year >= start);
  }

  getExtremum10(year: number, isTop10: Boolean) {
    const sortedData = this.filterYear(year).sort(
      (countryA, countryB) => countryA.lifeEvaluation - countryB.lifeEvaluation,
    );
    return isTop10 ? sortedData.slice(-10) : sortedData.slice(0, 10);
  }

  getNormalizedValues(data: HappinessRecord[], attribute: keyof HappinessRecord) {
    // TODO
  }

  getAverageValue(data: HappinessRecord[], attribute: keyof HappinessRecord) {
    // REFERENCE: https://stackoverflow.com/questions/29544371/finding-the-average-of-an-array-using-js
    return (
      data.reduce((acc, country: HappinessRecord) => acc + Number(country[attribute]), 0) /
      data.length
    );
  }

  getExtremum10Stats(year: number, isTop10: Boolean) {
    const extremum10 = this.getExtremum10(year, isTop10);
    console.log(extremum10);

    // TODO: getNormalizedValues

    const averages = [
      this.getAverageValue(extremum10, 'GDP'),
      this.getAverageValue(extremum10, 'socialSupport'),
      this.getAverageValue(extremum10, 'freedom'),
      this.getAverageValue(extremum10, 'lifeExpectancy'),
      this.getAverageValue(extremum10, 'corruptionPerception'),
    ];

    return averages;
  }

  getColorFromCountryName(countryName: string): string{
    if (countryName == 'Canada')
      return CANADA_COLOR;
    else if (TOP_10_COUNTRIES_2025.includes(countryName))
      return TOP_10_COLOR;
    else if (BOTTOM_10_COUNTRIES_2025.includes(countryName))
      return BOTTOM_10_COLOR;

    return OTHER_COLOR
  }
}
