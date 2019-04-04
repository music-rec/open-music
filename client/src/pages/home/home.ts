import { Component } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';
import { ApiProvider } from '../../providers/api/api';
//import { TrackDetailsPage } from '../../pages/track-details/track-details';
import * as io from 'socket.io-client';
import * as _ from 'lodash';
import { NgZone } from '@angular/core';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  providers: [ApiProvider]

})
export class HomePage {
  socket: any;

  public resultNumber: any = [];
  public searchResultsItunes: any = [];
  public searchResultsYoutube: any = [];
  public searchBarValue: string;
  public showSpinner: boolean;
  public loading: any;
  public downloadStatus: any = [];


  constructor(public ngZone: NgZone, public navCtrl: NavController, public api: ApiProvider, public loadingCtrl: LoadingController) {
    this.socket = io("https://murmuring-plains-85338.herokuapp.com"); //{ transports: ['websocket'] }
    console.log('TESDTEEE');
    this.socket.on('msg', (data) => {
      console.log(data)
    });
    this.socket.on('ops', (data) => {
      console.log(data)
    });
    this.socket.on('downloadUpdate', (data) => {
      this.dismissLoading();
      this.showLoading(data.msg)
      console.log(data);
    });
    this.socket.on('done', (data) => {
      this.dismissLoading();
      //this.notify("Download done for " + data.trackName, data.trackName + " by " + data.artistName + "was downloaded.", data.url, data.image)

      console.log(data)
      window.location.href = data.url;
      //window.open(data.url, '_blank');
    });
    this.socket.on('success', (data) => {
      console.log(data)
    });

  }
  /**
   *    
   */
  /*
  notify(title, body, link, imgURL) {
    return Notification.requestPermission(function(result) {
      if (result === 'granted') {
        let noti = navigator.serviceWorker.ready.then(function(registration) {
          registration.showNotification(title, {
            body: body,
            requireInteraction: true,
            tag: 'vibration-sample',
            data: { link: link },
            icon: "/assets/imgs/icons/icon-192x192.png"

          });
        });
      }
      else {
        console.error("[VueSW] Maybe you dont declared the init method on your Vue S")
      }
    });

  }
*/
  goToTrack(id) {

    return this.navCtrl.push('TrackDetailsPage', {
      'itunesID': id
    });
  }

  downloadTrackiTunes(type: any, id: any) {
    /**
     * type 1 = iTunes
     * type 2 = Youtube
     */

    this.socket.emit('dl1', { bitRate: '128k', type: type, id: id });
    this.showLoading("Downloading track...");

  }
  downloadTrackYT(type, id) {
    /**
     * type 1 = iTunes
     * type 2 = Youtube
     */
    this.socket.emit('dl2', { bitRate: '128k', type: type, id: id });
  }

  loadProgress(id) {
    var percent = _.filter(this.downloadStatus, { 'id': id });

    return percent.percent;

  }


  search(e: any) {
    if (e.target.value.startsWith(":")) {
      return this.youtubeSearch(e.target.value.replace(":", ""));
    }
    else {
      return this.itunesSearch(e.target.value)
    }
  }
  itunesSearch(value) {
    console.log(value);

    this.api.search(value).then(data => {
      this.resultNumber = data;
      this.searchResultsItunes = data;
      this.showSpinner = true;

      console.log(this.searchResultsItunes)

    }).catch((err) => {
      console.log("erro:", err);
      return `Erro ao carregar detalhes do território: ${err}`;
    });

  }

  youtubeSearch(value) {
    console.log("youtube searching...");
    console.log(value);

    this.api.searchYotube(value).then(data => {
      this.resultNumber = data;
      this.searchResultsYoutube = data;
      this.showSpinner = true;

      console.log(this.searchResultsYoutube)

    }).catch((err) => {
      console.log("erro:", err);
      return `Erro ao carregar detalhes do território: ${err}`;
    })

  }

  clearSearch() {
    this.searchResultsYoutube = [];
    this.searchResultsItunes = [];

  }
  showLoading(msg) {
    if (!this.loading) {
      this.loading = this.loadingCtrl.create({
        content: msg
      });
      this.loading.present();
    }
  }

  dismissLoading() {
    if (this.loading) {
      this.loading.dismiss();
      this.loading = null;
    }
  }

}
