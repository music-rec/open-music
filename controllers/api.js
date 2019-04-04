const { promisify } = require('util');
const request = require('request');
const { LastFmNode } = require('lastfm');
const paypal = require('paypal-rest-sdk');
const yotutubeSearch = require('youtube-search');
const path = require('path');
const remove = require('remove');
const chalk = require('chalk');
const fs = require('fs');

/**
 * GET /api
 * List of API examples.
 */
exports.getApi = (req, res) => {
  res.render('api/index', {
    title: 'API Examples'
  });
};

/**
 * GET /api/lastfm
 * Last.fm API example.
 */
exports.getLastfm = async(req, res, next) => {
  const lastfm = new LastFmNode({
    api_key: process.env.LASTFM_KEY,
    secret: process.env.LASTFM_SECRET
  });
  const getArtistInfo = () =>
    new Promise((resolve, reject) => {
      lastfm.request('artist.getInfo', {
        artist: 'Roniit',
        handlers: {
          success: resolve,
          error: reject
        }
      });
    });
  const getArtistTopTracks = () =>
    new Promise((resolve, reject) => {
      lastfm.request('artist.getTopTracks', {
        artist: 'Roniit',
        handlers: {
          success: ({ toptracks }) => {
            resolve(toptracks.track.slice(0, 10));
          },
          error: reject
        }
      });
    });
  const getArtistTopAlbums = () =>
    new Promise((resolve, reject) => {
      lastfm.request('artist.getTopAlbums', {
        artist: 'Roniit',
        handlers: {
          success: ({ topalbums }) => {
            resolve(topalbums.album.slice(0, 3));
          },
          error: reject
        }
      });
    });
  try {
    const { artist: artistInfo } = await getArtistInfo();
    const topTracks = await getArtistTopTracks();
    const topAlbums = await getArtistTopAlbums();
    const artist = {
      name: artistInfo.name,
      image: artistInfo.image ? artistInfo.image.slice(-1)[0]['#text'] : null,
      tags: artistInfo.tags ? artistInfo.tags.tag : [],
      bio: artistInfo.bio ? artistInfo.bio.summary : '',
      stats: artistInfo.stats,
      similar: artistInfo.similar ? artistInfo.similar.artist : [],
      topTracks,
      topAlbums
    };
    res.render('api/lastfm', {
      title: 'Last.fm API',
      artist
    });
  }
  catch (err) {
    if (err.error !== undefined) {
      console.error(err);
      // see error code list: https://www.last.fm/api/errorcodes
      switch (err.error) {
        // potentially handle each code uniquely
        case 10: // Invalid API key
          res.render('api/lastfm', {
            error: err
          });
          break;
        default:
          res.render('api/lastfm', {
            error: err
          });
      }
    }
    else {
      next(err);
    }
  }
};

/**
 * GET /api/paypal
 * PayPal SDK example.
 */
exports.getPayPal = (req, res, next) => {
  paypal.configure({
    mode: 'sandbox',
    client_id: process.env.PAYPAL_ID,
    client_secret: process.env.PAYPAL_SECRET
  });

  const paymentDetails = {
    intent: 'sale',
    payer: {
      payment_method: 'paypal'
    },
    redirect_urls: {
      return_url: process.env.PAYPAL_RETURN_URL,
      cancel_url: process.env.PAYPAL_CANCEL_URL
    },
    transactions: [{
      description: 'Hackathon Starter',
      amount: {
        currency: 'USD',
        total: '1.99'
      }
    }]
  };

  paypal.payment.create(paymentDetails, (err, payment) => {
    if (err) { return next(err); }
    const { links, id } = payment;
    req.session.paymentId = id;
    for (let i = 0; i < links.length; i++) {
      if (links[i].rel === 'approval_url') {
        res.render('api/paypal', {
          approvalUrl: links[i].href
        });
      }
    }
  });
};

/**
 * GET /api/paypal/success
 * PayPal SDK example.
 */
exports.getPayPalSuccess = (req, res) => {
  const { paymentId } = req.session;
  const paymentDetails = { payer_id: req.query.PayerID };
  paypal.payment.execute(paymentId, paymentDetails, (err) => {
    res.render('api/paypal', {
      result: true,
      success: !err
    });
  });
};

/**
 * GET /api/paypal/cancel
 * PayPal SDK example.
 */
exports.getPayPalCancel = (req, res) => {
  req.session.paymentId = null;
  res.render('api/paypal', {
    result: true,
    canceled: true
  });
};

/**
 * GET /api/upload
 * File Upload API example.
 */

exports.getFileUpload = (req, res) => {
  res.render('api/upload', {
    title: 'File Upload'
  });
};

exports.postFileUpload = (req, res) => {
  req.flash('success', { msg: 'File was uploaded successfully.' });
  res.redirect('/api/upload');
};

/**
 * GET /api/v1/track/yt
 * Youtube video search APIs
 */
exports.yt = (req, res) => {
  var opts = {
    maxResults: 20,
    key: 'AIzaSyBAQx2SuUo9IAb-kdZBmfLLmWH1gPF_xbo',
    type: 'video'
  };
  yotutubeSearch(req.params.query, opts, function(err, results) {
    if (err) return console.log(err);

    res.json(results)
  });
}

/**
 * GET /api/v1/track/details
 * iTunes metadata extraction
 * returns 1 result only
 */
exports.trackDetails = (req, res) => {
  if (!req.params.trackName || req.params.trackName == " ") {
    return res.json({ error: true, msg: "Invalid data. Missing token." })
  }

  var iTunesAPI = "https://itunes.apple.com/search?term=" + req.params.trackName + "&media=music&limit=1";
  request(iTunesAPI, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      var json = JSON.parse(body);
      console.log("iTunes json request parsed.")


      //verify if json is null
      if (json.resultCount == 0) {
        return res.json({ error: true, msg: "Music not found on database. Check your search, and try again" })
      }
      else {
        return res.send(json)
      }
    }
  })
}

/**
 * GET /api/v1/track/search
 * iTunes metadata extraction
 * returns 1 result only
 */
exports.search = (req, res) => {
  if (!req.params.trackName || req.params.trackName == " ") {
    return res.json({ error: true, msg: "Invalid data. Missing token." })
  }

  var iTunesAPI = "https://itunes.apple.com/search?term=" + req.params.trackName + "&media=music&limit=20";
  request(iTunesAPI, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      var json = JSON.parse(body);
      console.log("iTunes json request parsed.")


      //verify if json is null
      if (json.resultCount == 0) {
        return res.json({ error: true, msg: "Music not found on database. Check your search, and try again" })
      }
      else {
        return res.send(json)
      }
    }
  })
}

exports.downloadyt = (req, res) => {
  const rucws = function replaceUnknownCharactersWithoutSpace(string) {
    return string.replace(/[&\/\\#,+()$~%.'":*?<>{}/ /]/g, '');

  };

  var mp3Final = path.join(__dirname + '/../downloads/' + req.params.sessionID, req.params.videoTitle + '.mp3');
  if (fs.existsSync(mp3Final)) {
  res.type('audio/mpeg3');
  res.download(mp3Final, function(err) {
    if (err) {
      if (err.code === "ECONNABORT" && res.statusCode == 304) {
        // No problem, 304 means client cache hit, so no data sent.
        console.log('304 cache hit for ' + mp3Final);
      }


      console.log(err)

    }
    else {

      remove(__dirname + '/../downloads/' + req.params.sessionID, function(err) {
        if (err) console.error(err);
        else console.log(chalk.red(req.params.sessionID) + ' Deleted!');
      });

    }
  })
  }
  else{
    res.send('error');
  }

}


exports.downloadI= (req, res) => {
  const rucws = function replaceUnknownCharactersWithoutSpace(string) {
    return string.replace(/[&\/\\#,+()$~%.'":*?<>{}/ /]/g, '');

  };

  var mp3Final = path.join(__dirname + '/../downloads/' + req.params.sessionID, req.params.trackName + '.mp3');
  if (fs.existsSync(mp3Final)) {
  res.type('audio/mpeg3');
  res.download(mp3Final, function(err) {
    if (err) {
      if (err.code === "ECONNABORT" && res.statusCode == 304) {
        // No problem, 304 means client cache hit, so no data sent.
        console.log('304 cache hit for ' + mp3Final);
      }


      console.log(err)

    }
    else {

      remove(__dirname + '/../downloads/' + req.params.sessionID, function(err) {
        if (err) console.error(err);
        else console.log(chalk.red(req.params.sessionID) + ' Deleted!');
      });

    }
  })
  }
  else{
    res.send('error');
  }

}
