const User = require("../models/user");
const Documents = require("../models/documents");
const ApiAssistant = require("../runAssistant");

const apiAssistant = new ApiAssistant()

const express = require("express");
const path = require("path");
const multer = require("multer");
const uuid = require("uuid");
const fs = require("fs");

const router = express.Router();

//----------------------------------------------multer----------------------------------------------

// Multer configuration for file storage
const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    const destPath = path.resolve(`./public/${req.params.resourceId}/reports`);

    // Check if the directory exists at destination
    fs.access(destPath, fs.constants.F_OK, (err) => {
      if (err) {
        // If the directory does not exist, create one
        fs.mkdir(destPath, { recursive: true }, (err) => {
          if (err) {
            return callback(err);
          } else {
            return callback(null, destPath);
          }
        });
      } else {
        // If the directory exists, proceed
        return callback(null, destPath);
      }
    });
  },
  filename: function (req, file, callback) {
    const uniqueName = Date.now() + ".pdf";
    return callback(null, uniqueName);
  },
});
const upload = multer({ storage });

//----------------------------------------------class----------------------------------------------

class DocumentsController {
  //get request to display all uploaded reports
  async getAllReports(req, res) {
    const user = await User.find(
      { userId: req.user.userId },
      " userId , profileImageURL"
    );

    const doc = await Documents.find(
      { userId: req.params.userId },
      "documentId , dateOfReport"
    );

    const docOwner = await User.find(
      { userId: req.params.userId },
      "profileImageURL , name , userId"
    );

    return res.render("documents", {
      user: user[0],
      doc: doc,
      docOwner: docOwner[0],
    });
  }
  //get request to add report
  async getAddReport(req, res) {
    const user = await User.find(
      { userId: req.user.userId },
      " userId , profileImageURL"
    );
    const docOwner = await User.find(
      { userId: req.params.userId },
      "profileImageURL , name , userId, resourceId"
    );

    return res.render("addDocuments", {
      user: user[0],
      docOwner: docOwner[0],
    });
  }
  //post request to add report and convert that data into detailed format
  async postAddReport(req, res) {
    const user = await User.find({ resourceId: req.params.resourceId });

    await Documents.create({
      userId: user[0].userId,
      docURL: `/${req.params.resourceId}/reports/${req.file.filename}`,
      dateOfReport: req.body.dateOfReport,
      documentId: uuid.v4(),
    });

    const outputFilePath = `./public/${
      req.params.resourceId
    }/reports/${Date.now()}.json`;

    apiAssistant.callOpenAI(
      `./public/${req.params.resourceId}/reports/${req.file.filename}`,
      outputFilePath,
      user[0].userId,
      req.body.dateOfReport
    );
    return res.redirect(`/documents/${user[0].userId}`);
  }
  //get request to view report
  async getViewReport(req, res) {
    const doc = await Documents.find(
      { documentId: req.params.documentId },
      "docURL"
    );

    res.render("viewReport", {
      url: doc[0].docURL,
    });
  }
}
//created class instance
const documentsController = new DocumentsController();

//----------------------------------------------routes----------------------------------------------

//get request to display all uploaded reports
router.get(
  "/:userId",
  documentsController.getAllReports.bind(documentsController)
);
//get request to add report
router.get(
  "/add/:userId",
  documentsController.getAddReport.bind(documentsController)
);
//post request to add report and convert that data into detailed format
router.post(
  "/add/:resourceId",
  upload.single("Report"),
  documentsController.postAddReport.bind(documentsController)
);
//get request to view report
router.get(
  "/viewReport/:documentId",
  documentsController.getViewReport.bind(documentsController)
);

module.exports = router;
