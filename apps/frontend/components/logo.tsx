import Image from "next/image";

export default function Logo() {
  return (
    <div>
      <Image
        src="/logo.png"
        alt="Logo Noku"
        width={50}
        height={30}
        style={{ height: "auto", width: "auto" }}
        priority
      />
    </div>
  );
}
