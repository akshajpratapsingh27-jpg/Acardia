import React from "react";

/**
 * Ruby the Red Panda — cozy mascot for Smriti Setu.
 * A gentle, dementia-friendly character: she lies down resting on her front
 * paws and cuddles the smritisetu ✦ icon, breathing softly. Fully animated
 * with CSS so every detail (pose, colours, motion) is editable in code.
 */
export default function RedPandaMascot() {
  return (
    <svg
      className="panda-mascot"
      viewBox="0 0 400 260"
      role="img"
      aria-label="Ruby the red panda, lying down and holding the smritisetu sparkle icon"
    >
      {/* ground shadow */}
      <ellipse className="panda-shadow" cx="200" cy="236" rx="160" ry="16" />

      {/* ---- TAIL (behind body, curling up, gentle flick) ---- */}
      <g className="panda-tail">
        <path
          d="M 332 214
             C 360 206, 378 176, 372 146
             C 370 132, 358 124, 348 132
             C 338 140, 342 158, 352 162
             C 366 168, 360 190, 338 204
             Z"
          fill="#b33a1f"
        />
        <circle cx="356" cy="140" r="7" fill="#f2c94c" opacity=".9" />
        <circle cx="360" cy="156" r="6" fill="#f2c94c" opacity=".8" />
        <circle cx="352" cy="150" r="5" fill="#f2c94c" opacity=".7" />
      </g>

      {/* ---- BODY (lying down, belly to the floor) ---- */}
      <g className="panda-body">
        {/* back leg tucked */}
        <ellipse cx="250" cy="222" rx="58" ry="26" fill="#8a2d14" />
        <path
          d="M 200 216 C 230 206, 300 210, 318 228
             C 322 236, 314 244, 296 244 C 268 244, 216 230, 200 216 Z"
          fill="#a83a1c"
        />
        {/* belly */}
        <ellipse cx="190" cy="196" rx="86" ry="46" fill="#f0a65a" opacity=".45" />
        <ellipse cx="170" cy="204" rx="52" ry="30" fill="#f5c98d" opacity=".5" />
        {/* belly breathing overlay */}
        <ellipse className="panda-breath" cx="170" cy="206" rx="48" ry="26" fill="#ffffff" opacity=".14" />
      </g>

      {/* ---- FRONT PAWS + the sparkle icon it cuddles ---- */}
      <g className="panda-front">
        {/* front arm holding the icon */}
        <path
          d="M 96 212 C 88 178, 108 148, 130 148
             C 150 148, 150 180, 136 204"
          fill="none"
          stroke="#a83a1c"
          strokeWidth="30"
          strokeLinecap="round"
        />
        <path
          d="M 128 186 C 140 172, 168 170, 168 150
             C 168 130, 140 126, 126 142"
          fill="none"
          stroke="#bf4524"
          strokeWidth="26"
          strokeLinecap="round"
        />
        {/* front paw pads */}
        <ellipse cx="132" cy="150" rx="16" ry="12" fill="#2f1b12" />
        <ellipse cx="126" cy="146" rx="4" ry="3" fill="#ffd9b3" />
        <ellipse cx="138" cy="146" rx="4" ry="3" fill="#ffd9b3" />
        <ellipse cx="132" cy="154" rx="4" ry="4" fill="#ffd9b3" />

        {/* the smritisetu ✦ icon, cute and held between paws */}
        <g className="panda-icon">
          <circle cx="150" cy="176" r="26" fill="#f2c94c" />
          <circle cx="150" cy="176" r="22" fill="#ffdf7a" stroke="#e6b23a" strokeWidth="3" />
          <path
            d="M150 158 L156 172 L172 176 L156 182 L150 196 L144 182 L128 176 L144 172 Z"
            fill="#ffffff"
          />
        </g>
      </g>

      {/* ---- HEAD ---- */}
      <g className="panda-head">
        {/* neck */}
        <circle cx="110" cy="118" r="30" fill="#a83a1c" />

        {/* ears */}
        <g className="panda-ear-left">
          <ellipse cx="52" cy="62" rx="22" ry="26" fill="#b33a1f" />
          <ellipse cx="52" cy="62" rx="12" ry="14" fill="#f2c94c" opacity=".85" />
        </g>
        <g className="panda-ear-right">
          <ellipse cx="150" cy="68" rx="22" ry="26" fill="#b33a1f" />
          <ellipse cx="150" cy="68" rx="12" ry="14" fill="#f2c94c" opacity=".85" />
        </g>

        {/* face */}
        <ellipse cx="102" cy="104" rx="66" ry="58" fill="#eef0f0" />
        {/* cheek tufts */}
        <path d="M36 96 C44 120, 60 132, 78 130 C64 128,48 116,40 102 Z" fill="#f2c94c" opacity=".55" />
        <path d="M168 96 C160 120, 144 132, 126 130 C140 128,156 116,164 102 Z" fill="#f2c94c" opacity=".55" />
        {/* blush */}
        <ellipse cx="68" cy="116" rx="12" ry="8" fill="#ffb08a" opacity=".55" />
        <ellipse cx="136" cy="116" rx="12" ry="8" fill="#ffb08a" opacity=".55" />
        {/* forehead patch */}
        <path d="M102 52 C126 52,134 74,132 90 C128 70,116 58,102 52 Z" fill="#a83a1c" opacity=".9" />

        {/* eyes */}
        <circle cx="78" cy="102" r="9" fill="#2b2b2b" />
        <circle cx="78" cy="99" r="3" fill="#ffffff" />
        <circle cx="126" cy="102" r="9" fill="#2b2b2b" />
        <circle cx="126" cy="99" r="3" fill="#ffffff" />

        {/* nose */}
        <path d="M98 110 L102 118 L108 110 Z" fill="#2b2b2b" />

        {/* smile */}
        <path d="M94 122 C100 130, 108 130, 112 122" fill="none" stroke="#7a4a2b" strokeWidth="3" strokeLinecap="round" />
        <path d="M92 124 C88 130, 94 134, 100 130" fill="none" stroke="#7a4a2b" strokeWidth="2.5" strokeLinecap="round" />
        {/* tongue */}
        <ellipse cx="103" cy="128" rx="5" ry="4" fill="#ff8aa0" />
      </g>

      {/* soft floating hearts */}
      <text className="panda-heart" x="40" y="40" fontSize="22" fill="#ffc2d1">♥</text>
      <text className="panda-heart panda-heart-2" x="330" y="64" fontSize="16" fill="#ffc2d1">♥</text>
      <text className="panda-heart panda-heart-3" x="370" y="40" fontSize="13" fill="#ffe9b3">✦</text>
    </svg>
  );
}
