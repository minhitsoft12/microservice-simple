import { Button } from "@/components/ui/Button.tsx";
import { ShieldAlert } from "lucide-react";
import {
  AppRouteNames,
  appRoutes
} from "@/shared/constants/routes.constant.ts";

export default function Unauthorized() {
  return (
    <div className="min-h-screen bg-[#f2f5f9] flex flex-col">
      <header className="bg-[#1f2c5c] text-white p-4">
        <h1 className="text-2xl font-bold">DYM</h1>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-[#d83f35]/10 p-4 rounded-full">
              <ShieldAlert className="h-16 w-16 text-[#d83f35]" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-[#1f2c5c] mt-4">
            アクセス権限がありません
          </h2>
          <p className="text-gray-500 mt-4 mb-8">
            このページにアクセスする権限がありません。ログインするか、システム管理者にお問い合わせください。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="bg-[#1f2c5c] hover:bg-[#3f4c7c]">
              <a href={appRoutes[AppRouteNames.SIGN_UP]}>ログイン</a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-[#1f2c5c] text-[#1f2c5c]"
            >
              <a href={appRoutes[AppRouteNames.HOME]}>ダッシュボードに戻る</a>
            </Button>
          </div>
        </div>
      </main>

      <footer className="bg-[#1f2c5c] text-[#c8cbd6] p-4 text-xs">
        <div className="flex justify-between flex-wrap">
          <div className="flex space-x-4">
            <a href="#" className="hover:text-white">
              お問い合わせ
            </a>
            <a href="#" className="hover:text-white">
              法人利用規約
            </a>
          </div>
          <div>©2021-2024 DYM Co., Ltd. All rights reserved</div>
        </div>
      </footer>
    </div>
  );
}
