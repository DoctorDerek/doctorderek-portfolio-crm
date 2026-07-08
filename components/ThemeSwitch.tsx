"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { CSSTransition } from "react-transition-group"

/** This is our "dark mode" helper; clicking it switches to dark mode. */
export default function ThemeSwitch() {
  /*  useTheme takes no parameters, but returns:
      theme: Active theme name

      setTheme(name): Function to update the theme

      forcedTheme: Forced page theme or falsy. If forcedTheme is set, you should disable any theme switching UI

      resolvedTheme: If enableSystem is true and the active theme is "system", this returns whether the system preference resolved to "dark" or "light". Otherwise, identical to theme

      systemTheme: If enableSystem is true, represents the System theme preference ("dark" or "light"), regardless what the active theme is
      themes: The list of themes passed to ThemeProvider (with "system" appended, if enableSystem is true) */
  const { resolvedTheme, setTheme } = useTheme()

  const [inProp, setInProp] = useState(false)
  useEffect(() => {
    if (resolvedTheme === "dark") setInProp(true)
  }, [resolvedTheme])

  return (
    <CSSTransition
      aria-label="Toggle Dark Mode"
      type="button"
      className="mr-1 ml-1 h-12 bg-transparent p-1 text-gray-900"
      onClick={() => {
        setTheme(resolvedTheme === "dark" ? "light" : "dark")
        setInProp(inProp ? false : true)
      }}
      in={inProp}
      classNames="switch"
      timeout={0}
    >
      <svg
        width="170"
        height="70"
        viewBox="0 0 170 70"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="switch"
      >
        <mask
          id="mask0"
          // eslint-disable-next-line react/no-unknown-property
          mask-type="alpha"
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="170"
          height="70"
        >
          <rect width="170" height="70" rx="35" fill="#C4C4C4" />
        </mask>
        <g mask="url(#mask0)">
          <rect width="170" height="70" rx="35" fill="url(#paint0_linear)" />
          <circle
            cx="133.5"
            cy="37.5"
            r="19.5"
            fill="url(#paint1_radial)"
            className="sun"
          />
          <path
            d="M33.5 29L9 70V81H186.5V70L173 19L151.5 66L136 34L117.5 70L103 23L79.5 70L65 38L48.5 70L33.5 29Z"
            fill="#729971"
            className="mountain3"
          />
          <path
            d="M17.5 29.5L-5.5 63V85.5L198.5 82V63L176 29.5L150.5 63L139 45.5L126.5 63L111 29.5L94.5 63L79.5 35.5L64 63L51 35.5L36.5 63L17.5 29.5Z"
            fill="#316930"
            className="mountain2"
          />
          <path
            d="M18 41L-0.5 55.5V82.5H177.5V55.5L157.5 36L137.5 55.5L124.5 41L112.5 55.5L90.5 30L68 55.5L52.5 44L37.5 55.5L18 41Z"
            fill="#0D3F0C"
            className="mountain1"
          />
          <path
            d="M11.5 38.5L4 62.5V71L166.5 69V62.5L164 44L161 58.5L159.5 48.5L157.5 58.5L155.5 47L153.5 58.5L150.5 42L146.5 58.5L144.5 44L142 58.5L139 47L137.5 58.5L134 42L132.5 58.5L130 38.5L126.5 58.5L125 35L122 58.5L119.5 44L117 58.5L113.5 48.5L112.5 58.5L108 42L107 58.5L103.5 47L102 58.5L98 41L97 58.5L93.5 47.5L91.5 58.5L88.5 42L87 58.5L83.5 47.5L82.5 60L79 44L76.5 60L73.5 51.5L70 60L68 42L64.5 58.5L61.5 44L59.5 58.5L57.5 47L55.5 58.5L53 44L50 58.5L48 40.5L44 58.5L41 42L39.5 58.5L35.5 38.5L34 58.5L29.5 40.5L28 58.5L24 38.5L22 58.5L18.5 35L14 58.5L11.5 38.5Z"
            fill="#092B08"
            className="trees"
          />
          <path
            d="M161 23C163 23.5 161 25.0865 161 25.0865H116.693C116.693 25.0865 114.193 20.5 118.693 20C123.193 19.5 124.5 23.5 124.5 23.5C124.5 23.5 125.193 17.5 130.193 17.5C134.078 17.5 134.828 19.6141 134.969 20.5562C134.929 19.0167 135.381 14 143 14C152 14 149.5 23 149.5 23C149.5 23 159 22.5 161 23Z"
            fill="white"
            className="cloud2"
          />
          <path
            d="M86 18.5C90 18.5 91.5 21 91.5 21H42.5171C42.5171 21 40 16.7469 46.5 15C53 13.2531 56.3023 17 56.3023 17C56.3023 17 53.3023 11 61.8023 11C68.76 11 68.0123 15.0202 67.512 16.4791C67.9991 15.5038 69.488 13.5 73.5 13.5C78.8023 13.5 79 19.5 79 19.5C79 19.5 82 18.5 86 18.5Z"
            fill="white"
            className="cloud1"
          />
          <rect
            x="154"
            y="28"
            width="1"
            height="1"
            transform="rotate(-45 154 28.4142)"
            fill="white"
            className="star1"
          />
          <rect
            x="135"
            y="24"
            width="1"
            height="1"
            transform="rotate(-45 135 24.4142)"
            fill="white"
            className="star2"
          />
          <rect
            x="143"
            y="12"
            width="3"
            height="3"
            transform="rotate(-45 143 12.4142)"
            fill="white"
            className="star3"
          />
          <rect
            x="125"
            y="6"
            width="1"
            height="1"
            transform="rotate(-45 125 6.41422)"
            fill="white"
            className="star4"
          />
          <rect
            x="114"
            y="20"
            width="2"
            height="2"
            transform="rotate(-45 114 20.4142)"
            fill="white"
            className="star5"
          />
          <rect
            x="15"
            y="16"
            width="2"
            height="2"
            transform="rotate(-45 15 16.4142)"
            fill="white"
            className="star6"
          />
          <rect
            x="29"
            y="22"
            width="1"
            height="1"
            transform="rotate(-45 29 22.4142)"
            fill="white"
            className="star7"
          />
          <rect
            x="37"
            y="12"
            width="2"
            height="2"
            transform="rotate(-45 79 22.4142)"
            fill="white"
            className="star8"
          />
          <rect
            x="68"
            y="12"
            width="1"
            height="1"
            transform="rotate(-45 68 12.4142)"
            fill="white"
            className="star9"
          />
          <rect
            x="94"
            y="10"
            width="3"
            height="3"
            transform="rotate(-45 94 10.4142)"
            fill="white"
            className="star10"
          />
          <rect
            x="79"
            y="22"
            width="2"
            height="2"
            transform="rotate(-45 79 22.4142)"
            fill="white"
            className="star11"
          />
          <rect
            x="52"
            y="19"
            width="1"
            height="1"
            transform="rotate(-45 52 19.4142)"
            fill="white"
            className="star12"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M47.8633 21.4906C51.6823 20.8895 54.2909 17.3063 53.6897 13.4873C53.2623 10.7721 51.3274 8.66868 48.8722 7.89574C53.1956 7.27505 57.2283 10.2428 57.9095 14.5709C58.5966 18.9355 55.6153 23.0305 51.2508 23.7176C48.3712 24.1708 45.6089 23.0273 43.8653 20.9433C45.0734 21.4967 46.4523 21.7128 47.8633 21.4906Z"
            fill="#FFF3CA"
            className="moon"
          />
        </g>
        <defs>
          <linearGradient
            id="paint0_linear"
            x1="85"
            y1="0"
            x2="85"
            y2="70"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#75DAF0" className="background-top-color" />
            <stop
              offset="1"
              stopColor="#C3EFF8"
              className="background-bottom-color"
            />
          </linearGradient>
          <radialGradient
            id="paint1_radial"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(133.5 37.5) rotate(90) scale(27)"
          >
            <stop stopColor="white" />
            <stop offset="1" stopColor="#FFEE53" />
          </radialGradient>
        </defs>
      </svg>
    </CSSTransition>
  )
}
