const path = require("path");
const express = require("express");
const uuid = require("uuid");
const fs = require("fs");
const os = require("os");
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
	access_token:
		"ya29.a0ARrdaM8GEXtJUAihv8hGzkg9TzZ2Nfp70QHfYXYjERB5UqQNX5WnlHiCt1-U8fy7KPepcV_0ADaaWyMmtya45edrOcdG3MDopnrRkazgXUdQLEH5NXkzxvkuGpM4Nz7fCpt-NtImuducGbW2Yummf_vs_3f4",
});

const drive = google.drive({
	version: "v3",
	auth: oauth2Client,
});

const docs = google.docs({
	version: "v1",
	auth: oauth2Client,
});

const stringToKebab = (str) => {
	let arr = str
		? str.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
		: null;
	return arr && arr.map((x) => x.toLowerCase()).join("-");
};

app.get("/doc", function (req, res) {
	(async function () {
		try {
			const createResponse = await docs.documents.get({
				documentId: "1SdrLXxRoD_hZwWnLBqZWMb3ph2DqnFwptSb57tBH_JY",
			});
			// return res.json({ createResponse });

			let html = createResponse?.data?.body?.content
				.map((data) => {
					let textType = data?.paragraph?.paragraphStyle?.namedStyleType;
					let tag = "",
						heading = false;
					switch (true) {
						case /^NORMAL_TEXT/.test(textType): {
							tag = "p";
							break;
						}
						case /^HEADING_/.test(textType): {
							tag = `h${textType.slice(-1)}`;
							// console.log({ tag });
							heading = true;
							break;
						}
					}

					return tag
						? data?.paragraph?.elements.map((element) => {
								let elementText = element?.textRun?.content.replace(/(\r\n|\n|\r)/gm, "").trim();
								return elementText
									? `<${tag} id ='${
											heading ? stringToKebab(elementText) : ""
									  }' > ${elementText}</${tag}>`
									: "";
						  })
						: "";
				})
				.join(" ");

			return res.json({
				title: createResponse?.data?.title,
				slug: stringToKebab(createResponse?.data?.title	),
				html,
			});
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
