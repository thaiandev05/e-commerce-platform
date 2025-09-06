import { diskStorage } from "multer"
import { extname } from "path"

export const multerConfig = (folder: 'avatar' | 'product') => {
	return {
		storage: diskStorage({
			destination: `./upload/${folder}`,
			filename: (req, file, callback) => {
				const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
				const ext  = extname(file.originalname)
				callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`)
			}
		})
	}
}