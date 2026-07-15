import Image from "next/image";

export function DrinkImagePlaceholder({
  imageRef,
  sizes,
  className = "",
}: {
  imageRef?: string;
  sizes?: string;
  className?: string;
}) {
  if (imageRef) {
    return (
      <div className={`relative overflow-hidden bg-surface ${className}`}>
        <Image src={imageRef} alt="" fill sizes={sizes} className="object-cover" />
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center bg-surface ${className}`}>
      <Image
        src="/brand/sauce_02.svg"
        alt=""
        width={96}
        height={82}
        className="h-auto w-1/3 min-w-12 opacity-40"
      />
    </div>
  );
}
