import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";

const HeaderProfileNav = () => {
  return (
    <div className="flex items-center">
      <div className="text-right mobile:hidden">
        <p className="text-14 tablet:text-12 font-semibold text-white">
          株式会社YM NEXT
        </p>
        <p className="text-12 text-blue-500">
          10.同意可能数 / 85.オファー送信可能数
        </p>
      </div>
      <Avatar className="ml-4 mobile:ml-0">
        <AvatarImage src="https://i.pravatar.cc/50" alt="User" />
        <AvatarFallback>A</AvatarFallback>
      </Avatar>
    </div>
  );
};

export default HeaderProfileNav;
