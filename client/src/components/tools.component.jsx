//importing tools

import Embed from "@editorjs/embed";
import List from "@editorjs/list";
import Code from "@editorjs/code";
import Image from "@editorjs/image";
import Quote from "@editorjs/quote";
import Marker from "@editorjs/marker";
import Header from "@editorjs/header";
import { uploadImage } from "../common/aws";

const uploadImageByUrl = async (e) => {
  let link = new Promise((resolve, reject) => {
    try {
      resolve(e);
    } catch (err) {
      reject(err);
    }
  });
  return link.then((url) => {
    return {
      success: 1,
      file: { url },
    };
  });
};

const uploadImageByFile = async (e) => {
  return uploadImage(e).then((url) => {
    if (url) {
      return {
        success: 1,
        file: { url },
      };
    }
  });
};

export const tools = {
  embed: Embed,
  list: {
    class: List,
    inlineToolbar: true,
  },
  code: {
    class: Code,
    config: {
      placeholder: "Enter your code here...",
      theme: "dark", 
    },
  },
  image: {
    class: Image,
    config: {
      uploader: {
        uploadByUrl: uploadImageByUrl,
        uploadByFile: uploadImageByFile,
      },
    },
  },
  quote: {
    class: Quote,
    inlineToolbar: true,
  },
  marker: Marker,
  header: {
    class: Header,
    config: {
      placeholder: "Enter header text here",
      levels: [2, 3],
      defaultLevel: 2,
    },
  },
};
