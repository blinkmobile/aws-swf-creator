'use strict';

const AWS = require('aws-sdk');
const loadJson = require('load-json-file');
const cat = require('./cat');

const CONFIG_FILE = 'swf-config.json';
const INVALID_CHARS = /[:\/\|]|arn/g;

let SWF;

function setupAWS (config) {
  AWS.config.region = config.region;
  SWF = new AWS.SWF();

  return config;
}

function registerDomain (config) {
  return new Promise((resolve, reject) => {
    if (INVALID_CHARS.test(config.domain.name)) {
      console.log('Invalid characters in domain name: ' + config.domain.name);
      console.log('See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SWF.html#registerDomain-property');
      return reject(new Error('Invalid Characters'));
    }

    SWF.registerDomain(config.domain, (err, data) => {
      if (err) {
        if (err.code === 'DomainAlreadyExistsFault') {
          // if it already exists we'll just add to it.
          console.log(config.domain.name + ' already exists. Skipping.');
          return resolve(config);
        }
        return reject(err);
      }

      console.log(`Domain ${config.domain.name} successfully created`);

      resolve(config);
    });
  });
}

function registerWorkflow (config) {
  return new Promise((resolve, reject) => {
    let workflowConfig = Object.assign({domain: config.domain.name}, config.workflowType);

    if (INVALID_CHARS.test(config.workflowType.name)) {
      console.log('Invalid characters in work flow type name: ' + config.workflowType.name);
      console.log('See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SWF.html#registerDomain-property');
      return reject(new Error('Invalid Characters'));
    }

    SWF.registerWorkflowType(workflowConfig, (err, data) => {
      if (err) {
        if (err.code === 'TypeAlreadyExistsFault') {
          // if it already exists we'll just add to it.
          console.log(config.workflowType.name + ' already exists. Skipping.');
          return resolve(config);
        }
        return reject(err);
      }

      console.log(`Workflow type ${workflowConfig.name} successfully created`);

      resolve(config);
    });
  });
}

function registerActivity (domain) {
  return function (activity) {
    return new Promise((resolve, reject) => {
      if (INVALID_CHARS.test(activity.name)) {
        console.log('Invalid characters in activity type name: ' + activity.name);
        console.log('See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SWF.html#registerDomain-property');
        return reject(new Error('Invalid Characters'));
      }
      const config = Object.assign({domain}, activity);

      SWF.registerActivityType(config, (err, data) => {
        if (err) {
          if (err.code === 'TypeAlreadyExistsFault') {
            // if it already exists
            console.log(`Activity type ${activity.name} already exists. To update its settings you will need to bump the version number`);
            return resolve(config);
          }
          return reject(err);
        }

        console.log(`Activity type ${activity.name} successfully created`);

        resolve(config);
      });
    });
  };
}

function registerActivityTypes (config) {
  let activities = config.activityTypes;
  if (!activities.forEach) {
    activities = [activities];
  }

  return Promise.all(activities.map(registerActivity(config.domain.name)));
}

function success (config) {
  console.log(cat);
  console.log('Successfully setup a new workflow.');
}

loadJson(CONFIG_FILE)
  .then(setupAWS)
  .then(registerDomain)
  .then(registerWorkflow)
  .then(registerActivityTypes)
  .then(success)
  .catch(err => console.log('Error: ' + err));
