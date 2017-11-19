// entry point for webpack
require.context('./assets', true);

// import the stylesheets
require('./scss/style.scss');

// start the JS
require('./js/app.js');
