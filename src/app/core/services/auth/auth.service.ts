import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  role = "coordinator";
  serviceOwner = "service-1";

  roleChangeSubject: Subject<string> = new Subject<string>();
  serviceOwnerChangeSubject: Subject<string> = new Subject<string>();

  constructor() { }

  setRole(role: string) {
    this.roleChangeSubject.next(role);
    this.role = role;
  }

  setServiceOwner(serviceOwner: string) {
    this.serviceOwnerChangeSubject.next(serviceOwner);
    this.serviceOwner = serviceOwner;
  }
}
