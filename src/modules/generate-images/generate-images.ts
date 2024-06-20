import fs from "fs";

export function imageToBase64(imagePathName: string) {
  return new Promise((resolve) => {
    const file = fs.readFileSync(imagePathName);
    const base64 = Buffer.from(file).toString("base64");
    resolve(`data:image/png;base64,${base64}`);
  });
}

export function fontToBase64(fontPathName: string) {
  return new Promise((resolve) => {
    const file = fs.readFileSync(fontPathName);
    const base64 = Buffer.from(file).toString("base64");
    resolve(`data:font/ttf;base64,${base64}`);
  });
}

export function loadHtml(htmlPathName: string): Promise<string> {
  return new Promise((resolve) => {
    const file = fs.readFileSync(htmlPathName, { encoding: "utf8" });
    resolve(file);
  });
}