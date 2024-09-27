import DataURIParser from 'datauri/parser.js';
import path from 'path';

export const getDataUri = (file) => {
  const parser = new DataURIParser();
  const extName = path.extname(file.originalname).toString();  // Get file extension
  return parser.format(extName, file.buffer);  // Convert file buffer to DataURI
};
