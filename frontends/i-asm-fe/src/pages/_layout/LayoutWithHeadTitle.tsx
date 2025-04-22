import { cn } from "@/lib/utils";

interface LayoutWithHeadTitleProps {
  children?: React.ReactNode;
  title: string;
  subTitle?: string;
  actionRightSide?: React.ReactNode;
  className?: string;
}

const LayoutWithHeadTitle = ({
  children,
  title,
  subTitle,
  className,
  actionRightSide
}: LayoutWithHeadTitleProps) => {
  return (
    <div className="w-full p-10 tablet:p-4 mobile:p-4">
      <div className="flex items-center justify-between border-b border-b-title pb-2.5 mb-5">
        <h3 className="text-20 leading-none font-bold ablet:text-16">
          {title}
          {subTitle && (
            <div className="text-sm text-[#64666B] leading-[1.25rem] pb-[0.625rem] tablet:text-12">
              {subTitle}
            </div>
          )}
        </h3>
        {actionRightSide && actionRightSide}
      </div>
      <div className={cn(className)}>{children}</div>
    </div>
  );
};

export default LayoutWithHeadTitle;
