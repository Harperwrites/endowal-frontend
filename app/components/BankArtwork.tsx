export default function BankArtwork(){
 return <svg className="little-bank-art" viewBox="0 0 420 260" aria-hidden="true" focusable="false">
 <ellipse cx="210" cy="234" rx="176" ry="15" fill="#839d83" opacity=".15"/>
 <circle cx="332" cy="56" r="29" fill="#f2d991"/><path d="M47 54h40m-20-20v40" stroke="#b3c5ae" strokeWidth="3" strokeLinecap="round"/>
 <path d="M110 100 210 42 310 100Z" fill="#789b8e" stroke="#476e60" strokeWidth="4" strokeLinejoin="round"/>
 <path d="M139 93 210 52 281 93Z" fill="#bdd0b8"/>
 <circle cx="210" cy="77" r="15" fill="#fbefc8"/><text x="210" y="84" textAnchor="middle" fontSize="21" fontWeight="600" fill="#547765">$</text>
 <rect x="112" y="102" width="196" height="109" rx="5" fill="#f5e9cd" stroke="#c4b493" strokeWidth="3"/>
 <rect x="100" y="98" width="220" height="15" rx="5" fill="#e0cfac"/>
 {[131,177,223,269].map(x=><g key={x}><rect x={x} y="121" width="20" height="71" rx="4" fill="#b5c8b2"/><path d={`M${x-3} 120h26m-26 74h26`} stroke="#729483" strokeWidth="5" strokeLinecap="round"/><path d={`M${x+8} 129v54`} stroke="#dce4cc" strokeWidth="3"/></g>)}
 <rect x="99" y="205" width="222" height="12" rx="4" fill="#c6b18d"/><rect x="88" y="218" width="244" height="12" rx="4" fill="#decca8"/>
 <g transform="translate(24 143) rotate(-12 65 39)"><rect width="128" height="77" rx="8" fill="#7faaa0" stroke="#4b7e6e" strokeWidth="3"/><rect x="8" y="8" width="112" height="61" rx="7" fill="none" stroke="#d4e5c9" strokeWidth="2"/><ellipse cx="64" cy="38" rx="22" ry="25" fill="#c4d9b9"/><text x="64" y="48" textAnchor="middle" fill="#416f5b" fontSize="30">$</text><text x="16" y="27" fill="#e6efdc" fontSize="12">10</text><text x="94" y="61" fill="#e6efdc" fontSize="12">10</text></g>
 <g transform="translate(265 160) rotate(10 65 33)"><rect width="132" height="70" rx="5" fill="#fff6df" stroke="#c5b28f" strokeWidth="2"/><text x="10" y="15" fill="#7c856d" fontSize="6" letterSpacing="1">ENDOWAL PRACTICE CHECK</text><path d="M10 28h75m-75 13h112m-112 12h60" stroke="#bdc8af" strokeWidth="2"/><rect x="91" y="21" width="30" height="14" rx="2" fill="#e1e8d4"/><path d="m83 57 8-6 5 5 8-4 9 4" fill="none" stroke="#8f9f85" strokeWidth="1.5"/></g>
 <g fill="#edcc7a" stroke="#cda64f" strokeWidth="2"><ellipse cx="251" cy="235" rx="20" ry="6"/><path d="M231 224v10c0 8 40 8 40 0v-10"/><ellipse cx="251" cy="224" rx="20" ry="6"/><ellipse cx="285" cy="236" rx="17" ry="5"/></g>
 <path d="m365 105 3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" fill="#9babbf"/>
 </svg>;
}
