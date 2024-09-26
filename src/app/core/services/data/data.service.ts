import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, tap } from 'rxjs';
import { IPrivacyData } from '../../models/interfaces/privacy-data';
import { IServiceMapping } from '@app/core/models/interfaces/service-mapping';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  serviceMapping: IServiceMapping[] = [];

  private _data: IPrivacyData[] = [];
  constructor(private http: HttpClient) { }

  getStates(): string[] {
    return this._data.map(data => data.state).filter((value, index, self) => self.indexOf(value) === index).sort((a, b) => a.localeCompare(b));
  }

  getServices(): Observable<IServiceMapping[]> {
    return this.http.get<IServiceMapping[]>('assets/data/service-mapping.json').pipe(
      tap(data => this.serviceMapping = data)
    );
  }

  getRequestTypes(): string[] {
    // return only unique request types from the data
    return this._data.map(data => data.requestType).filter((value, index, self) => self.indexOf(value) === index);
  }

  getPrivacyData(): Observable<IPrivacyData[]> {
    return this.http.get<IPrivacyData[]>('assets/data/privacy-data.json').pipe(
      tap(data => this._data = data),
      map((data: IPrivacyData[]) => data.map(d => {
        return {
          ...d,
          // set SLA days left as the difference between the current date and the subtask created date
          slaDaysLeft: Math.ceil((new Date(d.subtaskCreatedDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)).toString()
        };
      })));
  }
}

