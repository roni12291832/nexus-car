import Image from "next/image";

const Logo = () => {
  return (
    <div className="flex items-center gap-2 w-full justify-center">
      <div className=" p-2 rounded-xl shadow-brand">
        <Image
          src="/assets/logo.png"
          alt="Nexus Car Logo"
          width="90"
          height="90"
        />
      </div>
    </div>
  );
};

export default Logo;
