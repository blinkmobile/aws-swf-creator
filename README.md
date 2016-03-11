# AWS SWF Setup helper

This is a tool for taking a JSON file of the options needed by the AWS SWF SDK 
to create a workflow and its activities. If any of the items already exist, 
they are skipped and a notice is printed to the console.

See the [http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SWF.html](Amazon Documentation) for details on the parameters for the various types.

## JSON structure


    {
      "region": "ap-southeast-2", 
      "domain": {}, 
      "workflowType": {},
      "activityTypes": [{}]
    }

