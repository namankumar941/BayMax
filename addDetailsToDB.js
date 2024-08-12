const displayHeadModel = require("./displayHead.json");
const DisplayHead = require("./models/displayHead");
const Details = require("./models/details");
const DetailsHead = require("./models/detailsHead");
const uuid = require("uuid");

//----------------------------------------------class----------------------------------------------

class AddDetailsToDB{
  //function to add details to database
  async addDetails(filePath, userId, dateOfReport) {
    console.log("addDetailsToDB start");
    const data = require(filePath);
  
    for (let key in data) {
      for (const object of data[key]) {
        const detailsId = uuid.v4();
        //save details in our database
        await Details.create({
          detailsId: detailsId,
          userId: userId,
          details: {
            testName: object.testName,
            value: `${object.value}`,
            unit: object.unit,
            refValue: `${object.refValue}`,
          },
          dateOfReport: dateOfReport,
        });
        //getting display head under which we have to display this object details
        for (let displayHeadIndex in displayHeadModel[object.originalName]) {
          //find if this display head is present in our database or not
          const displayHead = await DisplayHead.find({
            userId: userId,
            displayHeadName:
              displayHeadModel[object.originalName][displayHeadIndex],
          });
  
          let displayHeadId;
  
          //if display head not present in our database create one
          if (!displayHead[0]) {
            displayHeadId = uuid.v4();
            await DisplayHead.create({
              displayHeadId: displayHeadId,
              userId: userId,
              displayHeadName:
                displayHeadModel[object.originalName][displayHeadIndex],
            });
          } else {
            displayHeadId = displayHead[0].displayHeadId;
          }
  
          if (object.originalName) {
            //find if details head is present under this display head
            const detailsHead = await DetailsHead.find({
              userId: userId,
              detailsHeadName: object.originalName,
            });
  
            let detailsHeadId;
            //if details head not present in our database create one
            if (!detailsHead[0]) {
              detailsHeadId = uuid.v4();
              await DetailsHead.create({
                detailsHeadId: detailsHeadId,
                userId: userId,
                detailsHeadName: object.originalName,
                displayHeadId: [displayHeadId],
              });
            } else {
              detailsHeadId = detailsHead[0].detailsHeadId;
              await DetailsHead.findOneAndUpdate(
                { detailsHeadId: detailsHeadId },
                { $push: { displayHeadId: displayHeadId } }
              );
            }
            await Details.findOneAndUpdate(
              { detailsId: detailsId },
              { detailsHeadId: detailsHeadId }
            );
          }
        }
      }
    }
  }  
}

module.exports = AddDetailsToDB;
