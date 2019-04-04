# OpenMusic
Open Music is a YouTube mp3 downloader.

## Setup
Make sure you're using Node.js 9 or higher, as well, make sure you've installed FFMPEG on your system and exported as a system var on `$PATH`

You can also use the `exportffmpeg` shell script on the root folder

```shell
sh exportffmpeg
git clone https://github.com/matheuschimelli/open-music
cd open-music
npm install
```

Case you want to use as **personal music download server**, i've created a Procfile to easy Heroku deploy.

To deploy on Heroku you'll need the Heroku FFMPEG buildpack


Add the following to your `.buildpacks`:

```
https://github.com/jonathanong/heroku-buildpack-ffmpeg-latest.git
```

Or run the following from the heroku command line:

```
heroku buildpacks:add https://github.com/jonathanong/heroku-buildpack-ffmpeg-latest.git
```

## License
MIT