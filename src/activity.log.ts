// import { Request, Response } from "express";
// const { user } = require("remit-db/app/models");
// const db = require("remit-db/app/models")

import { NextFunction, Request, Response } from "express";
import { getLocalTime } from "ababil-utils";

export const Kind = {
	Read: 1,
	List: 2,
	Select: 3,
	Dashboard: 4,
	Query: 5,

	Create: 10,
	Delete: 11,
	Update: 12,

	Verify: 20,
	Password: 21,
	Access: 21,
	AuthCode: 25,

	Approval: 30,

	TxnINQ: 40,
	TxnEXE: 45,
	CashMarked: 46,
	Deposit: 49,

	Upload: 50,
	Download: 51,
	FileList: 52,
}

function getMaskedData(req: Request, withHeader: boolean = false) {
	let body = req.body

	if (body.hasOwnProperty('Password') || body.hasOwnProperty('password') || body.hasOwnProperty('pOld') || body.hasOwnProperty('pNew')) {
		body = JSON.parse(JSON.stringify(body));
		if (body.hasOwnProperty('Password'))
			body.Password = "****************"
		if (body.hasOwnProperty('password'))
			body.password = "****************"
		if (body.hasOwnProperty('pOld'))
			body.pOld = "****************"
		if (body.hasOwnProperty('pNew'))
			body.pNew = "****************"
	}

	let data = {
		req: {
			method: req.method,
			url: req.url,
			body: body,
			params: req.params,
			headers: (withHeader ? req.headers : undefined)
		}
	};
	return data
}

export function init(req: any, res: any, next: any) {
	// console.log("activity.init");
	// let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null
	// let data = getReqData(req)
	// let dataEscaped = JSON.stringify(data).replace(/\'/g, "\\'");

	// db.dbws.query(
	// 	"INSERT INTO WebAuth_Activity(IpAddress, ExtraData) VALUES ('" + ip + "','" + dataEscaped + "')", {
	// 	type: db.Sequelize.QueryTypes.INSERT
	// }).then((results: any) => {
	// req.activityId = results[0]
	next()
	// }).catch((error: any) => {
	// 	res.status(400).send({ message: error.message || "Activity Init Error" })
	// })
}

export function reply(req: any, res: any, code: number, data: any, activity: string, severity: number) {
	console.log("activity.reply " + code);
	// if (req.activityId) {
	// 	let id = req.activityId
	// 	let username = req.credential?.Username || data.Username || req.body.username || null
	// let sExtraData = ""

	switch (Math.trunc(code / 100)) {
		case 1: // 1xx informational, no log
		case 2: // 2xx success, no log
		case 3: // 3xx redirect, no log
			break;

		case 4: // 4xx client errors
			if (Object.keys(data).length > 0) {
				console.log(data);
			}
			break;

		case 5: // 5xx server error
		default:
			let logdata: any = getMaskedData(req, true);
			logdata.resp = data;
			// let xd = JSON.stringify(reqdata);
			// xd = xd.replace(/\\/g, "\\\\")
			// 	.replace(/\$/g, "\\$")
			// 	.replace(/'/g, "\\'")
			// 	.replace(/"/g, "\\\"")
			// sExtraData = ", ExtraData='" + xd + "'"
			console.log(logdata);
			break;
	}
	// 	db.dbws.query("UPDATE WebAuth_Activity"
	// 		+ " SET Status=" + code
	// 		+ ", Severity=" + (severity || 0)
	// 		+ (username ? ", UserName='" + username + "'" : "")
	// 		+ (activity ? ", Activity='" + activity + "'" : "")
	// 		+ sExtraData
	// 		+ " WHERE Id = " + id
	// 		, {
	// 			type: db.Sequelize.QueryTypes.UPDATE
	// 		}).catch((error: any) => {
	// 			console.log(error)
	// 		})
	// } else {
	// 	console.log('activity not initiate')
	// }
	res.status(code).send(data);
}

export function captureRequest(req: Request, res: Response, next: NextFunction) {
	if (req.method != "OPTIONS") {
		res.locals.requestTime = Date.now();
		console.log('----------------------------------------');
		console.log('Requested at: ' + getLocalTime());
		console.log(req.method + " " + req.url + " " + req.socket.remoteAddress);
	}
	next();
}