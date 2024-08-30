import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { IPrivacyData } from '../../models/interfaces/privacy-data';
import { IServiceMapping } from '@app/core/models/interfaces/service-mapping';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  serviceMapping: IServiceMapping[] = [];

  private _data: IPrivacyData[] = [];
  constructor(private http: HttpClient) { }

  getStates(): { value: string, label: string }[] {
    return [
      { value: "CA", label: "California" },
      { value: "CO", label: "Colarado" },
      { value: "CT", label: "Connecticut" },
      { value: "FL", label: "Florida" },
      { value: "MO", label: "Montana" },
      { value: "NE", label: "Nevada" },
    ];
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
      tap(data => this._data = data)
    );
  }
}

