'use strict';

const AWS = require('aws-sdk')

var dynamodb = require('serverless-dynamodb-client');

var docClient = dynamodb.doc;  // return an instance of new AWS.DynamoDB.DocumentClient()

module.exports = {
  create: async(event, context) => {
    console.log('DB table', process.env.DYNAMODB_QIANKUN_TABLE)
    console.log('IS OFFLINE', process.env.IS_OFFLINE)
    let bodyObj = {}
    try {
      bodyObj = JSON.parse(event.body)
    } catch (jsonError) {
      console.log('There was an error parsing the body', jsonError)
      return {
        statusCode: 400
      }
    }

    if (typeof bodyObj.name === 'undefined' ||
    typeof bodyObj.age === 'undefined' ) {
      console.log('Missing parameters')
      return {
        statusCode: 400
      }      
    }

    let putParams = {
      TableName: process.env.DYNAMODB_QIANKUN_TABLE,
      Item: {
        name: bodyObj.name,
        age: bodyObj.age
      }
    }

    let putResult = {}
    try {
      putResult = await docClient.put(putParams).promise()
    } catch(putError) {
      console.log("There was a problem putting the qiankun")
      console.log('putParams', putParams)
      return {
        statusCode: 500
      }
    }

    return {
      statusCode: 201
    }
  },
  list: async(event, context) => {
    let scanParams = {
      TableName: process.env.DYNAMODB_QIANKUN_TABLE
    }

    let scanResult = {}
    try {
      scanResult = await docClient.scan(scanParams).promise()      
    } catch (scanError) {
      console.log('There was a problem scanning the qiankun')
      console.log('scanError', scanError)
      return {
        statusCode: 500
      }
    }

    if (scanResult.Items == null ||
      !Array.isArray(scanResult.Items) ||
      scanResult.Items.length == 0) {
        return {
          statusCode: 404
        }
    }

    return {
      statusCode: 200,
      body: JSON.stringify(scanResult.Items.map(qiankun => {
        return {
          name: qiankun.name,
          age: qiankun.age
        }
      }))
    }
  },
  get: async(event, context) => {
    let getParams = {
      TableName: process.env.DYNAMODB_QIANKUN_TABLE,
      Key: {
        name: event.pathParameters.name
      }
    }

    let getResult = {}
    try {
      getResult = await docClient.get(getParams).promise()      
    } catch (getError) {
      console.log('There was a problem getting the qiankun')
      console.log('getError', getError)
      return {
        statusCode: 500
      }
    }

    if (getResult.Item == null) {
        return {
          statusCode: 404
        }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
          name: getResult.Item.name,
          age: getResult.Item.age        
      })
    }
  },
  update: async(event, context) => {
    let bodyObj = {}
    try {
      bodyObj = JSON.parse(event.body)
    } catch (jsonError) {
      console.log('There was an error parsing the body', jsonError)
      return {
        statusCode: 400
      }
    }

    if (typeof bodyObj.age === 'undefined') {
      console.log('Missing parameter')
      return {
        statusCode: 400
      }      
    }

    let updateParams = {
      TableName: process.env.DYNAMODB_QIANKUN_TABLE,
      Key: {
        name: event.pathParameters.name
      },
      UpdateExpression: 'set age = :age',
      ExpressionAttributeName: {
        'age': 'age'
      },
      ExpressionAttributeValues: {
        ':age': bodyObj.age
      }
    }

    try {
      await docClient.update(updateParams).promise()      
    } catch (updateError) {
      console.log('There was a problem updateting the qiankun')
      console.log('updateError', updateError)
      return {
        statusCode: 500
      }
    }

    return {
      statusCode: 200
    }
  },
  delete: async(event, context) => {
    let deleteParams = {
      TableName: process.env.DYNAMODB_QIANKUN_TABLE,
      Key: {
        name: event.pathParameters.name
      }
    }

    try {
      await docClient.delete(deleteParams).promise()      
    } catch (deleteError) {
      console.log('There was a problem deleteting the qiankun')
      console.log('deleteError', deleteError)
      return {
        statusCode: 500
      }
    }

    return {
      statusCode: 200
    }
  }
}
