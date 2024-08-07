import multer from "multer";

const storageMemory = multer.memoryStorage();

export const uploadImageMemory = multer({
	storage: storageMemory,
	limits: {
		fileSize: 500 * 1024,
	},
	fileFilter: (req, file, cb) => {
		if (!file.originalname.match(/\.(jpg|jpeg|png)$/i)) {
			return cb(new Error("File must be an image"));
		}
		cb(null, true);
	},
});
