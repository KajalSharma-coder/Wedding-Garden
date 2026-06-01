import fs from "fs";
import path from "path";
import multer from "multer";

const uploadRoot = path.resolve(process.cwd(), "uploads");

function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}

function publicPath(file: Express.Multer.File | undefined) {
  if (!file) return "";
  const relative = path.relative(process.cwd(), file.path).replace(/\\/g, "/");
  return `/${relative}`;
}

function storage(folder: string) {
  const destination = path.join(uploadRoot, folder);
  ensureDir(destination);

  return multer.diskStorage({
    destination,
    filename: (_req, file, cb) => {
      const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "-");
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safe}`);
    }
  });
}

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  if (/^image\//.test(file.mimetype) || file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only image and PDF uploads are allowed."));
  }
};

export const vendorUpload = multer({
  storage: storage("vendors"),
  fileFilter,
  limits: { fileSize: 12 * 1024 * 1024, files: 35 }
});

export const serviceUpload = multer({
  storage: storage("services"),
  fileFilter,
  limits: { fileSize: 12 * 1024 * 1024, files: 30 }
});

export const galleryUpload = multer({
  storage: storage("gallery"),
  fileFilter,
  limits: { fileSize: 12 * 1024 * 1024, files: 40 }
});

export { publicPath };
