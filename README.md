# Potato

A collaborative drawing/annotation tool built on Firebase

## Installing

To install:

* Run `npm install`
* Rename `sampleFirebaseConfig.js` to `firebaseConfig.js` and populate with the details of your Firebase instance
* Your Firebase database should contain a top level `draw` key with child keys `data` and `render`.

```
draw: {
    data: "",
    render: ""
}
```

## Building

To build in a local development mode, run `npm start`. You can access the webapp at `localhost:3000` and the page will reload on JavaScript or Sass changes.

To deploy, run `npm run build`. The compiled output will be built in the `dist/` folder, which you can upload to the host of your choice.


## License

Currently [no license](https://choosealicense.com/no-license/) is provided for this repo.
