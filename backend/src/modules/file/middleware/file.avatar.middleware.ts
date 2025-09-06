import { BadRequestException, Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request } from "express";
import { existsSync, mkdirSync } from "fs";
import multer from "multer";
import { extname, resolve } from "path";

const avatarUploadPath = resolve(process.cwd(), 'upload/avatars')
if (!existsSync(avatarUploadPath)) {
	mkdirSync(avatarUploadPath, { recursive: true })
}

// multer config
const storage = multer.diskStorage({
	destination: (_, __, cb) => {
		cb(null, avatarUploadPath)
	},
	filename: (_, file, cb) => {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
		cb(null, uniqueSuffix + extname(file.originalname))
	}
})

const fileFilter = (_: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
	if (!file.mimetype.match(/^image\/(jpeg|png|webp)$/)) {
		return cb(new BadRequestException('Only jpeg/png/webp images are allowed'));
	}
	cb(null, true);
};

const upload = multer({
	storage,
	limits: { fileSize: 2 * 1024 * 1024 },
	fileFilter
}).single('avatar')
@Injectable()
export class FileMiddleware implements NestMiddleware {
	use(req: Request, res: any, next: NextFunction) {
		upload(req, res, (err: any) => {
			if (err) {
				if (err instanceof multer.MulterError) {
					return next(new BadRequestException(err.message))
				} else if (err instanceof BadRequestException) {
					return next(err)
				}
				return next(new BadRequestException("File upload failed"))
			}
			next()
		})
	}
}