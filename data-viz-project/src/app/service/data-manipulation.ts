import { Injectable } from '@angular/core';
import { HappinessRecord } from '../common/records';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class DataManipulation {
  public happinessRecords: HappinessRecord[] = [];

  constructor(private http: HttpClient) {
    this.http.get('WHR26.csv', { responseType: 'text' }).subscribe(
      data => {
        const csvRows: string[] = data.split('\n')
        for (let i=1; i < csvRows.length; i++) {
          const elements = csvRows[i].split(',');
          const happinessRecord: HappinessRecord = {
            year: parseInt(elements[0], 10),
            rank: parseInt(elements[1], 10),
            country: elements[2],
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
          }
          this.happinessRecords.push(happinessRecord);
        }
      }
    )
  }
}
