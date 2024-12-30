import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure the 'uploads/' directory exists
const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage and file type validation
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // The directory where files will be uploaded
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname); // Extract file extension
    cb(null, Date.now() + ext); // Save file with unique timestamp to avoid name conflicts
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5 MB
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "application/pdf", // PDF file type
      "application/vnd.ms-excel", // Excel 97-2003
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // Excel 2007 and later
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true); // Accept the file if valid
    } else {
      cb(new Error("Invalid file type. Only PDF and Excel files are allowed."));
    }
  },
});

export {upload};
