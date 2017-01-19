/**
 * System configuration for Angular samples
 * Adjust as necessary for your application needs.
 */
(function (global) {
  System.config({
    paths: {
      // paths serve as alias
      'npm:': 'node_modules/'
    },
    // map tells the System loader where to look for things
    map: {
      // our app is within the app folder
      app: 'app',
      // angular bundles
      '@angular/core': 'npm:@angular/core/bundles/core.umd.js',
      '@angular/common': 'npm:@angular/common/bundles/common.umd.js',
      '@angular/compiler': 'npm:@angular/compiler/bundles/compiler.umd.js',
      '@angular/platform-browser': 'npm:@angular/platform-browser/bundles/platform-browser.umd.js',
      '@angular/platform-browser-dynamic': 'npm:@angular/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.js',
      '@angular/http': 'npm:@angular/http/bundles/http.umd.js',
      '@angular/router': 'npm:@angular/router/bundles/router.umd.js',
      '@angular/forms': 'npm:@angular/forms/bundles/forms.umd.js',
      // other libraries
      'rxjs': 'npm:rxjs',
      'moment': 'npm:moment',
      'chartist': 'npm:chartist',
      //'angular2-moment': 'npm:angular2-moment',
      'angular2-chartist': 'npm:angular2-chartist',
      'angular-in-memory-web-api': 'npm:angular-in-memory-web-api',
      'ng2-simple-page-scroll/ng2-simple-page-scroll': 'npm:ng2-simple-page-scroll/bundles/ng2-simple-page-scroll.umd.js',
      '@ng-bootstrap/ng-bootstrap': 'node_modules/@ng-bootstrap/ng-bootstrap/bundles/ng-bootstrap.js',
      'ng2-auto-complete': 'node_modules/ng2-auto-complete/dist'
    },
    // packages tells the System loader how to load when no filename and/or no extension
    packages: {
      app: {
        main: './main.js',
        defaultExtension: 'js'
      },
      rxjs: {
        defaultExtension: 'js'
      },
      'angular-in-memory-web-api': {
        main: './index.js',
        defaultExtension: 'js'
      },
      'moment': {
        main: './moment.js',
        defaultExtension: 'js'
      },
      'chartist': {
        main: './dist/chartist.js',
        defaultExtension: 'js'
      },
/*      'angular2-moment': {
        main: './index.js',
        defaultExtension: 'js'
      },
*/      'angular2-chartist': {
        main: './dist/angular2-chartist.js',
        defaultExtension: 'js'
      },
      'ng2-auto-complete': { main: 'ng2-auto-complete.umd.js', defaultExtension: 'js' }
    }
  });
})(this);
