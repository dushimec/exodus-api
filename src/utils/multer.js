import multer from 'multer';

// Use memory storage for Multer
const storage = multer.memoryStorage();
export const multipleUpload = multer({
  storage
}).single("files");

export const singleUpload = multer({ storage }).single("file"); 
