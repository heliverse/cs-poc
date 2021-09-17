const path = require("path");
const express = require("express");
const { google } = require("googleapis");
const { authenticate } = require("@google-cloud/local-auth");
// const docs = require("@googleapis/docs");

const app = express();

const oauth2Client = new google.auth.OAuth2(
	"190264844211-mt06e42t3ivft3vjc9h1gpsk3pps4m3s.apps.googleusercontent.com",
	"ftvAvKr6NwzHCdU1I9k3eSED",
	"http://localhost:5000/callback"
);
oauth2Client.setCredentials({
	refresh_token:
		"1//0g7GLH4lmdh6OCgYIARAAGBASNwF-L9IrQxSWM4-HxEqHNwpZPJuovHmnKG8l8dGj2RsGUgVS7neK2PUqGayK0_tFFuiqclIaceM",
});

const drive = google.drive({
	version: "v3",
	auth: oauth2Client,
});

const docs = google.docs({
	version: "v1",
	auth: oauth2Client,
});

app.get("/doc", function (req, res) {
	(async function () {
		try {
			const createResponse = await docs.documents.get({
				documentId: "1SdrLXxRoD_hZwWnLBqZWMb3ph2DqnFwptSb57tBH_JY",
			});
			return res.json(createResponse.data);
		} catch (error) {
			console.log({ error });
		}
	})();
});

app.get("/", function (req, res) {
	(async function () {
		let result = await new Promise((resolve, reject) => {
			drive.files.list(
				{
					q: "'1aXBqTO0Zz-HrjenR1AvzSCjOCGEUEOvH' in parents", //this is folder of book
					fields: "files(name, webViewLink, parents, id)",
					orderBy: "createdTime desc",
				},
				function (err, res) {
					if (err) {
						reject(err);
					}
					resolve(res);
				}
			);
		});
		return res.json(result.data);
	})();
});

app.listen(6000);
