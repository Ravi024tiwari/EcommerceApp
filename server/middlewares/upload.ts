//here we create the multer

import multer from "multer"

const storage =multer.memoryStorage();

const upload =multer({storage})

export default upload;