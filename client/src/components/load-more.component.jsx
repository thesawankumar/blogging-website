import React from "react";

const LoadMoreData = ({ state, fetchDataFun }) => {
  if (state != null && state.totalDocs > state.results.length) {
    return (
      <button
        onClick={() => fetchDataFun({ page: state.page + 1 })}
        className=" text-dark-grey p-2 px3 hover:bg-grey/30 rounded-md flex items-center gap-2"
      >
        load more
      </button>
    );
  }
};

export default LoadMoreData;
