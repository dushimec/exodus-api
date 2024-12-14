import multer from 'multer';

// Use memory storage for Multer
const storage = multer.memoryStorage();
export const multipleUpload = multer({
  storage
}).single("file");

export const singleUpload = multer({ storage }).single("photo"); 
