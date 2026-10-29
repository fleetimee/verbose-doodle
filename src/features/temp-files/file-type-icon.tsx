import {
  Doc01Icon,
  File01Icon,
  FileCodeIcon,
  FileImageIcon,
  FileMusicIcon,
  FileVideoIcon,
  FileZipIcon,
  Pdf01Icon,
  Ppt01Icon,
  Txt01Icon,
  Xls01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

const FILE_TYPES = [
  { icon: Pdf01Icon, extensions: ["pdf"] },
  { icon: Doc01Icon, extensions: ["doc", "docx", "odt", "rtf"] },
  { icon: Xls01Icon, extensions: ["xls", "xlsx", "xlsm", "csv", "tsv", "ods"] },
  { icon: Ppt01Icon, extensions: ["ppt", "pptx", "odp"] },
  { icon: Txt01Icon, extensions: ["txt", "md", "log"] },
  {
    icon: FileCodeIcon,
    extensions: [
      "json",
      "jsonl",
      "yaml",
      "yml",
      "xml",
      "html",
      "css",
      "scss",
      "js",
      "jsx",
      "ts",
      "tsx",
      "py",
      "java",
      "go",
      "rs",
      "sql",
      "sh",
      "bash",
      "toml",
      "ini",
      "env",
    ],
  },
  {
    icon: FileImageIcon,
    extensions: [
      "png",
      "jpg",
      "jpeg",
      "gif",
      "webp",
      "svg",
      "avif",
      "ico",
      "bmp",
      "tif",
      "tiff",
      "heic",
    ],
  },
  {
    icon: FileZipIcon,
    extensions: ["zip", "rar", "7z", "tar", "gz", "bz2", "xz", "tgz"],
  },
  {
    icon: FileMusicIcon,
    extensions: ["mp3", "wav", "ogg", "flac", "m4a", "aac", "aiff", "wma"],
  },
  {
    icon: FileVideoIcon,
    extensions: ["mp4", "webm", "mov", "mkv", "avi", "m4v", "mpeg", "mpg"],
  },
];

export function FileTypeIcon({
  filename,
  className,
}: {
  readonly filename: string;
  readonly className?: string;
}) {
  const dot = filename.lastIndexOf(".");
  const extension = dot < 0 ? "" : filename.slice(dot + 1).toLowerCase();
  const icon =
    FILE_TYPES.find((type) => type.extensions.includes(extension))?.icon ??
    File01Icon;

  return (
    <HugeiconsIcon
      aria-hidden="true"
      className={className}
      icon={icon}
      strokeWidth={2}
    />
  );
}
