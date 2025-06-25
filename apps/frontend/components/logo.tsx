import Image from "next/image";


export default function Logo() {
  return (
    <>
      <Image
        src="/logo.png"
        alt="Lexa Logo"
        width={50}
        height={30}
      />
    </>
  )
}