import Image from "next/image";

const Logo = () => {
  return (
    <div className="flex items-center gap-2 w-full justify-center">
      <div className="p-2 rounded-xl">
        <Image
          src="/assets/logo.png"
          alt="Nexus Car Logo"
          width="180"
          height="60"
          className="object-contain"
        />
      </div>
    </div>
  );
};

export default Logo;
