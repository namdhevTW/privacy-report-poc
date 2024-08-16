import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { IPrivacyData } from '../../models/interfaces/privacy-data';

@Injectable({
  providedIn: 'root'
})
export class DataService {

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

  getServices(): { value: string, label: string }[] {
    return [
      { value: "service-1", label: "Service 1" },
      { value: "service-2", label: "Service 2" },
      { value: "service-3", label: "Service 3" },
      { value: "service-4", label: "Service 4" },
      { value: "service-5", label: "Service 5" },
    ];
  }

  getRequestTypes(): string[] {
    // return only unique request types from the data
    return this._data.map(data => data.requestType).filter((value, index, self) => self.indexOf(value) === index);
  }

  getPrivacyData(): Observable<IPrivacyData[]> {
    return this.http.get<IPrivacyData[]>('/assets/data/privacy-data.json').pipe(
      tap(data => this._data = data)
    );
  }
}

