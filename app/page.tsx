import { BirdIconRow } from "@/components/BirdIconRow";
import { PhotoRow } from "@/components/PhotoRow";

const PHOTOS_GROUP_1 = [
  { src: "/onboarding/photo-00.webp", width: 1400, height: 955 },
  { src: "/onboarding/photo-01.webp", width: 1400, height: 878 },
  { src: "/onboarding/photo-02.webp", width: 1400, height: 934 },
  { src: "/onboarding/photo-03.webp", width: 1400, height: 2100 },
  { src: "/onboarding/photo-04.webp", width: 1400, height: 933 },
];

const PHOTOS_GROUP_2 = [
  { src: "/onboarding/photo-05.webp", width: 1400, height: 933 },
  { src: "/onboarding/photo-06.webp", width: 1400, height: 1931 },
  { src: "/onboarding/photo-07.webp", width: 1400, height: 933 },
];

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-[1180px] flex-col px-6 py-10 sm:px-10 sm:py-14">
      <div className="pt-28 sm:pt-40 md:hidden">
        <BirdIconRow />
      </div>

      <div>
        <div className="mt-8 flex flex-col gap-2 md:mt-[60px]">
          <p className="font-serif-kr text-page-title text-ink">水+羽</p>
          <p className="text-body-small text-muted md:text-[14px]">
            물(수)처럼 자연스럽게 흐르고,
            <br />
            깃(우)처럼 잠시 내려앉았다 다시 날아가는 순간을 담았습니다.
          </p>
        </div>

        <div className="mt-3 md:mt-8">
          <PhotoRow photos={PHOTOS_GROUP_1} />
        </div>

        <p className="mt-16 text-body text-ink sm:mt-20 md:text-[15px]">
          수우의 주류는 음식 곁에 자연스럽게 놓이는 술들입니다.
          <br />
          가볍게 한 잔부터, 긴 밤을 함께 보낼 술까지 준비해두었습니다.
        </p>

        <div className="mt-3 md:mt-8">
          <PhotoRow photos={PHOTOS_GROUP_2} />
        </div>
      </div>
    </div>
  );
}
