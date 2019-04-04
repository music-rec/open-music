/**
 * Module dependencies.
 */
const express = require('express');
const compression = require('compression');
const session = require('express-session');
const bodyParser = require('body-parser');
const logger = require('morgan');
const chalk = require('chalk');
const errorHandler = require('errorhandler');
//const lusca = require('lusca');
const dotenv = require('dotenv');
const MongoStore = require('connect-mongo')(session);
const flash = require('express-flash');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const expressValidator = require('express-validator');
const expressStatusMonitor = require('express-status-monitor');
const sass = require('node-sass-middleware');
const multer = require('multer');

const upload = multer({ dest: path.join(__dirname, 'uploads') });

/**
 * SOCKET.IO DOWNLOAD REQUIRES
 */
const remove = require('remove');
const fs = require('fs');
const URL = require('url-parse');
const mkdirp = require('mkdirp');
const shortid = require('shortid');
const ytdl = require('youtube-dl');
const pretty = require('prettysize');
const ffmpeg = require('fluent-ffmpeg');
const request = require("request");

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.load({ path: '.env.example' });

/**
 * Controllers (route handlers).
 */
const homeController = require('./controllers/home');
//const userController = require('./controllers/user');
const apiController = require('./controllers/api');
//const contactController = require('./controllers/contact');

/**
 * API keys and Passport configuration.
 */
//const passportConfig = require('./config/passport');

/**
 * Create Express server.
 */
const app = express();
const server = require('http').Server(app);
const io = require('socket.io').listen(server);

/*
io.origins('*:*');
*/

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

/**
 * Connect to MongoDB.
 
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useNewUrlParser', true);
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on('error', (err) => {
  console.error(err);
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
  process.exit();
});
*/

/**
 * Express configuration.
 */
app.set('host', process.env.IP || '0.0.0.0');
app.set('port', process.env.PORT || 8080);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
//app.use(expressStatusMonitor());
app.use(compression());
app.use(sass({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public')
}));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
/*
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
  cookie: { maxAge: 1209600000 }, // two weeks in milliseconds
  store: new MongoStore({
    url: process.env.MONGODB_URI,
    autoReconnect: true,
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
*/
/*
app.use((req, res, next) => {
  if (req.path === '/api/upload') {
    next();
  }
  else {
    lusca.csrf()(req, res, next);
  }
});
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
*/
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
/*
app.use((req, res, next) => {
  // After successful login, redirect back to the intended page
  if (!req.user &&
    req.path !== '/login' &&
    req.path !== '/signup' &&
    !req.path.match(/^\/auth/) &&
    !req.path.match(/\./)) {
    req.session.returnTo = req.originalUrl;
  }
  else if (req.user &&
    (req.path === '/account' || req.path.match(/^\/api/))) {
    req.session.returnTo = req.originalUrl;
  }
  next();
});
*/
var DIST_DIR = path.join(__dirname, "www");
//app.use(express.static(DIST_DIR));
app.use('/', express.static(path.join(__dirname, 'www')))
//app.use('/', express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));
//app.use('/js/lib', express.static(path.join(__dirname, 'node_modules/popper.js/dist/umd'), { maxAge: 31557600000 }));
//app.use('/js/lib', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js'), { maxAge: 31557600000 }));
//app.use('/js/lib', express.static(path.join(__dirname, 'node_modules/jquery/dist'), { maxAge: 31557600000 }));
//app.use('/webfonts', express.static(path.join(__dirname, 'node_modules/@fortawesome/fontawesome-free/webfonts'), { maxAge: 31557600000 }));

/**
 * Primary app routes.
 */
//app.get('/', homeController.index);
/*
app.get('/login', userController.getLogin);
app.post('/login', userController.postLogin);
app.get('/logout', userController.logout);
app.get('/forgot', userController.getForgot);
app.post('/forgot', userController.postForgot);
app.get('/reset/:token', userController.getReset);
app.post('/reset/:token', userController.postReset);
app.get('/signup', userController.getSignup);
app.post('/signup', userController.postSignup);
app.get('/contact', contactController.getContact);
app.post('/contact', contactController.postContact);
app.get('/account', passportConfig.isAuthenticated, userController.getAccount);
app.post('/account/profile', passportConfig.isAuthenticated, userController.postUpdateProfile);
app.post('/account/password', passportConfig.isAuthenticated, userController.postUpdatePassword);
app.post('/account/delete', passportConfig.isAuthenticated, userController.postDeleteAccount);
app.get('/account/unlink/:provider', passportConfig.isAuthenticated, userController.getOauthUnlink);
*/
/**
 * API examples routes.
 
app.get('/api', apiController.getApi);
app.get('/api/paypal', apiController.getPayPal);
app.get('/api/paypal/success', apiController.getPayPalSuccess);
app.get('/api/paypal/cancel', apiController.getPayPalCancel);
app.get('/api/upload', apiController.getFileUpload);
app.post('/api/upload', upload.single('myFile'), apiController.postFileUpload);
*/

app.get('/api/v1/track/yt/:query', apiController.yt);
app.get('/api/v1/track/details/:trackName', apiController.trackDetails);
app.get('/api/v1/track/search/:trackName', apiController.search);
app.get('/api/v1/track/download/yt/:videoTitle/:sessionID', apiController.downloadyt);
app.get('/api/v1/track/download/i/:trackName/:sessionID', apiController.downloadI);

/**
 * OAuth authentication routes. (Sign in)
 
app.get('/auth/instagram', passport.authenticate('instagram'));
app.get('/auth/instagram/callback', passport.authenticate('instagram', { failureRedirect: '/login' }), (req, res) => {
  res.redirect(req.session.returnTo || '/');
});
app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email', 'public_profile'] }));
app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), (req, res) => {
  res.redirect(req.session.returnTo || '/');
});
app.get('/auth/github', passport.authenticate('github'));
app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), (req, res) => {
  res.redirect(req.session.returnTo || '/');
});
app.get('/auth/google', passport.authenticate('google', { scope: 'profile email' }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
  res.redirect(req.session.returnTo || '/');
});
app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/login' }), (req, res) => {
  res.redirect(req.session.returnTo || '/');
});
*/



/**
 * Error Handler.
 */
if (process.env.NODE_ENV === 'development') {
  // only use in development
  app.use(errorHandler());
}
else {
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Server Error');
  });
}


io.on('connection', function(socket) {
  socket.emit("msg", { msg: "OpenMusic" })
  socket.on('dl1', function(data) {
    console.log(data)
    if (data.type == "" || !data.id) {
      console.log("Missing data")
      return socket.emit("ops", { msg: "Missing data", error: true });
    }
    var loadingID = data.id;

    /**
     * There are two possibles data.types
     * 1 = iTunes id
     * 2 = Youtube id
     */



    console.log(chalk.bold.rgb(10, 100, 200)('An Download was started'));

    socket.emit("downloadUpdate", { msg: "Downloading", id: loadingID, percent: 10 });

    socket.on('end', function(err) {
      console.log("User connection was closed.");
      socket.emit("downloadUpdate", { msg: "Unknow server error", id: loadingID, percent: 0 });


    });
    socket.on('end', function(err) {
      remove(__dirname + '/downloads/' + sessionId, function(err) {
        if (err) console.error(err);
        else console.log(sessionId + 'Deleted!');
      });
    });

    let settings = {
      audioBitrate: '128k',
      audioCustomBitRate: data.bitRate,
      debug: true
    };

    let input = {
      trackId: data.id,
      lyric: "",
      youtubeURL: "",
    };

    console.log(input);
    if (input.trackId == "" || input.trackId == undefined || input.trackId == null) {
      return socket.emit("info", { msg: "Probably the trackId is null or undefined or is not readable from server. Please check it.", percent: 0 });

    }

    let processStatus = {
      inputData: false,
      imgAlbumDownloaded: false,
      iTunesAPIaccess: false,
      openmusicAPIaccess: false,
      youtubeVideoDownloaded: false,
      ffmpegConversion: false
    };

    let jsonAPI;
    let trackInfo;
    let strToSearch;
    let youtubeId;

    let localVideo
    let mp4Video;
    let mp3ToMetadata;
    let mp3Final;


    // Generate a folder with a random short id
    const sessionId = shortid.generate();
    mkdirp(__dirname + '/downloads/' + sessionId, function(err) {
      if (err) console.error(err)
      else console.log('Folder created');
    });





    const iTunesId = "http://itunes.apple.com/lookup?id=" + input.trackId; //1032913975
    const openMusicAPI = "http://open-music.herokuapp.com/api/search/";

    // Check if is a valid youtube id or if input is not blank 
    if (input.trackId == " ") {
      return socket.emit('error', { msg: 'Invalid data or it is blank' });
    }

    if (input.youtubeURL != '') {
      console.log("Custom youtube url");
      console.log(input.youtubeURL);

      if (input.youtubeURL.indexOf('youtu.be') == -1) {
        return socket.emit('error', { msg: 'It is not a youtube url' });
      }
    }

    // ruc - Replace stranger characters from a string
    const ruc = function replaceUnknownCharacters(string) {
      return string.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');

    };
    const rucws = function replaceUnknownCharactersWithoutSpace(string) {
      return string.replace(/[&\/\\#,+()$~%.'":*?<>{}/ /]/g, '');

    };


    const download = function(uri, filename, callback) {
      request.head(uri, function(err, res, body) {
        if (err) throw err

        let localImgCover = path.join(__dirname + "/downloads/" + sessionId, String(filename))

        request(uri).pipe(fs.createWriteStream(localImgCover)).on('close', callback)
      })
    };

    const ffmpegConvert = function convertVideoUsingFFMPEG() {
      socket.emit("downloadUpdate", { msg: "Converting", id: loadingID, percent: 60 });

      console.log("Converting video in a audio file...");
      console.log(settings.audioBitrate);

      ffmpeg(localVideo)
        .output(mp3ToMetadata)
        .audioBitrate(settings.audioBitrate)
        .on('progress', function(progress) {
          socket.emit("downloadUpdate", { msg: "Converting", id: loadingID, percent: 60 + progress.percent / 4 });

          console.log('Processing: ' + progress.percent + '% done');
        })

        .on('error', function(e) {
          console.log(e)
        })
        .on('end', function() {
          socket.emit("downloadUpdate", { msg: "Adding metadata", id: loadingID, percent: 98 });

          console.log(chalk.green("Video convertted to MP3"));
          var resultHandler = function(err) {
            if (err) {
              console.log("unable to delete video file", err);
            }
            else {
              console.log("file deleted");
            }
          }

          console.log("about to call unlink");
          fs.unlink(mp4Video, resultHandler);
          console.log(chalk.green('✓ MP4 Video Deleted'));

          /**
           * add metadata tags and album art cover
           *
           */
          ffmpeg(mp3ToMetadata)
            .output(mp3Final)

            .outputOptions(
              "-i",
              __dirname + "/downloads/" + sessionId + '/' + rucws(trackInfo.trackRemix) + ".png",
              "-map", "0:0",
              "-map", "1:0",
              "-c", "copy",
              "-id3v2_version", "3",
              "-metadata", "artist=" + trackInfo.artistName + "",
              "-metadata", "title=" + trackInfo.trackRemix + "",
              "-metadata", "album=" + trackInfo.albumName + "",
              "-metadata", "composer=" + trackInfo.artistName + "", //TODO
              "-metadata", "comment=Open Music", //TODO
              "-metadata", "genre=" + trackInfo.trackGenre + "",
              "-metadata", "track=" + trackInfo.trackNumber + "", //TODO
              "-metadata", "date=" + trackInfo.trackDate + ""



            )
            .on('error', function(e) {
              console.log(chalk.red("Error" + e));
              return socket.emit('error', { msg: 'An unknown error was happened', errorMSG: e });


            })
            .on('end', function() {
              console.log(chalk.green('✓') + 'Done adding metadata');
              console.log(chalk.green('✓') + 'Generating download link');
              console.log("/api/track/download/" + rucws(trackInfo.trackRemix) + "/" + sessionId);

              socket.emit("downloadUpdate", { msg: "Finished", id: loadingID, percent: 100 });

              socket.emit("done", { msg: "Done!", url: "/api/v1/track/download/i/" + rucws(trackInfo.trackRemix) + "/" + sessionId, trackName: trackInfo.trackRemix, artist: trackInfo.artistName, image: trackInfo.artworkUrl100 })

              return socket.emit('success', { msg: 'Track is done' });

            }).run()
        }).run()

    }

    const downloadVideo = function downloadVideoFromYouTube() {

      let youtubeDownloadUrl = 'http://www.youtube.com/watch?v=' + youtubeId;
      if (input.youtubeURL != "") {
        youtubeDownloadUrl = input.youtubeURL
      }

      const video = ytdl(youtubeDownloadUrl.toString(), ['--format=18']);
      socket.emit("downloadUpdate", { msg: "Downloading video from youtube", id: loadingID, percent: 25 });


      let size = 0;

      video.on('info', function(info) {
        console.log(chalk.yellow(info.filename));
        console.log(chalk.yellow(pretty(info.size)));

        // download video in sessionId folder
        localVideo = path.join(__dirname + '/downloads/' + sessionId, rucws(trackInfo.trackRemix) + '.mp4');
        video.pipe(fs.createWriteStream(localVideo));

      });

      video.on('end', function() {
        processStatus.youtubeVideoDownloaded = true;

        console.log("video endedd;...");

        mp4Video = path.join(__dirname + '/downloads/' + sessionId, rucws(trackInfo.trackRemix) + '.mp4');
        // ffmpeg uses mp3ToMetadata to save file in this same local
        mp3ToMetadata = path.join(__dirname + '/downloads/' + sessionId, rucws(trackInfo.trackRemix) + 'withoutMetadata.mp3');
        mp3Final = path.join(__dirname + '/downloads/' + sessionId, rucws(trackInfo.trackRemix) + '.mp3');


        console.log("Starting video conversion...");

        console.log(localVideo)
        socket.emit("downloadUpdate", { msg: "Audio video downloaded.", id: loadingID, percent: 30 });



        ffmpegConvert()

      });

    };

    const requestYoutubeAPI = function accessYouTubeAPI() {
      if (settings.debug == true) {
        console.log(chalk.bgRed("Accessing YouTube API"));
      }

      if (trackInfo.albumName.toLowerCase().indexOf('remix') != -1 && trackInfo.trackRemix.toLowerCase().indexOf('mix') == -1) {
        strToSearch = ruc(trackInfo.albumName);
        console.log(strToSearch)
      }
      else {
        strToSearch = ruc(trackInfo.trackRemix);

        console.log(chalk.red("NADA"))
      }

      let stringToSearch = ruc(trackInfo.artistName) + ' ' + strToSearch;
      if (input.lyric == 'on') {
        stringToSearch = ruc(trackInfo.artistName) + ' ' + strToSearch + ' ' + 'lyrics music video';
      }

      console.log(stringToSearch);

      // start accessing openmusic api 
      request(openMusicAPI + encodeURIComponent(stringToSearch), function(error, response, data) {
        try {
          data = JSON.parse(data);

        }
        catch (error) {
          console.log(error)
          return socket.emit('error', { msg: 'An unknown error was happened', errorMSG: error });

        }

        if (data.pageInfo.totalResults == 0) {
          return socket.emit('error', { msg: 'Not data found' });

        }

        youtubeId = data.items[0].id.videoId;
        processStatus.openmusicAPIaccess = true;
        if (settings.debug == true) {
          console.log(chalk.green("Youtube video id: " + youtubeId));
        };

        socket.emit("downloadUpdate", { msg: "searching on youtube....", id: loadingID, percent: 20 });


        downloadVideo();

      });
    };

    const requestiTunesAPI = function accessITunesAPi() {

      request(iTunesId, {}, function(error, response, body) {
        socket.emit("downloadUpdate", { msg: "starting proccess", id: loadingID, percent: 15 });




        jsonAPI = JSON.parse(body);

        // not found track returns a error mesage 
        if (jsonAPI.resultCount == 0) {

          return socket.emit('error', { msg: 'This track is unavaliable from our database' });

        }

        // if not have an error, just proceed, getting data from itunes response
        trackInfo = {
          imgCover: jsonAPI.results[0].artworkUrl100.replace("100x100bb.jpg", "400x400bb.png"),
          artistName: jsonAPI.results[0].artistName,
          trackName: jsonAPI.results[0].trackName,
          albumName: jsonAPI.results[0].collectionName,
          trackDate: jsonAPI.results[0].releaseDate,
          trackCountry: jsonAPI.results[0].country,
          trackGenre: jsonAPI.results[0].primaryGenreName,
          trackNumber: jsonAPI.results[0].trackNumber,
          trackRemix: jsonAPI.results[0].trackCensoredName
        };

        if (settings.debug == true) {
          console.log(chalk.green("[Debugging]"));
          console.log('🎵 ' + trackInfo.artistName);
          console.log('🎵 ' + trackInfo.trackName);
          console.log('🎵 ' + trackInfo.albumName);
          console.log('🎵 ' + trackInfo.trackDate);
          console.log('🎵 ' + trackInfo.trackCountry);
          console.log('🎵 ' + trackInfo.trackGenre);
        }

        download(trackInfo.imgCover, rucws(trackInfo.trackRemix) + '.png', function() {
          processStatus.imgAlbumDownloaded = true;
          console.log(chalk.green('✓') + 'Image art Downloaded');
        });
        processStatus.iTunesAPIaccess = true;

        requestYoutubeAPI()

      });

    };





    // let's do the magic ;)

    if (data.trackId != "") {
      processStatus.inputData = true;
    }

    if (processStatus.inputData == true) {
      requestiTunesAPI(input.trackId);
    }

  })

  socket.on('dl2', function(data) {
    console.log(data);

    if (data.type == "" || !data.id) {
      console.log("Missing data")
      return socket.emit("ops", { msg: "Missing data", error: true });
    }

    /**
     * There are two possibles data.types
     * 1 = iTunes id
     * 2 = Youtube id
     */

    console.log(chalk.bold.rgb(10, 100, 200)('An Download was started'));

    socket.emit("downloadUpdate", { msg: "Download started", percent: 10 });


    socket.on('end', function(err) {
      console.log("User connection was closed.");
      socket.emit("downloadUpdate", { msg: "User connection closed", percent: 0 });


    });
    socket.on('end', function(err) {
      remove(__dirname + '/downloads/' + sessionId, function(err) {
        if (err) console.error(err);
        else console.log(sessionId + 'Deleted!');
      });
    });

    let settings = {
      audioBitrate: '128k',
      audioCustomBitRate: data.bitRate,
      debug: true
    };

    let input = {
      trackId: data.id,
      lyric: "",
      youtubeURL: "",
    };


    let processStatus = {
      inputData: false,
      imgAlbumDownloaded: false,
      iTunesAPIaccess: false,
      openmusicAPIaccess: false,
      youtubeVideoDownloaded: false,
      ffmpegConversion: false
    };

    let youtubeId = data.id;

    let localVideo;
    let mp4Video;
    let mp3ToMetadata;
    let mp3Final;

    var videoTitle;
    var videoChannel;


    // Generate a folder with a random short id
    const sessionId = shortid.generate();
    mkdirp(__dirname + '/downloads/' + sessionId, function(err) {
      if (err) console.error(err)
      else console.log('Folder created');
    });



    // ruc - Replace stranger characters from a string
    const ruc = function replaceUnknownCharacters(string) {
      return string.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');

    };
    const rucws = function replaceUnknownCharactersWithoutSpace(string) {
      return string.replace(/[&\/\\#,+()$~%.'":*?<>{}/ /]/g, '');

    };


    const download = function(uri, filename, callback) {
      request.head(uri, function(err, res, body) {
        if (err) throw err

        let localImgCover = path.join(__dirname + "/downloads/" + sessionId, String(filename))

        request(uri).pipe(fs.createWriteStream(localImgCover)).on('close', callback)
      })
    };

    const ffmpegConvert = function convertVideoUsingFFMPEG() {
      socket.emit("downloadUpdate", { msg: "Starting Conversion", percent: 60 });

      console.log("Converting video in a audio file...");
      console.log(settings.audioBitrate);

      ffmpeg(localVideo)
        .output(mp3ToMetadata)
        .audioBitrate(settings.audioBitrate)
        .on('progress', function(progress) {
          socket.emit("downloadUpdate", { msg: "converting...", percent: 60 + progress.percent / 4, conveterStatus: true });
          console.log('Processing: ' + progress.percent + '% done');
        })

        .on('error', function(e) {
          console.log(e)
        })
        .on('end', function() {
          socket.emit("downloadUpdate", { msg: "Video converted", percent: 98 });

          console.log(chalk.green("Video convertted to MP3"));

          var resultHandler = function(err) {
            if (err) {
              console.log("unable to delete video file", err);
            }
            else {
              console.log("file deleted");
            }
          }

          console.log("about to call unlink");
          fs.unlink(mp4Video, resultHandler);
          console.log(chalk.green('✓ MP4 Video Deleted'));

          /**
           * add metadata tags and album art cover
           *
           */
          ffmpeg(mp3ToMetadata)
            .output(mp3Final)

            .outputOptions(
              "-i",
              __dirname + "/downloads/" + sessionId + '/' + rucws(videoTitle) + ".jpg",
              "-map", "0:0",
              "-map", "1:0",
              "-c", "copy",
              "-id3v2_version", "3",
              "-metadata", "artist=" + videoChannel + "",
              "-metadata", "title=" + videoTitle + "",
              "-metadata", "album=" + videoTitle + "",
              "-metadata", "composer=" + videoTitle + "", //TODO
              "-metadata", "comment=Open Music" //TODO
            )
            .on('error', function(e) {
              console.log(chalk.red("Error" + e));
              return socket.emit('error', { msg: 'An unknown error was happened', errorMSG: e });


            })
            .on('end', function() {
              console.log(chalk.green('✓') + 'Done adding metadata');
              console.log(chalk.green('✓') + 'Generating download link');
              console.log("/api/track/download/" + rucws(videoTitle) + "/" + sessionId);

              socket.emit("downloadUpdate", { msg: "Download started", percent: 100 });
              socket.emit("done", { msg: "Done!", url: "/api/v1/track/download/yt/" + rucws(videoTitle) + "/" + sessionId, trackName: videoTitle, artist: videoChannel, image: '' })

              return socket.emit('success', { msg: 'Track is done' });

            }).run()
        }).run()

    }

    const downloadVideo = function downloadVideoFromYouTube() {

      let youtubeDownloadUrl = 'http://www.youtube.com/watch?v=' + youtubeId;

      const video = ytdl(youtubeDownloadUrl.toString(), ['--format=18']);

      socket.emit("downloadUpdate", { msg: "Downloading video from youtube", percent: 25 });

      let size = 0;

      video.on('info', function(info) {
        console.log(chalk.yellow(info.filename));
        console.log(chalk.yellow(pretty(info.size)));
        videoTitle = info.title;
        videoChannel = info.channelTitle;

        download("https://img.youtube.com/vi/" + info.id + "/0.jpg", rucws(videoTitle) + ".jpg", function() {
          console.log(chalk.green('✓') + 'Image art Downloaded');
        });

        // download video in sessionId folder
        localVideo = path.join(__dirname + '/downloads/' + sessionId, rucws(videoTitle) + '.mp4');
        video.pipe(fs.createWriteStream(localVideo));

      });

      video.on('end', function() {
        processStatus.youtubeVideoDownloaded = true;

        console.log("video endedd;...");

        mp4Video = path.join(__dirname + '/downloads/' + sessionId, rucws(videoTitle) + '.mp4');
        // ffmpeg uses mp3ToMetadata to save file in this same local
        mp3ToMetadata = path.join(__dirname + '/downloads/' + sessionId, rucws(videoTitle) + 'withoutMetadata.mp3');
        mp3Final = path.join(__dirname + '/downloads/' + sessionId, rucws(videoTitle) + '.mp3');


        console.log("Starting video conversion...");

        console.log(localVideo)
        socket.emit("downloadUpdate", { msg: "Video downloaded", percent: 30 });


        ffmpegConvert()

      });

    };

    downloadVideo();


  })


});


/**
 * Start Express server.
 */

server.listen(app.get('port'), () => {
  console.log('%s App is running at http://localhost:%d in %s mode', chalk.green('✓'), app.get('port'), app.get('env'));
  console.log('  Press CTRL-C to stop\n');
});

module.exports = app;
