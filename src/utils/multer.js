import multer from 'multer';

// Use memory storage for Multer
const storage = multer.memoryStorage();

export const singleUpload = multer({ storage }).single("photo"); 

export const multipleUpload = multer({ storage }).array("files");
