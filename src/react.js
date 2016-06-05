import React from 'react';
import ReactDOM from 'react-dom';
import HanldebarsReact from 'handlebars-react';

new HandlebarsReact(options)
  .compile("<h1>{{title}}</h1>")
  .then(result => console.log(result));
