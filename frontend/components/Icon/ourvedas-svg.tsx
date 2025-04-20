import React from "react"

interface OurVedasProps {
  theme: "dark" | "light"
  scale?: number
}

export const OurVedasSVG: React.FC<OurVedasProps> = ({ theme, scale = 1 }) => {
  const fillColor = theme === "dark" ? "#000" : "#fff"
  const strokeColor = theme === "dark" ? "#fff" : "#000"
  return (
    <svg
      width={`${60 * scale}px`}
      height={`${30 * scale}px`}
      viewBox="0 0 60 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke={strokeColor}
    >
      <path d="M2,2 L2,28 L30,25 L58,28 L58,2 L30,5 L2,2" strokeWidth="3" />
      <path d="M30,5 L30,25" strokeWidth="3" />
      <path d="M35,7 Q37,6 39,7 Q41,8 43,7 Q45,6 47,7 Q49,8 51,7 Q53,6 55,7" />
      <path d="M35,11 Q37,10 39,11 Q41,12 43,11 Q45,10 47,11 Q49,12 51,11 Q53,10 55,11" />
      <path d="M35,15 Q37,14 39,15 Q41,16 43,15 Q45,14 47,15 Q49,16 51,15 Q53,14 55,15" />
      <path d="M35,19 Q37,18 39,19 Q41,20 43,19 Q45,18 47,19 Q49,20 51,19 Q53,18 55,19" />
      <path d="M35,23 Q37,22 39,23 Q41,24 43,23 Q45,22 47,23 Q49,24 51,23 Q53,22 55,23" />
    </svg>
  )
}
