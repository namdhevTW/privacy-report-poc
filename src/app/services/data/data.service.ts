import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private http: HttpClient) { }

  getStates() {
    return [
      { value: "CA", label: "California" },
      { value: "CO", label: "Colarado" },
      { value: "CT", label: "Connecticut" },
      { value: "FL", label: "Florida" },
      { value: "MO", label: "Montana" },
      { value: "NE", label: "Nevada" },
    ];
  }

  getServices() {
    return [
      { value: "service-1", label: "Service 1" },
      { value: "service-2", label: "Service 2" },
      { value: "service-3", label: "Service 3" },
      { value: "service-4", label: "Service 4" },
      { value: "service-5", label: "Service 5" },
    ];
  }

  // getPrivacyData(): IPrivacyData[] {


  // }

  getPrivacyData(): Observable<IPrivacyData[]> {
    return this.http.get<IPrivacyData[]>('/assets/data/privacy-data.json');
  }
}

export interface IPrivacyData {
  state:string
  slaDays:string
  requestId:string
  requestType:string
  currentStage:string
  serviceOwner:string
  requestCreatedDate:string
}
