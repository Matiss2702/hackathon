import Image from "next/image";


export default function Logo() {
  return (
    <>
      <Image
        src="/logo-black.png"
        alt="Services CEO Logo"
        className="block dark:hidden"
        width={200}
        height={50}
      />
      <Image
        src="/logo-light.png"
        alt="Services CEO Logo"
        className="hidden dark:block"
        width={200}
        height={50}
      />
    </>
  )
}