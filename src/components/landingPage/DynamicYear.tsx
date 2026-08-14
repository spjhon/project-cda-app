"use client"



export default function DynamicYear() {

  const year = new Date().getFullYear();
  
  return <span>{year}</span>;
}