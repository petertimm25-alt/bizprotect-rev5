import React from 'react'
type Props=React.PropsWithChildren<{title?:string;className?:string}>
export default function Card({title,className,children}:Props){return(<div className={['rounded-2xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur',className].filter(Boolean).join(' ')}>{title?<h3 className='text-base md:text-lg font-semibold text-gold'>{title}</h3>:null}<div className={title?'mt-3':''}>{children}</div></div>)}
