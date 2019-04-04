import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
/*
  Generated class for the ApiProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ApiProvider {

  //private apiDetails = "https://openmusic-novo-matheuschimelli.c9users.io/api/v1/track/details/";
  //private apiSearchYotube = "https://openmusic-novo-matheuschimelli.c9users.io/api/v1/track/yt/";
  //private apiSearch = "https://openmusic-novo-matheuschimelli.c9users.io/api/v1/track/search/";
  
  private apiDetails = "/api/v1/track/details/";
  private apiSearchYotube = "/api/v1/track/yt/";
  private apiSearch = "/api/v1/track/search/";
  constructor(public http: HttpClient) {
    console.log('Hello ApiProvider Provider');
  }
  search(term: string) {
    return new Promise((resolve, reject) => {
      this.http.get(this.apiSearch + term)
        .subscribe(res => {
          resolve(res);
        }, (err) => {
          reject(err);
        });
    });
  }
  searchYotube(term: string) {
    return new Promise((resolve, reject) => {
      this.http.get(this.apiSearchYotube + term)
        .subscribe(res => {
          resolve(res);
        }, (err) => {
          reject(err);
        });
    });
  }


}
