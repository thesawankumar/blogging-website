import React from "react";

const Img = ({ url, caption }) => {
  return (
    <div>
      <img src={url} />
      {caption.length ? (
        <p className=" w-full text-center my-3 md:mb-12 text-base text-dark-grey">
          {caption}
        </p>
      ) : (
        ""
      )}
    </div>
  );
};

const Quote = ({ quote, caption }) => {
  return (
    <div className=" bg-purple/10 p-3 pl-5 border-1-4 border-purple">
      <p className="text-xl lead10 md:text-2xl">{quote}</p>
      {caption.length ? (
        <p className=" w-full text-purple text-base">{caption}</p>
      ) : (
        ""
      )}
    </div>
  );
};
const List = ({ style, items }) => {
  return (
    <ol
      className={`pl-5 ${style == "ordered" ? " list-decimal" : " list-desc"}`}
    >
      {items.map((item, index) => {
        return (
          <li
            key={index}
            className="my-4"
            dangerouslySetInnerHTML={{ __html: item }}
          ></li>
        );
      })}
    </ol>
  );
};

// Code Component
// const Code = ({ code }) => (
//   <pre className="bg-transparent border-dark-grey border-2 p-4 rounded-md overflow-auto">
//     <code className="text-green-200 text-2xl md:text-2xl">{code}</code>
//   </pre>
// );
const BlogContent = ({ block }) => {
  let { type, data } = block;
  if (type == "paragraph") {
    return <p dangerouslySetInnerHTML={{ __html: data.text }}></p>;
  }

  if (type == "header") {
    if (data.level == 3) {
      return (
        <h3
          className=" text-3xl font-bold"
          dangerouslySetInnerHTML={{ __html: data.text }}
        ></h3>
      );
    }
    return (
      <h2
        className=" text-4xl font-bold"
        dangerouslySetInnerHTML={{ __html: data.text }}
      ></h2>
    );
  }
  if (type == "image") {
    return <Img url={data.file.url} caption={data.caption} />;
  }
  if (type == "quote") {
    return <Quote quote={data.file.url} caption={data.caption} />;
  }
  if (type == "list") {
    return <List style={data.style} items={data.items} />;
  }
  //   if (type == "code") {
  //     return <Code code={data.code} />;
  //   }
};

export default BlogContent;
