"use client"

export default function DynamicMonth() {
  const month = new Date().toLocaleString('es-CO', { month: 'long' });
  
  return <span>{month}</span>;
}