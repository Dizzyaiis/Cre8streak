import React from "react";

const squares = [
  { color: "bg-[#6a0dad]" },
  { color: "bg-[#0a1dff]" },
  { color: "bg-[#cc3b35]" },
  { color: "bg-[#228b22]" },
  { color: "bg-[#c2185b]" },
  { color: "bg-[#0d0d0d]" },
  { color: "bg-[#e0e0e0]" },
  { color: "bg-[#ffd106]" },
  { color: "bg-[#bf00ff]" },
];

export const Box = (): JSX.Element => {
  return (
    <div className="relative w-[95px] h-[70px]">
      <div className="grid grid-cols-4 gap-[5px] w-full h-full">
        {squares.map((square, index) => (
          <div
            key={index}
            className={`${square.color} w-5 h-5 rounded-[10px]`}
          />
        ))}
      </div>
    </div>
  );
};
