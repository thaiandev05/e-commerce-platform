import { Injectable, Query, Res } from '@nestjs/common';
import express from 'express';
import fs from 'fs'
@Injectable()
export class FileService {
	public uploadFiles(files: Array<Express.Multer.File>, body) {
		// get name 
		const fileName = body.name.match(/(.+)-\d+$/)?.[1] ?? body.name
		const nameDir = 'upload/chunks' + fileName

		// make file 
		const paths = files.map(file => {
			const destPath = nameDir + '/' + file.originalname
			fs.copyFileSync(file.path, destPath)
			//remove temp file
			fs.rmSync(file.path)
			return destPath
		})

		return paths
	}

	public mergeFile(@Query('file') filename: string, @Query('add') adding: string , @Res() res: express.Response) {
		const nameDir = `upload + ${adding}`
		const files = fs.readFileSync(nameDir)

		let startPos = 0, count = 0

		files.forEach(file => {
			// get path full
			const filePath = nameDir + '/' + file
			const streamFile = fs.createReadStream(filePath)
			streamFile.pipe(fs.createWriteStream(nameDir, {
				start: startPos
			})).on('finish', () => {
				++count
				if (files.length == count) {
					fs.rm(nameDir, {
						recursive: true
					}, () => { })
				}
			})

			startPos += fs.statSync(filePath).size
		})

		return res.json({
			link: `localhost:3000/${filename}`,
			filename
		})
	}
}
