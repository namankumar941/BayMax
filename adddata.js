const displayHeadModel = require("./displayHead.json");
const uuid = require("uuid");
const DisplayHead = require("./models/displayHead");
const Details = require("./models/details");
const DetailsHead = require("./models/detailsHead");

async function readData() {
  let data;
  const userId = "107317229633682886997";
  const dateOfReport = "11/12/97";
  for (let key in data) {
    for (let object of data[key]) {
      const detailsHead = DetailsHead.find({
        userId: userId,
        detailsHeadName: object.originalName,
      });
      let detailsHeadId;
      if (!detailsHead[0]) {
        detailsHeadId = uuid.v4();
        await DetailsHead.create({
          detailsHeadId: detailsHeadId,
          userId: userId,
          detailsHeadName: object.originalName,
        });
      } else {
        detailsHeadId = detailsHead[0].detailsHeadId;
      }

      await Details.create({
        detailsId: uuid.v4(),
        userId: userId,
        detailsHeadId: detailsHeadId,
        details: {
          testName: object.testName,
          value: `${object.value}`,
          unit: object.unit,
          refValue: `${object.refValue}`,
        },
        dateOfReport: dateOfReport,
      });

      for (let displayHeadIndex in displayHeadModel[object.originalName]) {
        const displayHead = await DisplayHead.find({
          userId: userId,
          displayHeadName:
            displayHeadModel[object.originalName][displayHeadIndex],
        });

        if (!displayHead[0]) {
          const displayHeadId = uuid.v4();
          await DisplayHead.create({
            displayHeadId: displayHeadId,
            userId: userId,
            displayHeadName:
              displayHeadModel[object.originalName][displayHeadIndex],
          });
          await DetailsHead.findOneAndUpdate(
            { detailsHeadId: detailsHeadId },
            { $push: { displayHeadId: displayHeadId } }
          );
        } else {
          await DetailsHead.findOneAndUpdate(
            { detailsHeadId: detailsHeadId },
            { $push: { displayHeadId: displayHead[0].displayHeadId } }
          );
        }
      }
    }
  }
}

module.exports = readData;
