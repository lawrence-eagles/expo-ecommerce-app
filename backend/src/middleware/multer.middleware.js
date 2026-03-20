import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// fileFilter to accept only jpeg, jpg, png and webp files
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLocaleLowerCase(),
  );
  const mimeTypes = allowedTypes.test(file.mimeTypes);

  if (extname && mimeTypes) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpeg, jpg, png, webpg)"));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 + 1024 + 1024 }, // 5 MB limit
});
