import SelectBox from "@/pages/_layout/header/select-box";
import HeaderProfileNav from "@/pages/_layout/header/HeaderProfileNav";
import { cn } from "@/lib/utils";

interface HeaderProps {
  className?: string;
}

const Header = ({ className }: HeaderProps) => {
  return (
    <header className={cn("header", className)}>
      <div className="w-full max-w-64 tablet:max-w-44 mobile:max-w-28 mobile:px-4 p-5 px-10 flex items-center justify-center">
        {/*<Link href="/admin">*/}
        {/*  <Image*/}
        {/*    src={LogoLight}*/}
        {/*    alt="Plus Logo light"*/}
        {/*    sizes="100%"*/}
        {/*    className="h-auto"*/}
        {/*  />*/}
        {/*</Link>*/}
      </div>
      <div className="flex flex-1 items-center justify-between mobile:justify-end p-4 tablet:pl-0">
        <h1 className="text-white pl-10 tablet:pl-0 text-24 tablet:text-16 mobile:hidden font-bold">
          ダッシュボード
        </h1>
        <div className="flex items-center gap-2.5">
          <SelectBox />
          <HeaderProfileNav />
        </div>
      </div>
    </header>
  );
};

export default Header;
