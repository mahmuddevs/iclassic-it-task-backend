import multer from 'multer'

import fs from 'fs'

const storage = multer.diskStorage({
  destination: function (req: any, file, cb) {
    // Read the folder location dynamically from request context set by middleware
    const dir = req.uploadDir || 'uploads'

    fs.promises.mkdir(dir, { recursive: true })
      .then(() => cb(null, dir))
      .catch((err) => cb(err, ''));
  },
  filename: function (req, file, cb) {
    const uniquePrefix = Date.now()
    cb(null, uniquePrefix + file.originalname)
  }
})

export const setUploadDir = (dir: string) => {
  return (req: any, res: any, next: any) => {
    req.uploadDir = dir;
    next();
  };
};

export const upload = multer({ storage: storage })

