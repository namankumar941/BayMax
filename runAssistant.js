require("dotenv").config();
const OpenAI = require("openai");
const TerminologyArray = require("./TerminologyArray");
const fs = require("fs");
const pdf = require("pdf-parse");
const addDetailsToDB = require("./addDetailsToDB");

//create open ai connection
const secretKey = process.env.API_KEY;
const openai = new OpenAI({
  apiKey: process.env.API_KEY,
});

//response message that have to be sent to openAI to rearrange our data and get json file
const response1Message = `above is my file content
     2 this file contain medical test report 
     3 extract all medical test with their values , unit of measurement and their reference value
     `;
const response2Message = `above is my file content
    2 this file contain medical test report 
    3 convert this into a json object
    4 new json file should strictly follow format for example
    {[
    {
      testName :
      value : 
      unit :
      refValue :
    },
    {
      testName :
      value : 
      unit :
      refValue :
    },
    ]}
    `;
const response3Message = `above is my json file content 
        2 convert this json file content into new format and new json file should strictly follow structure as below :-
        {[
        {
          testName :
          value : 
          unit :
          refValue :
        },
        {
          testName :
          value : 
          unit :
          refValue :
        },
        ]}
        3 new json file should strictly follow the above structure
        `;
const finalResponseMessage = `above is my json file content
          2 here is my model (array of biological terms):-
            ${TerminologyArray} 
          3 add new key to json object as originalName to my json file content
          4 originalName take its value from my model array which has similar biological meaning to testName value in my json file content
          4 return me the changed my file content and new json file should strictly follow format for example
          {
          myTest : [
          {
          testName :
          originalName:
            value : 
            unit :
            refValue :
          },
          {
          testName :
          originalName:
            value : 
            unit :
            refValue :
          },
          ]}`;

//function to  extract data from uploaded pdf report
async function dataExtraction(filePath) {
  let dataBuffer = fs.readFileSync(filePath);
  const data = await pdf(dataBuffer);
  return data;
}

//function to extract required data from file and rearrange using openai  api
async function chatGPT(fileText, content, isJsonOutput) {
  if (isJsonOutput) {
    return await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `1. ${fileText} 
          ${content}`,
        },
      ],
      model: "gpt-4o",
      response_format: { type: "json_object" },
    });
  }
  return await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `1. ${fileText} 
        ${content}`,
      },
    ],
    model: "gpt-4o",
  });
}

//function that will be called in my document route to interact with openAi api
async function callOpenAI(inputFilePath, outputFilePath, userId, dateOfReport) {
  console.log("enter");
  const data = await dataExtraction(inputFilePath);
  console.log(`response 1 start`);

  const response1 = await chatGPT(data.text, response1Message, false);

  console.log(`response 2 start`);

  const response2 = await chatGPT(
    response1.choices[0].message.content,
    response2Message,
    true
  );

  console.log(`response 3 start`);

  const response3 = await chatGPT(
    JSON.stringify(response2.choices[0].message.content),
    response3Message,
    true
  );

  console.log(`response final start`);

  const finalResponse = await chatGPT(
    JSON.stringify(response3.choices[0].message.content),
    finalResponseMessage,
    true
  );
  fs.writeFileSync(outputFilePath, finalResponse.choices[0].message.content);

  addDetailsToDB(outputFilePath, userId, dateOfReport);
}

module.exports = callOpenAI;
