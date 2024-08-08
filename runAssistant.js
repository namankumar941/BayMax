require("dotenv").config()
const OpenAI = require("openai");

const reportModel = require("./reportFormat")
const fs = require('fs')
const pdf = require('pdf-parse');

async function callOpenAI(path){

    console.log("enter")

    //create open ai connection
    const secretKey = process.env.API_KEY    
    const openai = new OpenAI({
        apiKey: process.env.API_KEY
    }        
    );
      /*
    // Create a vector store including our file.
    let vectorStore = await openai.beta.vectorStores.create({
        name: "Medical Report",
    });
    
    //create assistant
    const myAssistant = await openai.beta.assistants.create({
        instructions:
         `return content inside the file`,
        name: "Medical records details",
        tools: [{ type: "file_search" }],
        tool_resources: {
            file_search: {
                vector_store_ids: [vectorStore.id]
            }
        },        
        model: "gpt-4o",
        
    });

    // A user wants to attach a file to a specific message, let's upload it.
    const file = await openai.files.create({
        file: fs.createReadStream(path),
        purpose: "assistants",
    });
console.log("vectorStore.id",vectorStore.id,"file.id",file.id)
  //create thread of assistant
  const thread = await openai.beta.threads.create({
    messages: [
      {
        role: "user",
        content:
          `1 retrieve text from attached file
          `,
        
        content:
          `1 Retrieve text from attached file and return json file
          2 give only test name and test result value with its unit of measurement 
          3 i only want retrival data nothing should be added by you`,

        // Attach the new file to the message.
        attachments: [{ file_id: file.id, tools: [{ type: "file_search" }] }],
      },
    ],
    tool_resources: {
        "file_search": {
          "vector_store_ids": [vectorStore.id]
        }
      }
  });
  
  //retrieve output we get from assistant and save that in result variable 
    const stream = openai.beta.threads.runs
  .stream(thread.id, {
    assistant_id: myAssistant.id,
  })
  .on("textCreated", () => console.log("assistant >"))
  .on("toolCallCreated", (event) => console.log("assistant " + event.type))
  .on("messageDone", async (event) => {
    if (event.content[0].type === "text") {
      const { text } = event.content[0];
      const { annotations } = text;
      const citations = [];

      let index = 0;
      for (let annotation of annotations) {
        text.value = text.value.replace(annotation.text, "[" + index + "]");
        const { file_citation } = annotation;
        if (file_citation) {
          const citedFile = await openai.files.retrieve(file_citation.file_id);
          citations.push("[" + index + "]" + citedFile.filename);
        }
        index++;
      }
      console.log(citations.join("\n"))

      //modify data according to our model and save it to our database
      try {            
        const response = await openai.chat.completions.create({
            messages: [{ role: "system", 
                content: `1 here is my file content:-
                 ${text.value}
                2 here is my model:-
                  ${reportModel}
                3 replace each and every testName value completely in my file content with its similar biological name as provided in my model  
                4 You can only output JSON.
                5 return me the changed my file content and new json file should have format for example
                {
                myTest : [
                {
                testName :
                  value : 
                  unit :
                },
                {
                testName :
                  value : 
                  unit :
                },
                ]}` 
            }],
            model: "gpt-4o",
            response_format: { type: "json_object" },
        });   

        //create a json file of final result we received in our database 
        fs.writeFile("./finalReportResult.json",response.choices[0].message.content,(err)=>{})

    } catch (e) {
        console.error(e)
    }


    //save required message in a txt file      
    fs.writeFile("./ReportResult.txt",text.value,(err)=>{})
    
    //delete file that we had uploaded
    await openai.files.del(file.id)
  }
    })

    
  
    let dataBuffer = fs.readFileSync(path);
 
pdf(dataBuffer).then(function(data) {
  console.log(data.metadata);
  fs.writeFile("./ReportResult.txt",data.text,(err)=>{})
    
        
}); */

//extract data from uploaded pdf report
let dataBuffer = fs.readFileSync(path);

pdf(dataBuffer).then(async function(data) {
  console.log(data.text);
  
   try {    
    //extract required data from file        
    const response1 = await openai.chat.completions.create({
        messages: [{ role: "system", 
            content: `1 here is my file content:-
             ${data.text}
            2 this file contain medical test report 
            3 extract all medical test with their values , unit of measurement and their reference value
            ` 
        }],
        model: "gpt-4o",
        
    });   

    fs.writeFile("./response1.txt",response1.choices[0].message.content,(err)=>{})

    const response2 = await openai.chat.completions.create({
      messages: [{ role: "system", 
          content: `1 here is my file content:-
           ${response1.choices[0].message.content}
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
          ` 
      }],
      model: "gpt-4o",
      response_format: { type: "json_object" },
      
  });   

  fs.writeFile("./response2.txt",response2.choices[0].message.content,(err)=>{})

    //modify data according to our model and save it to our database
    const response = await openai.chat.completions.create({
      messages: [{ role: "system", 
          content: `1 here is my json file content:-
           ${response2.choices[0].message.content}
          2 here is my model (array of biological terms):-
            ${reportModel} 
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
          ]}` 
      }],
      model: "gpt-4o",
      response_format: { type: "json_object" },
  });

    //create a json file of final result we received in our database 
    fs.writeFile("./finalReportResult.json",response.choices[0].message.content,(err)=>{})

} catch (e) {
    console.error(e)
}
  
});

}

module.exports = callOpenAI