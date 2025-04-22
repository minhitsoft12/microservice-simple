import { Button } from "@/components/ui/Button.tsx";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f2f5f9] flex flex-col">
      <header className="bg-[#1f2c5c] text-white p-4">
        <h1 className="text-2xl font-bold">DYM</h1>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <h2 className="text-9xl font-bold text-[#1f2c5c]">404</h2>
          <h3 className="text-2xl font-bold text-[#1f2c5c] mt-4">ページが見つかりません</h3>
          <p className="text-gray-500 mt-2 mb-8">
            お探しのページは存在しないか、移動した可能性があります。
          </p>
          <Button asChild className="bg-[#1f2c5c] hover:bg-[#3f4c7c]">
            <a href="/">ダッシュボードに戻る</a>
          </Button>
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