import { BirdIconRow } from "@/components/BirdIconRow";
import { PhotoRow } from "@/components/PhotoRow";

const PHOTOS_GROUP_1 = [
  { src: "/onboarding/photo-00.webp", width: 702, height: 479 },
  { src: "/onboarding/photo-01.webp", width: 702, height: 440 },
  { src: "/onboarding/photo-02.webp", width: 702, height: 468 },
  { src: "/onboarding/photo-03.webp", width: 702, height: 1053 },
  { src: "/onboarding/photo-04.webp", width: 702, height: 468 },
];

const PHOTOS_GROUP_2 = [
  { src: "/onboarding/photo-05.webp", width: 702, height: 468 },
  { src: "/onboarding/photo-06.webp", width: 702, height: 968 },
  { src: "/onboarding/photo-07.webp", width: 702, height: 468 },
];

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-[1180px] flex-col px-6 py-10 sm:px-10 sm:py-14">
      <div className="pt-28 sm:pt-40 md:hidden">
        <BirdIconRow />
      </div>

      <div>
        <p className="mt-4 text-body-small text-muted md:mt-0">
          수우의 주류는 음식 곁에 자연스럽게 놓이는 술들입니다.
          <br />
          가볍게 한 잔부터, 긴 밤을 함께 보낼 술까지 준비해두었습니다.
        </p>

        <div className="mt-3">
          <PhotoRow photos={PHOTOS_GROUP_1} />
        </div>

        <p className="mt-16 text-body text-ink sm:mt-20">
          수우는 물처럼 흐르는 시간과 깃처럼 잠시 내려앉는 순간을 담은 이름입니다.
        </p>

        <div className="mt-3">
          <PhotoRow photos={PHOTOS_GROUP_2} />
        </div>
      </div>
    </div>
  );
}
